import { Controller, useForm, useWatch } from "react-hook-form";
import {
  DropdownForm,
  InputForm,
  SalaryStructureForm,
} from "../forms";
import { Tabs } from "../ui/Tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EntryFormSchema,
  EntryFormType,
} from "../../models/schemas/EntryFormSchema";
import { useParams } from "../../context/ParamsContext";
import {
  TIPO_MODALIDAD,
  UNIDAD,
  MOTIVO_INGRESO,
  HORARIO_TRABAJO,
  OBJETO_CONTRATO,
  PROYECTO_SERVICIO,
  GROUP_MODALIDAD_LOC_SERVICIOS,
  GROUP_MODALIDAD_PLANILLA,
} from "../../utilities/constants";
import { sedeSunatList } from "../../models/interfaces/SedeSunat";
import { useFetchClients } from "../../hooks/useFetchClients";
import { AsignarTalentoType } from "../../models";
import { useEffect, useState } from "react";
import { useFetchParams } from "../../hooks/useFetchParams";
import { Utils } from "../../utilities/utils";
import { addDays, addWeeks, addMonths, format } from "date-fns";

interface Props {
  onClose: () => void;
  onConfirm: (talento: AsignarTalentoType) => void;
  currentTalent?: AsignarTalentoType | null;
  durationContract?: number;
  durationContractId?: number;
}

