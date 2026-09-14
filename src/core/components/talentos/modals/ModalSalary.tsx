import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useParams } from "@/core/context/ParamsContext";
import { Modal } from "@/core/components/modals/Modal";
import { useModal } from "@/core/context/ModalContext";
import { useApi } from "@/core/hooks/useApi";
import { TalentSalaryParams } from "@/core/models/params/TalentUpdateParams";
import { BaseResponse, Talent } from "@/core/models";
import { enqueueSnackbar } from "notistack";
import { updateTalentSalary } from "@/core/services/talents.service";
import { handleError, handleResponse } from "@/core/utilities/errorHandler";
import { Loading } from "@/core/components/ui/Loading";
import { TIPO_MODALIDAD } from "@/core/utilities/constants";
import { Input } from "@/core/components/ui/shadcn/input";
import { AppSelect } from "@/core/components/ui/AppSelect";

// --- Helpers ---
const toNumberOrUndef = (val: string | number): number | undefined => {
  if (val === "" || val === null || val === undefined) return undefined;
  const num = Number(val);
  return isNaN(num) || num < 0 ? undefined : Math.round(num * 100) / 100;
};

/** "" del Select = sin valor, como la opción vacía del <select> anterior. */
const toIdOrUndef = (v: string) => (v === "" ? undefined : Number(v));

// Celdas de la tabla de montos: sin caja propia, solo el separador vertical.
const cellSelect =
  "h-auto rounded-none border-0 border-r bg-transparent p-2 text-sm dark:border-slate-700 dark:bg-transparent";
const cellInput =
  "h-auto rounded-none border-0 bg-transparent p-2 text-right text-sm dark:bg-transparent";

// --- Schema con validación cruzada para cada modalidad ---
const salaryBlock = z
  .object({
    coin: z.number().int().optional(),
    min: z.number().positive("Minimo debe ser mayor que 0").optional(),
    max: z.number().positive("Maximo debe ser mayor que 0").optional(),
  })
  .refine(
    (data) => {
      // Si alguno está lleno, los demás deben ser obligatorios
      const filled =
        data.coin !== undefined ||
        data.min !== undefined ||
        data.max !== undefined;
      if (!filled) return true; // todo vacío está bien
      return (
        data.coin !== undefined &&
        data.min !== undefined &&
        data.max !== undefined
      );
    },
    { message: "Debe completar moneda, mínimo y máximo", path: ["coin"] }
  )
  .refine(
    (data) => {
      if (data.min !== undefined && data.max !== undefined) {
        return data.max >= data.min;
      }
      return true;
    },
    { message: "El máximo debe ser mayor o igual al mínimo", path: ["max"] }
  );

const salarySchema = z.object({
  rxh: salaryBlock,
  planilla: salaryBlock,
  // Maestro 3 (NUM1). Opcional aqui, a diferencia de Nuevo Talento: este modal
  // edita talentos ya cargados, y muchos vienen sin el dato. Exigirlo
  // bloquearia guardar un simple ajuste de importes.
  idModalidadFacturacion: z.number().int().optional(),
});

// --- Tipos ---
type SalaryFormData = z.infer<typeof salarySchema>;

interface Props {
  idTalento?: number;
  initPlan?: number;
  endPlan?: number;
  initRxH?: number;
  endRxH?: number;
  idMonedaPlan?: number;
  idMonedaRxh?: number;
  idModalidadFacturacion?: number;
  updateTalentList?: (idTalento: number, fields: Partial<Talent>) => void;
}

