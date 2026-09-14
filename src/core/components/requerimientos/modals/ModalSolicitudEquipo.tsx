import { X } from "lucide-react";
import { DropdownForm, InputForm } from "@/core/components/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "@/core/context/ParamsContext";
import RadioGroupForm from "@/core/components/forms/RadioGroupForm";
import { Dialog, DialogContent, DialogTitle } from "@/core/components/ui/shadcn/dialog";
import { Button } from "@/core/components/ui/shadcn/button";
import {
  ModalSolicitudEquipoFormSchema,
  ModalSolicitudEquipoFormType,
} from "@/core/models/schemas/ModalSolicitudEquipoSchema";
import {
  ANEXO_HARDWARE,
  TIPO_HARDWARE,
  TIPO_SOFTWARE,
  UNIDAD,
} from "@/core/utilities/constants";
import { AsignarTalentoType } from "@/core/models/interfaces/TalentoFMI";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/components/ui/shadcn/tabs";
import { LoadingOverlay } from "@/core/components/ui/LoadingOverlay";
import { format } from "date-fns";

const SI_NO = [
  { label: "Sí", value: "si" },
  { label: "No", value: "no" },
];

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
  const { paramsByMaestro, loading: paramLoading } = useParams();

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
    clearErrors,
    setValue,
    watch,
    trigger,
  } = useForm<ModalSolicitudEquipoFormType>({
    resolver: zodResolver(ModalSolicitudEquipoFormSchema),
    mode: "onChange",
    defaultValues: {
      fechaSolicitud: format(new Date(), "yyyy-MM-dd"),
      fechaEntrega: format(new Date(), "yyyy-MM-dd"),
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

  const fechaSolicitud = watch("fechaSolicitud");
  const fechaEntrega = watch("fechaEntrega");

  useEffect(() => {
    if (!fechaSolicitud || !fechaEntrega) return;

    if (new Date(fechaEntrega) < new Date(fechaSolicitud)) {
      trigger("fechaEntrega");
    } else {
      clearErrors("fechaEntrega");
    }
  }, [fechaSolicitud, fechaEntrega, clearErrors, trigger]);

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
    // Escape equivale a la X (handleCancel); un clic fuera no cierra, como antes.
    <Dialog open onOpenChange={(open) => { if (!open) handleCancel(); }}>
      <DialogContent
        className="block w-full max-w-none md:w-[90%] lg:w-[1000px] min-h-[570px] max-h-[calc(100vh-2rem)] overflow-y-auto p-3"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between p-2">
          <DialogTitle asChild>
            <h3 className="text-lg font-medium">Datos de Solicitud Equipo</h3>
          </DialogTitle>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={handleCancel}
            className="focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-between min-h-[500px]"
        >
          {paramLoading && <LoadingOverlay />}
          {/* forceMount en cada panel: el formulario está repartido entre
              pestañas y sin él se perdería lo escrito al cambiar de una a
              otra. TabsContent oculta las inactivas. */}
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="hardware">Hardware</TabsTrigger>
              <TabsTrigger value="software">Software</TabsTrigger>
            </TabsList>
            <TabsContent value="general" forceMount>
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
            </TabsContent>
            <TabsContent value="hardware" forceMount>
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
                    {/* Una sola rejilla para todo el hardware: todas las
                        etiquetas a la izquierda (antes Celular e Internet Móvil
                        la llevaban encima) y 16 px entre filas, como el resto
                        del modal (antes 32 px). */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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

                      {/* Anexo, Celular e Internet Móvil */}
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
                      <RadioGroupForm
                        name="celular"
                        control={control}
                        label="Celular"
                        orientation="horizontal"
                        options={SI_NO}
                        defaultValue="no"
                      />
                      <RadioGroupForm
                        name="internetMovil"
                        control={control}
                        label="Internet Móvil"
                        orientation="horizontal"
                        options={SI_NO}
                        defaultValue="no"
                      />
                    </div>

                    <InputForm
                      name="accesorios"
                      control={control}
                      label="Accesorios"
                      error={errors.accesorios}
                      required={false}
                    />
                  </div>
            </TabsContent>
            <TabsContent value="software" forceMount>
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
                          {/* Mismo margen en las dos columnas (antes 40 px en
                              Producto y 16 px en Versión). */}
                          <div className="col-span-6 px-2">
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
                            <div className="flex-grow px-2">
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
                                className="ml-1 text-red-500 hover:text-red-700 dark:hover:text-red-300"
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
                      <Button
                        variant="blue"
                        className="mx-1"
                        onClick={addNewSoftwareRow}
                      >
                        Agregar
                      </Button>
                    </div>
                  </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end items-center p-2">
            <Button variant="blue" type="submit" className="mx-1">
              Aceptar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
