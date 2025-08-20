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
import { MODALIDAD_PLANILLA, MODALIDAD_RXH } from "../../utilities/constants";

interface Props {
  idTalento?: number;
  idMoneda?: number;
  idModalidadFacturacion?: number;
  moneda?: string;
  initPlan?: number;
  endPlan?: number;
  initRxH?: number;
  endRxH?: number;
  updateTalentList?: (idTalento: number, fields: Partial<Talent>) => void;
}

// Esquema de validación con Zod - SIN transform para mantener string en el form
const salarySchema = z
  .object({
    idMoneda: z.number().min(1, "La moneda es requerida"),
    idModalidadFacturacion: z
      .number()
      .min(1, "La modalidad de facturación es requerida"),
    montoInicial: z
      .string()
      .min(1, "El monto inicial es requerido")
      .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
        message: "Formato de monto inválido",
      })
      .refine(
        (val) => {
          const num = Number(val);
          return num > 0;
        },
        {
          message: "El monto inicial debe ser mayor a 0",
        },
      ),
    montoFinal: z
      .string()
      .min(1, "El monto final es requerido")
      .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
        message: "Formato de monto inválido",
      })
      .refine(
        (val) => {
          const num = Number(val);
          return num > 0;
        },
        {
          message: "El monto final debe ser mayor a 0",
        },
      ),
  })
  .refine(
    (data) => {
      const inicial = Number(data.montoInicial);
      const final = Number(data.montoFinal);
      return final >= inicial;
    },
    {
      message: "El monto final debe ser mayor o igual al inicial",
      path: ["montoFinal"],
    },
  );

// Tipo para el formulario (mantiene strings)
type SalaryFormData = {
  idMoneda: number;
  idModalidadFacturacion: number;
  montoInicial: string;
  montoFinal: string;
};

// Tipo para los datos enviados a la API (con numbers)
type SalaryApiData = {
  idMoneda: number;
  idModalidadFacturacion: number;
  montoInicial: number;
  montoFinal: number;
};