export const ModalIngreso = ({
  onClose,
  currentTalent,
  onConfirm,
  durationContract,
  durationContractId,
}: Props) => {
  const {
    paramsByMaestro,
    loading: paramLoading,
    fetchParams,
  } = useFetchParams();
  const { clientes, loading: clientsLoading } = useFetchClients();

  useEffect(() => {
    fetchParams(
      `${TIPO_MODALIDAD},${UNIDAD},${MOTIVO_INGRESO},${HORARIO_TRABAJO},${PROYECTO_SERVICIO},${OBJETO_CONTRATO}`
    );
  }, [fetchParams]);

  const modalityValues = paramsByMaestro[TIPO_MODALIDAD];
  const unitValues = paramsByMaestro[UNIDAD];
  const reasonValues = paramsByMaestro[MOTIVO_INGRESO];
  const horarioTrabajo =
    paramsByMaestro[HORARIO_TRABAJO]?.find((item) => item.num1 === 1)
      ?.string1 || "";

  const proyectoServicio =
    paramsByMaestro[PROYECTO_SERVICIO]?.find(
      (item) => item.num1 === 1
    )?.string1 || "";

  const objetoContrato =
    paramsByMaestro[OBJETO_CONTRATO]?.find((item) => item.num1 === 1)
      ?.string1 || "";

  const defaultUnit = Utils.getPriorityValueFromParams(unitValues);
  const defaultReason =
    Utils.getPriorityValueFromParams(reasonValues);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    clearErrors,
  } = useForm<EntryFormType>({
    resolver: zodResolver(EntryFormSchema),
    mode: "onChange",
    defaultValues: {
      idModalidadContrato: currentTalent?.idModalidadContrato || 0,
      nombres: currentTalent?.nombres || "",
      apellidos: currentTalent?.apellidos || "",
      idArea: currentTalent?.idArea || 0,
      idCliente: currentTalent?.idCliente || 0,
      idMotivo: currentTalent?.idMotivo || 0,
      cargo: currentTalent?.perfil || "",
      horario: horarioTrabajo || "",
      montoBase: currentTalent?.montoBase || 0,
      montoMovilidad: currentTalent?.montoMovilidad || 0,
      montoMensual: currentTalent?.montoMensual || 0,
      montoTrimestral: currentTalent?.montoTrimestral || 0,
      montoSemestral: currentTalent?.montoSemestral || 0,
      fchInicioContrato: currentTalent?.fchInicioContrato || "",
      fchTerminoContrato: "",
      proyectoServicio: proyectoServicio || "",
      objetoContrato: objetoContrato || "",
      declararSunat: currentTalent?.declararSunat || 0,
      tieneEquipo: currentTalent?.tieneEquipo === 1,
      ubicacion: currentTalent?.ubicacion || "",
      idSedeDeclarar:
        sedeSunatList.find(
          (sede) => sede.nombre === currentTalent?.sedeDeclarar
        )?.idSede || 0,
    },
  });

  // Watch para la fecha de inicio de contrato
  const fchInicioContrato = useWatch({
    control,
    name: "fchInicioContrato",
  });

  // Función para calcular la fecha de término basada en la duración del contrato
  const calculateEndDate = (
    startDate: string,
    duration: number,
    durationTypeId: number
  ) => {
    if (!startDate || !duration || !durationTypeId) return "";

    const start = new Date(startDate);
    let endDate: Date;

    switch (durationTypeId) {
      case 1: // Días
        endDate = addDays(start, duration);
        break;
      case 2: // Semanas
        endDate = addWeeks(start, duration);
        break;
      case 3: // Meses
        endDate = addMonths(start, duration);
        break;
      default:
        return "";
    }

    return format(endDate, "yyyy-MM-dd");
  };

  // Efecto para calcular automáticamente la fecha de término
  useEffect(() => {
    if (fchInicioContrato && durationContract && durationContractId) {
      const endDate = calculateEndDate(
        fchInicioContrato,
        durationContract,
        durationContractId
      );
      if (endDate) {
        setValue("fchTerminoContrato", endDate);
        /* console.log("Fecha de inicio:", fchInicioContrato);
        console.log(
          "Duración y tipo:",
          durationContract,
          durationContractId
        );
        console.log("Fecha de término calculada:", endDate); */
      }
    }
  }, [
    fchInicioContrato,
    durationContract,
    durationContractId,
    setValue,
  ]);

  // cargar valores por defecto desde parametros
  useEffect(() => {
    setValue("horario", horarioTrabajo);
    setValue("idArea", defaultUnit);
    setValue("idMotivo", defaultReason);
    setValue("proyectoServicio", proyectoServicio);
    setValue("objetoContrato", objetoContrato);
  }, [
    horarioTrabajo,
    setValue,
    defaultReason,
    defaultUnit,
    proyectoServicio,
    objetoContrato,
  ]);

  const onSubmit = (data: EntryFormType) => {
    if (currentTalent?.idTalento) {
      const updatedTalento: AsignarTalentoType = {
        ...currentTalent,
        ...data,
        sedeDeclarar:
          data.declararSunat === 2
            ? ""
            : sedeSunatList.find(
                (sede) => sede.idSede === data.idSedeDeclarar
              )?.nombre,
        area:
          unitValues.find((unit) => data.idArea === unit.num1)
            ?.string1 || "",
        tieneEquipo: data.tieneEquipo ? 1 : 0,
        ingreso: 1,
        confirmado: true,
        isFromAPI: false,
      };
      onConfirm(updatedTalento);
      onClose();
    }
  };

  const watchedModalidad = useWatch({
    control,
    name: "idModalidadContrato",
  });

  const [enabledSalaryFields, setEnabledSalaryFields] = useState<
    string[]
  >(["montoBase"]);

  useEffect(() => {
    if (!watchedModalidad || !modalityValues) return;

    const selectedModality = modalityValues.find(
      (m) => m.num1 === watchedModalidad
    );

    if (!selectedModality) return;

    const grupo = selectedModality.num2;

    if (grupo === GROUP_MODALIDAD_LOC_SERVICIOS) {
      setValue("declararSunat", 2, { shouldValidate: true });
      setValue("idSedeDeclarar", 0, { shouldValidate: true });
      setEnabledSalaryFields(["montoBase"]);
    }

    if (grupo === GROUP_MODALIDAD_PLANILLA) {
      setValue("declararSunat", 1, { shouldValidate: true });
      setValue("idSedeDeclarar", 1, { shouldValidate: true });
      setEnabledSalaryFields([
        "montoBase",
        "montoMovilidad",
        "montoTrimestral",
        "montoSemestral",
        "montoMensual",
      ]);
    }
  }, [watchedModalidad, modalityValues, setValue]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
      <div className="bg-white rounded-lg shadow-lg p-3 w-full md:w-[90%] lg:w-[1000px] min-h-[570px] overflow-y-auto">
        <div className="flex items-center justify-between p-2">
          <h3 className="text-lg font-medium">Datos de Ingreso</h3>
          <button
            type="button"
            onClick={onClose}
            className="focus:outline-none"
          >
            <img
              src="/assets/ic_close_x.svg"
              alt="icon close"
              className="w-6 h-6"
            />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-between min-h-[500px]"
        >
          <Tabs
            isDataLoading={paramLoading || clientsLoading}
            tabs={[
              {
                label: "General",
                children: (
                  <div className="flex flex-col gap-4 p-2 mt-4">
                    <InputForm
                      name="nombres"
                      control={control}
                      label="Nombres"
                      error={errors.nombres}
                      required={true}
                      disabled={true}
                    />
                    <InputForm
                      name="apellidos"
                      control={control}
                      label="Apellidos"
                      error={errors.apellidos}
                      required={true}
                      disabled={true}
                    />
                    <DropdownForm
                      name="idCliente"
                      control={control}
                      label="Cliente"
                      error={errors.idCliente}
                      options={
                        clientes?.map((client) => ({
                          value: client.idCliente,
                          label: client.razonSocial,
                        })) || []
                      }
                      required={true}
                      disabled={true}
                    />
                    <DropdownForm
                      name="idArea"
                      control={control}
                      label="Área"
                      error={errors.idArea}
                      defaultValue={defaultUnit}
                      options={
                        unitValues?.map((unit) => ({
                          value: unit.num1,
                          label: unit.string1,
                        })) || []
                      }
                      required={true}
                    />
                    <InputForm
                      key={"field-ubicacion"}
                      name="ubicacion"
                      control={control}
                      label="Ubicación"
                      error={errors.ubicacion}
                      required={true}
                    />
                    <Controller
                      name="tieneEquipo"
                      control={control}
                      render={({ field }) => (
                        <div className="flex gap-4">
                          <label className="text-wrap w-[11rem]">
                            ¿Cuenta con equipo?{" "}
                            <span className="text-red-500">*</span>
                            <div>
                              <p className="text-sm text-zinc-500">
                                (Laptop)
                              </p>
                            </div>
                          </label>
                          <div className="flex items-center gap-6">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                className="form-radio h-4 w-4 text-[#0B85C3] focus:ring-[#0B85C3] cursor-pointer"
                                checked={field.value === true}
                                onChange={() => field.onChange(true)}
                                // disabled
                              />
                              <span className="ml-2 text-gray-700">
                                Sí
                              </span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                className="form-radio h-4 w-4 text-[#0B85C3] focus:ring-[#0B85C3] cursor-pointer"
                                checked={field.value === false}
                                onChange={() => field.onChange(false)}
                                // disabled
                              />
                              <span className="ml-2 text-gray-700">
                                No
                              </span>
                            </label>
                          </div>
                          {errors.tieneEquipo && (
                            <p className="text-sm text-red-600 mt-2">
                              {errors.tieneEquipo.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                ),
              },
              {
                label: "Ingreso",
                children: (
                  <div className="flex flex-col gap-4 p-2 mt-4">
                    <DropdownForm
                      name="idModalidadContrato"
                      control={control}
                      label="Modalidad"
                      error={errors.idModalidadContrato}
                      options={
                        modalityValues?.map((modality) => ({
                          value: modality.num1,
                          label: modality.string1,
                        })) || []
                      }
                      required={true}
                    />
                    <DropdownForm
                      name="idMotivo"
                      control={control}
                      label="Motivo de ingreso"
                      error={errors.idMotivo}
                      defaultValue={defaultReason}
                      options={
                        reasonValues?.map((reason) => ({
                          value: reason.num1,
                          label: reason.string1,
                        })) || []
                      }
                      required={true}
                    />
                    <InputForm
                      key={"field-cargo"}
                      name="cargo"
                      control={control}
                      label="Cargo"
                      error={errors.cargo}
                      required={true}
                    />
                    <InputForm
                      key={"field-horario"}
                      name="horario"
                      control={control}
                      label="Horario de trabajo"
                      error={errors.horario}
                      required={true}
                    />
                  </div>
                ),
              },
              {
                label: "Contrato",
                children: (
                  <div className="flex flex-col gap-4 p-2 mt-4">
                    <InputForm
                      name="fchInicioContrato"
                      control={control}
                      label="F. Inicio contrato"
                      type="date"
                      error={errors.fchInicioContrato}
                      required={true}
                    />
                    <InputForm
                      name="fchTerminoContrato"
                      control={control}
                      label="F. Termino contrato"
                      type="date"
                      error={errors.fchTerminoContrato}
                      required={true}
                    />
                    <InputForm
                      key={"field-proyectoServicio"}
                      name="proyectoServicio"
                      control={control}
                      label="Proyecto / Servicio"
                      error={errors.proyectoServicio}
                      required={true}
                    />
                    <InputForm
                      key={"field-objetoContrato"}
                      name="objetoContrato"
                      control={control}
                      label="Objeto del contrato"
                      error={errors.objetoContrato}
                      required={true}
                    />
                  </div>
                ),
              },
              {
                label: "Salario - SUNAT",
                children: (
                  <div className="flex flex-col gap-4 px-1 py-1">
                    {/* SUNAT */}
                    <DropdownForm
                      name="declararSunat"
                      control={control}
                      label="¿Declarado en SUNAT?"
                      error={errors.declararSunat}
                      clearErrorsFrom={["idSedeDeclarar"]}
                      clearErrors={clearErrors}
                      options={[
                        { value: 1, label: "Sí" },
                        { value: 2, label: "No" },
                      ]}
                      word_wrap={true}
                      required={true}
                    />
                    <DropdownForm
                      name="idSedeDeclarar"
                      control={control}
                      label="Sede a declarar"
                      error={errors.idSedeDeclarar}
                      disabled={getValues("declararSunat") === 2}
                      options={sedeSunatList.map((sede) => ({
                        value: sede.idSede,
                        label: sede.nombre,
                      }))}
                      required={false}
                    />
                    <div className="flex justify-center">
                      <SalaryStructureForm
                        control={control}
                        setValue={setValue}
                        enabledFields={enabledSalaryFields}
                        errors={errors}
                        inputs={[
                          {
                            label: "Monto Base",
                            name: "montoBase",
                            type: "number",
                            regex: /^\d*(\.\d{0,2})?$/,
                          },
                          {
                            label: "Monto Movilidad",
                            name: "montoMovilidad",
                            type: "number",
                            regex: /^\d*(\.\d{0,2})?$/,
                          },
                          {
                            label: "Monto Mensual",
                            name: "montoMensual",
                            type: "number",
                            regex: /^\d*(\.\d{0,2})?$/,
                          },
                          {
                            label: "Monto Trimestral",
                            name: "montoTrimestral",
                            type: "number",
                            regex: /^\d*(\.\d{0,2})?$/,
                          },
                          {
                            label: "Monto Semestral",
                            name: "montoSemestral",
                            type: "number",
                            regex: /^\d*(\.\d{0,2})?$/,
                          },
                        ]}
                      />
                    </div>
                  </div>
                ),
              },
            ]}
          />

          <div className="flex justify-end items-center p-2">
            <button className="btn btn-blue" type="submit">
              Aceptar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