export const ModalSalary = ({
  idTalento,
  initPlan,
  endPlan,
  initRxH,
  endRxH,
  idMonedaPlan,
  idMonedaRxh,
  idModalidadFacturacion,
  updateTalentList,
}: Props) => {
  const { paramsByMaestro } = useParams();
  const { closeModal, isModalOpen } = useModal();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SalaryFormData>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      rxh: {
        coin: idMonedaRxh,
        min: initRxH,
        max: endRxH,
      },
      planilla: {
        coin: idMonedaPlan,
        min: initPlan,
        max: endPlan,
      },
      idModalidadFacturacion: idModalidadFacturacion || undefined,
    },
    mode: "onChange",
  });

  // Reiniciar valores al abrir modal
  useEffect(() => {
    if (isModalOpen("modalSalary")) {
      reset({
        rxh: { coin: idMonedaRxh, min: initRxH, max: endRxH },
        planilla: { coin: idMonedaPlan, min: initPlan, max: endPlan },
        idModalidadFacturacion: idModalidadFacturacion || undefined,
      });
    }
  }, [
    isModalOpen,
    reset,
    initPlan,
    endPlan,
    initRxH,
    endRxH,
    idMonedaPlan,
    idMonedaRxh,
    idModalidadFacturacion,
  ]);

  const { loading, fetch: updateData } = useApi<
    BaseResponse,
    TalentSalaryParams
  >(updateTalentSalary, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) => {
      handleResponse({
        response: response,
        showSuccessMessage: true,
        enqueueSnackbar: enqueueSnackbar,
      });
    },
  });

  const monedas = paramsByMaestro[2] || [];
  // Maestro 3, el mismo catalogo que usa Nuevo Talento y el Modal de Ingreso.
  const modalidadesFacturacion = paramsByMaestro[TIPO_MODALIDAD] || [];
  const monedaOptions = monedas.map((m) => ({ value: m.num1, label: m.string1 }));

  const onSubmit = (data: SalaryFormData) => {
    if (!idTalento) return;

    updateData({
      idTalento,
      montoInicialPlanilla: data.planilla.min ?? 0,
      montoFinalPlanilla: data.planilla.max ?? 0,
      montoInicialRxH: data.rxh.min ?? 0,
      montoFinalRxH: data.rxh.max ?? 0,
      // Antes iba un 0 literal, y como el SP escribe la columna sin mirar, cada
      // guardado de importes borraba la modalidad del talento. Ahora va la del
      // formulario y, si no se elige ninguna, la que ya tenia.
      idModalidadFacturacion:
        data.idModalidadFacturacion || idModalidadFacturacion || 0,
      // Enviamos la información de la monedas por modalidad
      idMonedaPlan: data.planilla.coin ?? 0,
      idMonedaRxh: data.rxh.coin ?? 0,
    }).then((response) => {
      if (response.data.idMensaje === 2) {
        handleCloseModal();
        if (idTalento && updateTalentList) {
          updateTalentList(idTalento, {
            montoInicialPlanilla: data.planilla.min ?? 0,
            montoFinalPlanilla: data.planilla.max ?? 0,
            montoInicialRxH: data.rxh.min ?? 0,
            montoFinalRxH: data.rxh.max ?? 0,
            idMonedaPlan: data.planilla.coin ?? 0,
            idMonedaRxh: data.rxh.coin ?? 0,
            idModalidadFacturacion:
              data.idModalidadFacturacion || idModalidadFacturacion || 0,
          });
        }
      }
    });
  };

  const handleCloseModal = () => {
    reset();
    closeModal("modalSalary");
  };

  return (
    <Modal
      id="modalSalary"
      title="Modifica tu banda salarial"
      confirmationLabel="Editar"
      onConfirm={handleSubmit(onSubmit)}
      onClose={handleCloseModal}
    >
      {loading && <Loading opacity="opacity-60" />}

      <div>
        <h3 className="text-[#71717A] text-sm my-3 dark:text-slate-400">
          Agrega el rango de tus expectativas salariales.
        </h3>

        {/* Va antes de los importes porque los condiciona: es lo que decide si
            a lo que pide el talento hay que sumarle cargas patronales. */}
        <div className="mb-4">
          <label
            htmlFor="modalidadFacturacionSalary"
            className="text-[#3f3f46] text-sm block mb-1 dark:text-slate-200"
          >
            Modalidad de facturación
          </label>
          <Controller
            name="idModalidadFacturacion"
            control={control}
            render={({ field }) => (
              <AppSelect
                ref={field.ref}
                id="modalidadFacturacionSalary"
                name={field.name}
                onBlur={field.onBlur}
                value={field.value ?? ""}
                onChange={(v) => field.onChange(toIdOrUndef(v))}
                options={modalidadesFacturacion.map((modalidad) => ({
                  value: modalidad.num1,
                  label: modalidad.string1,
                }))}
                placeholder="Sin definir"
                className="h-auto border-gray-300 p-2 text-sm text-[#3f3f46] dark:border-slate-600 dark:text-slate-200"
              />
            )}
          />
          {errors.idModalidadFacturacion && (
            <span className="text-red-500 text-xs mt-1 block">
              {errors.idModalidadFacturacion.message}
            </span>
          )}
        </div>

        {/* --- Tabla de expectativas salariales --- */}
        <div className="border rounded-lg divide-y dark:border-slate-700">
          {/* RxH */}
          <div>
            <div className="bg-gray-100 text-sm font-medium text-gray-700 p-2 text-center dark:bg-slate-700 dark:text-slate-200">
              Locación de Servicios (RxH)
            </div>
            <div className="grid grid-cols-3 bg-gray-50 text-xs text-gray-600 dark:bg-slate-800 dark:text-slate-300">
              <div className="p-2 border-r dark:border-slate-700">Moneda</div>
              <div className="p-2 border-r text-center dark:border-slate-700">Mínimo</div>
              <div className="p-2 text-center">Máximo</div>
            </div>
            <div className="grid grid-cols-3">
              <Controller
                name="rxh.coin"
                control={control}
                render={({ field }) => (
                  <AppSelect
                    ref={field.ref}
                    name={field.name}
                    onBlur={field.onBlur}
                    aria-label="Moneda RxH"
                    value={field.value ?? ""}
                    onChange={(v) => field.onChange(toIdOrUndef(v))}
                    options={monedaOptions}
                    placeholder="Elija una moneda"
                    className={cellSelect}
                  />
                )}
              />
              <Controller
                name="rxh.min"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    aria-label="Mínimo RxH"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(toNumberOrUndef(e.target.value))
                    }
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`${cellInput} border-r dark:border-slate-700`}
                  />
                )}
              />
              <Controller
                name="rxh.max"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    aria-label="Máximo RxH"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(toNumberOrUndef(e.target.value))
                    }
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={cellInput}
                  />
                )}
              />
            </div>
            {errors.rxh?.coin && (
              <span className="text-red-500 text-xs p-2 block">
                {errors.rxh.coin.message}
              </span>
            )}
            {errors.rxh?.min && (
              <span className="text-red-500 text-xs p-2 block">
                {errors.rxh.min.message}
              </span>
            )}
            {errors.rxh?.max && (
              <span className="text-red-500 text-xs p-2 block">
                {errors.rxh.max.message}
              </span>
            )}
          </div>

          {/* Planilla */}
          <div>
            <div className="bg-gray-100 text-sm font-medium text-gray-700 p-2 text-center dark:bg-slate-700 dark:text-slate-200">
              Régimen General (Planilla)
            </div>
            <div className="grid grid-cols-3 bg-gray-50 text-xs text-gray-600 dark:bg-slate-800 dark:text-slate-300">
              <div className="p-2 border-r dark:border-slate-700">Moneda</div>
              <div className="p-2 border-r text-center dark:border-slate-700">Mínimo</div>
              <div className="p-2 text-center">Máximo</div>
            </div>
            <div className="grid grid-cols-3">
              <Controller
                name="planilla.coin"
                control={control}
                render={({ field }) => (
                  <AppSelect
                    ref={field.ref}
                    name={field.name}
                    onBlur={field.onBlur}
                    aria-label="Moneda planilla"
                    value={field.value ?? ""}
                    onChange={(v) => field.onChange(toIdOrUndef(v))}
                    options={monedaOptions}
                    placeholder="Elija una moneda"
                    className={cellSelect}
                  />
                )}
              />
              <Controller
                name="planilla.min"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    aria-label="Mínimo planilla"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(toNumberOrUndef(e.target.value))
                    }
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`${cellInput} border-r dark:border-slate-700`}
                  />
                )}
              />
              <Controller
                name="planilla.max"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    aria-label="Máximo planilla"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(toNumberOrUndef(e.target.value))
                    }
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={cellInput}
                  />
                )}
              />
            </div>
            {errors.planilla?.coin && (
              <span className="text-red-500 text-xs p-2 block">
                {errors.planilla.coin.message}
              </span>
            )}
            {errors.planilla?.min && (
              <span className="text-red-500 text-xs p-2 block">
                {errors.planilla.min.message}
              </span>
            )}
            {errors.planilla?.max && (
              <span className="text-red-500 text-xs p-2 block">
                {errors.planilla.max.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