export const ModalSalary = ({
  idTalento,
  idMoneda,
  moneda,
  initPlan,
  endPlan,
  initRxH,
  endRxH,
  idModalidadFacturacion,
  updateTalentList,
}: Props) => {
  const { paramsByMaestro } = useParams();
  const { closeModal, isModalOpen } = useModal();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<SalaryFormData>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      idMoneda: idMoneda || 0,
      idModalidadFacturacion: idModalidadFacturacion || 0,
      montoInicial: "",
      montoFinal: "",
    },
    mode: "onChange",
  });

  // Efecto para inicializar valores cuando el modal se abre
  useEffect(() => {
    if (isModalOpen("modalSalary")) {
      const montoInicial =
        idModalidadFacturacion === MODALIDAD_RXH
          ? initRxH?.toString() || ""
          : initPlan?.toString() || "";

      const montoFinal =
        idModalidadFacturacion === MODALIDAD_RXH
          ? endRxH?.toString() || ""
          : endPlan?.toString() || "";

      // No validar al inicializar
      setValue("idModalidadFacturacion", idModalidadFacturacion || 0, {
        shouldValidate: false,
      });
      setValue("idMoneda", idMoneda || 0, { shouldValidate: false });
      setValue("montoInicial", montoInicial, { shouldValidate: false });
      setValue("montoFinal", montoFinal, { shouldValidate: false });
    }
  }, [
    isModalOpen,
    idModalidadFacturacion,
    idMoneda,
    initPlan,
    endPlan,
    initRxH,
    endRxH,
    setValue,
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
  const modalidadFacturacionOptions = paramsByMaestro[32] || [];

  const handleNumberInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void,
  ) => {
    let inputValue = e.target.value;

    // Permitir solo números y punto decimal
    if (/^(\d+\.?\d*|\.\d+)$/.test(inputValue) || inputValue === "") {
      if (inputValue.includes(".")) {
        const parts = inputValue.split(".");
        if (parts[1].length > 2) {
          inputValue = parts[0] + "." + parts[1].substring(0, 2);
        }
      }
      onChange(inputValue);
    } else if (inputValue === ".") {
      onChange("0.");
    }
  };

  const onSubmit = (data: SalaryFormData) => {
    if (!idTalento) return;

    // Convertir strings a numbers para la API
    const apiData: SalaryApiData = {
      idMoneda: data.idMoneda,
      idModalidadFacturacion: data.idModalidadFacturacion,
      montoInicial: Number(data.montoInicial),
      montoFinal: Number(data.montoFinal),
    };

    const initPlanilla =
      apiData.idModalidadFacturacion === MODALIDAD_PLANILLA
        ? apiData.montoInicial
        : 0;
    const endPlanilla =
      apiData.idModalidadFacturacion === MODALIDAD_PLANILLA
        ? apiData.montoFinal
        : 0;
    const initRxH =
      apiData.idModalidadFacturacion === MODALIDAD_RXH
        ? apiData.montoInicial
        : 0;
    const endRxH =
      apiData.idModalidadFacturacion === MODALIDAD_RXH ? apiData.montoFinal : 0;

    updateData({
      idTalento,
      idMoneda: apiData.idMoneda,
      montoInicialPlanilla: initPlanilla,
      montoFinalPlanilla: endPlanilla,
      montoInicialRxH: initRxH,
      montoFinalRxH: endRxH,
      idModalidadFacturacion: apiData.idModalidadFacturacion,
    }).then((response) => {
      if (response.data.idMensaje === 2) {
        handleCloseModal();
        if (idTalento && updateTalentList) {
          updateTalentList(idTalento, {
            moneda: moneda,
            idModalidadFacturacion: idModalidadFacturacion,
            montoInicialPlanilla: initPlan || 0,
            montoFinalPlanilla: endPlan || 0,
            montoInicialRxH: initRxH || 0,
            montoFinalRxH: endRxH || 0,
          });
        }
      }
    });
  };

  const handleCloseModal = () => {
    // Resetear el formulario al cerrar el modal
    reset(
      {
        idMoneda: idMoneda || 0,
        idModalidadFacturacion: idModalidadFacturacion || 0,
        montoInicial:
          idModalidadFacturacion === MODALIDAD_RXH
            ? initRxH?.toString() || ""
            : initPlan?.toString() || "",
        montoFinal:
          idModalidadFacturacion === MODALIDAD_RXH
            ? endRxH?.toString() || ""
            : endPlan?.toString() || "",
      },
      {
        keepErrors: false, // limpiar errores
      },
    );
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Moneda */}
          <div className="flex flex-col gap-1">
            <label htmlFor="idMoneda" className="input-label">
              Moneda
            </label>
            <Controller
              name="idMoneda"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="idMoneda"
                  className="input w-full"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                  }}
                >
                  <option value={0}>Seleccione una moneda</option>
                  {monedas.map((monedaOption) => (
                    <option
                      key={monedaOption.idParametro}
                      value={monedaOption.num1}
                      data-code={
                        monedaOption.num1 === 3
                          ? monedaOption.string2
                          : monedaOption.string3
                      }
                    >
                      {monedaOption.string1}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.idMoneda && (
              <p className="text-red-500 text-sm mt-2">
                {errors.idMoneda.message}
              </p>
            )}
          </div>

          {/* Modalidad de facturación */}
          <div className="flex flex-col gap-1">
            <label htmlFor="idModalidadFacturacion" className="input-label">
              Modalidad de facturación
            </label>
            <Controller
              name="idModalidadFacturacion"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="idModalidadFacturacion"
                  className="input w-full"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                  }}
                >
                  <option value={0}>
                    Seleccione la modalidad de facturación
                  </option>
                  {modalidadFacturacionOptions.map((mod) => (
                    <option key={mod.idParametro} value={mod.num1}>
                      {mod.string1}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.idModalidadFacturacion && (
              <p className="text-red-500 text-sm mt-2">
                {errors.idModalidadFacturacion.message}
              </p>
            )}
          </div>

          {/* Montos */}
          <h3 className="w-full my-2">Montos</h3>
          <div className="flex w-full gap-8">
            {/* Monto Inicial */}
            <div className="flex flex-col w-1/2">
              <label htmlFor="montoInicial" className="input-label">
                Monto inicial
              </label>
              <Controller
                name="montoInicial"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="montoInicial"
                    value={field.value}
                    onWheel={(e) => e.currentTarget.blur()}
                    onFocus={(e) => e.currentTarget.select()}
                    className="input"
                    inputMode="decimal"
                    placeholder="Ej: 1000.00"
                    onChange={(e) => handleNumberInput(e, field.onChange)}
                  />
                )}
              />
              {errors.montoInicial && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.montoInicial.message}
                </p>
              )}
            </div>

            {/* Monto Final */}
            <div className="flex flex-col w-1/2">
              <label htmlFor="montoFinal" className="input-label">
                Monto final
              </label>
              <Controller
                name="montoFinal"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="montoFinal"
                    value={field.value}
                    onFocus={(e) => e.currentTarget.select()}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="input"
                    inputMode="decimal"
                    placeholder="Ej: 2000.00"
                    onChange={(e) => handleNumberInput(e, field.onChange)}
                  />
                )}
              />
              {errors.montoFinal && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.montoFinal.message}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
