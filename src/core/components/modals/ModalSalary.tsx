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
    },
    mode: "onChange",
  });

  // Reiniciar valores al abrir modal
  useEffect(() => {
    if (isModalOpen("modalSalary")) {
      reset({
        rxh: { coin: idMonedaRxh, min: initRxH, max: endRxH },
        planilla: { coin: idMonedaPlan, min: initPlan, max: endPlan },
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

  const onSubmit = (data: SalaryFormData) => {
    if (!idTalento) return;

    updateData({
      idTalento,
      montoInicialPlanilla: data.planilla.min ?? 0,
      montoFinalPlanilla: data.planilla.max ?? 0,
      montoInicialRxH: data.rxh.min ?? 0,
      montoFinalRxH: data.rxh.max ?? 0,
      idModalidadFacturacion: 0,
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
