import { DropdownForm, InputForm } from "../forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "../../context/ParamsContext";
import CheckboxForm from "../forms/CheckboxForm";
import {
  ModalSolicitudEquipoFormSchema,
  ModalSolicitudEquipoFormType,
} from "../../models/schemas/ModalSolicitudEquipoSchema";
import {
  ANEXO_HARDWARE,
  TIPO_HARDWARE,
  TIPO_SOFTWARE,
  UNIDAD,
} from "../../utilities/constants";
import { AsignarTalentoType } from "../../models/interfaces/TalentoFMI";
import { Tabs } from "../ui/Tabs";

interface Props {
  onClose: () => void;
  onConfirm: (talento: AsignarTalentoType) => void;
  onCancel: (talento: AsignarTalentoType) => void;
  currentTalent?: AsignarTalentoType | null;
}

export const ModalSolicitudEquipo = ({
  onClose,
  onConfirm,
  onCancel,
  currentTalent,
}: Props) => {
  const [defaultSoftwareIds, setDefaultSoftwareIds] = useState<string[]>([]);
  const { paramsByMaestro, loading: paramLoading } = useParams(
    `${UNIDAD},${TIPO_HARDWARE},${ANEXO_HARDWARE},${TIPO_SOFTWARE}`,
  );

  const tipoHardwareParams = useMemo(
    () => paramsByMaestro[TIPO_HARDWARE] || [],
    [paramsByMaestro],
  );

  const anexoHardwareParams = useMemo(
    () => paramsByMaestro[ANEXO_HARDWARE] || [],
    [paramsByMaestro],
  );

  const tipoSoftwareParams = useMemo(
    () => paramsByMaestro[TIPO_SOFTWARE] || [],
    [paramsByMaestro],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<ModalSolicitudEquipoFormType>({
    resolver: zodResolver(ModalSolicitudEquipoFormSchema),
    mode: "onChange",
    defaultValues: {
      fechaSolicitud: new Date().toISOString().split("T")[0],
      fechaEntrega: new Date().toISOString().split("T")[0],
      tipoHardware: tipoHardwareParams?.length
        ? tipoHardwareParams[tipoHardwareParams.length - 1].num1
        : 99,
      anexoHardware: anexoHardwareParams?.length
        ? anexoHardwareParams[anexoHardwareParams.length - 1].num1
        : 99,
      isPc: false,
      isLaptop: false,
      procesador: "",
      ram: "",
      disco: "",
      marca: "",
      celular: "no",
      internetMovil: "no",
      accesorios: "",
      software: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "software",
  });

  const addNewSoftwareRow = () => {
    append({ producto: "", version: "" });
  };

  const tipoHardware = watch("tipoHardware");
  const isPcOrLaptop = Number(tipoHardware) === 1 || Number(tipoHardware) === 2;

  const isDefaultSoftware = (id: any) => {
    return defaultSoftwareIds.includes(id);
  };

  useEffect(() => {
    trigger(["procesador", "ram", "disco"]);

    if (isPcOrLaptop) {
      const defaultProductNames =
        tipoSoftwareParams?.map((param) => param.string1) || [];

      const existingDefaultSoftware = fields.filter((field) =>
        defaultProductNames.includes(field.producto ?? ""),
      );

      const existingDefaultProductNames = existingDefaultSoftware.map(
        (field) => field.producto,
      );

      const missingDefaultSoftware =
        tipoSoftwareParams
          ?.filter(
            (param) => !existingDefaultProductNames.includes(param.string1),
          )
          .map((param) => ({
            producto: param.string1,
            version: param.string2,
          })) || [];

      const manualSoftware = fields.filter(
        (field) => !defaultProductNames.includes(field.producto ?? ""),
      );

      const newFields = [
        ...existingDefaultSoftware,
        ...missingDefaultSoftware,
        ...manualSoftware,
      ];

      replace(newFields);

      setTimeout(() => {
        const newDefaultIds = fields
          .filter((field) => defaultProductNames.includes(field.producto ?? ""))
          .map((field) => field.id);
        setDefaultSoftwareIds(newDefaultIds);
      }, 0);
    } else {
      const defaultProductNames =
        tipoSoftwareParams?.map((param) => param.string1) || [];
      const manualSoftware = fields.filter(
        (field) => !defaultProductNames.includes(field.producto ?? ""),
      );
      replace(manualSoftware);
      setDefaultSoftwareIds([]);
    }
    // eslint-disable-next-line
  }, [tipoHardware, tipoSoftwareParams, replace, trigger]);

  const onSubmit = (data: ModalSolicitudEquipoFormType) => {
    if (currentTalent?.idTalento) {
      const updatedTalento: AsignarTalentoType = {
        ...currentTalent,
        solicitudEquipo: {
          fechaSolicitud: data.fechaSolicitud,
          fechaEntrega: data.fechaEntrega,
          idTipoEquipo: data.tipoHardware,
          tipoEquipo:
            tipoHardwareParams.find((param) => param.num1 === data.tipoHardware)
              ?.string1 || "",
          procesador: data.procesador,
          ram: data.ram,
          hd: data.disco,
          marca: data.marca,
          anexo:
            anexoHardwareParams.find(
              (param) => param.num1 === data.anexoHardware,
            )?.string1 || "",
          idAnexo: data.anexoHardware,
          bitCelular: data.celular === "si",
          bitInternetMovil: data.internetMovil === "si",
          accesorios: data.accesorios,
          lstSoftware: data.software.map((sw, index) => ({
            idItem: index + 1,
            producto: sw.producto,
            prodVersion: sw.version,
          })),
        },
      };
      onConfirm(updatedTalento);
      onClose();
    }
  };

  const handleCancel = () => {
    if (currentTalent?.idTalento) {
      const updatedTalento: AsignarTalentoType = {
        ...currentTalent,
        confirmado: false,
      };
      onCancel(updatedTalento);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
      <div className="bg-white rounded-lg shadow-lg p-3 w-full md:w-[90%] lg:w-[1000px] min-h-[570px] overflow-y-auto">
        <div className="flex items-center justify-between p-2">
          <h3 className="text-lg font-medium">Datos de Solicitud Equipo</h3>
          <button
            type="button"
            onClick={handleCancel}
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
            isDataLoading={paramLoading}
            tabs={[
              {
                label: "General",
                children: (
                  <div className="flex flex-col gap-4 p-2 mt-4">
                    <InputForm
                      name="fechaSolicitud"
                      control={control}
                      label="F. Solicitud"
                      type="date"
                      error={errors.fechaSolicitud}
                      required={true}
                    />
                    <InputForm
                      name="fechaEntrega"
                      control={control}
                      label="F. Entrega"
                      type="date"
                      error={errors.fechaEntrega}
                      required={true}
                    />
                  </div>
                ),
              },
              {
                label: "Hardware",
                children: (
                  <div className="flex flex-col gap-4 p-2 mt-4">
                    <DropdownForm
                      name="tipoHardware"
                      control={control}
                      label="Tipo de Equipo"
                      options={
                        tipoHardwareParams?.map((param) => ({
                          value: param.num1,
                          label: param.string1,
                        })) || []
                      }
                      error={errors.tipoHardware}
                      required={true}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InputForm
                        name="procesador"
                        control={control}
                        label={`Procesador`}
                        error={errors.procesador}
                        disabled={!isPcOrLaptop}
                        required={isPcOrLaptop}
                      />
                      <InputForm
                        name="ram"
                        control={control}
                        label={`RAM`}
                        error={errors.ram}
                        disabled={!isPcOrLaptop}
                        required={isPcOrLaptop}
                      />
                      <InputForm
                        name="disco"
                        control={control}
                        label={`Disco Duro`}
                        error={errors.disco}
                        disabled={!isPcOrLaptop}
                        required={isPcOrLaptop}
                      />
                      <InputForm
                        name="marca"
                        control={control}
                        label="Marca (Opcional)"
                        error={errors.marca}
                        disabled={!isPcOrLaptop}
                        required={false}
                      />
                    </div>

                    {/* Anexo, Celular e Internet Móvil */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Anexo Hardware */}
                      <div className="col-span-1 lg:col-span-6">
                        <DropdownForm
                          name="anexoHardware"
                          control={control}
                          label="Anexo"
                          options={
                            anexoHardwareParams?.map((param) => ({
                              value: param.num1,
                              label: param.string1,
                            })) || []
                          }
                          error={errors.anexoHardware}
                          required={true}
                        />
                      </div>

                      {/* Contenedor para Celular e Internet Móvil */}
                      <div className="col-span-1 lg:col-span-6 grid grid-cols-2 gap-6">
                        {/* Celular */}
                        <div className="col-span-1">
                          <label className="block mb-2 font-medium">
                            Celular
                          </label>
                          <div className="flex gap-8">
                            <CheckboxForm
                              name="celular"
                              control={control}
                              label="Sí"
                              value="si"
                              group="celular"
                            />
                            <CheckboxForm
                              name="celular"
                              control={control}
                              label="No"
                              value="no"
                              defaultChecked={true}
                              group="celular"
                            />
                          </div>
                        </div>

                        {/* Internet Móvil */}
                        <div className="col-span-1">
                          <label className="block mb-2 font-medium">
                            Internet Móvil
                          </label>
                          <div className="flex gap-8">
                            <CheckboxForm
                              name="internetMovil"
                              control={control}
                              label="Sí"
                              value="si"
                              group="internetMovil"
                            />
                            <CheckboxForm
                              name="internetMovil"
                              control={control}
                              label="No"
                              value="no"
                              defaultChecked={true}
                              group="internetMovil"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <InputForm
                      name="accesorios"
                      control={control}
                      label="Accesorios"
                      error={errors.accesorios}
                      required={false}
                    />
                  </div>
                ),
              },
              {
                label: "Software",
                children: (
                  <div className="flex flex-col gap-4 p-2 mt-4">
                    {/* Tabla con scroll horizontal en móvil */}
                    <div className="min-w-[500px]">
                      {/* Encabezado de la tabla */}
                      <div className="grid grid-cols-12 gap-2 mb-2">
                        <div className="col-span-1 text-sm font-medium flex items-center justify-center">
                          Item
                        </div>
                        <div className="col-span-6 text-sm font-medium flex items-center justify-center">
                          Producto
                        </div>
                        <div className="col-span-5 text-sm font-medium flex items-center justify-center">
                          Versión
                        </div>
                      </div>

                      {/* Filas de la tabla */}
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="grid grid-cols-12 gap-2 mb-2"
                        >
                          {/* Columna Item */}
                          <div className="col-span-1 flex items-center justify-center">
                            {index + 1}
                          </div>

                          {/* Columna Producto - eliminando espacio extra */}
                          <div className="col-span-6 px-10">
                            <div className="w-full">
                              <InputForm
                                name={`software.${index}.producto`}
                                control={control}
                                label=""
                                error={errors.software?.[index]?.producto}
                                isTable={true}
                                required={false}
                              />
                            </div>
                          </div>

                          {/* Columna Versión - eliminando espacio extra */}
                          <div className="col-span-5 flex items-center">
                            <div className="flex-grow px-4">
                              <InputForm
                                name={`software.${index}.version`}
                                control={control}
                                label=""
                                error={errors.software?.[index]?.version}
                                isTable={true}
                                required={false}
                              />
                            </div>
                            {/* Solo mostrar botón de eliminar para software NO predeterminado */}
                            {!isDefaultSoftware(field.id) && (
                              <button
                                type="button"
                                className="ml-1 text-red-500 hover:text-red-700"
                                onClick={() => remove(index)}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Botón para agregar nueva fila */}
                    <div className="mt-4">
                      <button
                        type="button"
                        className="btn btn-blue"
                        onClick={addNewSoftwareRow}
                      >
                        Agregar
                      </button>
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
