import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useParams } from "../../context/ParamsContext";
import { Modal } from "./Modal";
import { useModal } from "../../context/ModalContext";
import { useApi } from "../../hooks/useApi";
import { TalentSalaryParams } from "../../models/params/TalentUpdateParams";
import { BaseResponse, Talent } from "../../models";
import { enqueueSnackbar } from "notistack";
import { updateTalentSalary } from "../../services/apiService";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { Loading } from "../ui/Loading";
import { TIPO_MODALIDAD } from "../../utilities/constants";

// --- Helpers ---
const toNumberOrUndef = (val: string | number): number | undefined => {
  if (val === "" || val === null || val === undefined) return undefined;
  const num = Number(val);
  return isNaN(num) || num < 0 ? undefined : Math.round(num * 100) / 100;
};

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
        <h3 className="text-[#71717A] text-sm my-3">
          Agrega el rango de tus expectativas salariales.
        </h3>

        {/* Va antes de los importes porque los condiciona: es lo que decide si
            a lo que pide el talento hay que sumarle cargas patronales. */}
        <div className="mb-4">
          <label
            htmlFor="modalidadFacturacionSalary"
            className="text-[#3f3f46] text-sm block mb-1"
          >
            Modalidad de facturación
          </label>
          <Controller
            name="idModalidadFacturacion"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                id="modalidadFacturacionSalary"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === ""
                      ? undefined
                      : Number(e.target.value)
                  )
                }
                className="text-[#3f3f46] p-2 w-full border border-gray-300 rounded-lg focus:outline-none cursor-pointer text-sm"
              >
                <option value="">Sin definir</option>
                {modalidadesFacturacion.map((modalidad) => (
                  <option
                    key={modalidad.idParametro}
                    value={modalidad.num1}
                  >
                    {modalidad.string1}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.idModalidadFacturacion && (
            <span className="text-red-500 text-xs mt-1 block">
              {errors.idModalidadFacturacion.message}
            </span>
          )}
        </div>

        {/* --- Tabla de expectativas salariales --- */}
        <div className="border rounded-lg divide-y">
          {/* RxH */}
          <div>
            <div className="bg-gray-100 text-sm font-medium text-gray-700 p-2 text-center">
              Locación de Servicios (RxH)
            </div>
            <div className="grid grid-cols-3 bg-gray-50 text-xs text-gray-600">
              <div className="p-2 border-r">Moneda</div>
              <div className="p-2 border-r text-center">Mínimo</div>
              <div className="p-2 text-center">Máximo</div>
            </div>
            <div className="grid grid-cols-3">
              <Controller
                name="rxh.coin"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                    className="p-2 border-r text-sm"
                  >
                    <option value="">Elija una moneda</option>
                    {monedas.map((monedaOption) => (
                      <option
                        key={monedaOption.idParametro}
                        value={monedaOption.num1}
                      >
                        {monedaOption.string1}
                      </option>
                    ))}
                  </select>
                )}
              />
              <Controller
                name="rxh.min"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(toNumberOrUndef(e.target.value))
                    }
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="p-2 border-r text-sm text-right outline-none"
                  />
                )}
              />
              <Controller
                name="rxh.max"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(toNumberOrUndef(e.target.value))
                    }
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="p-2 text-sm text-right outline-none"
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
            <div className="bg-gray-100 text-sm font-medium text-gray-700 p-2 text-center">
              Régimen General (Planilla)
            </div>
            <div className="grid grid-cols-3 bg-gray-50 text-xs text-gray-600">
              <div className="p-2 border-r">Moneda</div>
              <div className="p-2 border-r text-center">Mínimo</div>
              <div className="p-2 text-center">Máximo</div>
            </div>
            <div className="grid grid-cols-3">
              <Controller
                name="planilla.coin"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                    className="p-2 border-r text-sm"
                  >
                    <option value="">Elija una moneda</option>
                    {monedas.map((monedaOption) => (
                      <option
                        key={monedaOption.idParametro}
                        value={monedaOption.num1}
                      >
                        {monedaOption.string1}
                      </option>
                    ))}
                  </select>
                )}
              />
              <Controller
                name="planilla.min"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(toNumberOrUndef(e.target.value))
                    }
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="p-2 border-r text-sm text-right outline-none"
                  />
                )}
              />
              <Controller
                name="planilla.max"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(toNumberOrUndef(e.target.value))
                    }
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="p-2 text-sm text-right outline-none"
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
