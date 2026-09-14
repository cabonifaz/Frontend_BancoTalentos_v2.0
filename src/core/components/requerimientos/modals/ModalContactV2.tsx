import { X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { enqueueSnackbar } from "notistack";
import { usePostHook } from "@/core/hooks/usePostHook";
import { ReqContacto } from "@/core/models/interfaces/ReqContacto";
import {
  AddRQContactSchemaType,
  AddRQContactSchema,
} from "@/core/models/schemas/AddRQContactSchema";
import { Dialog, DialogContent, DialogTitle } from "@/core/components/ui/shadcn/dialog";
import { Button } from "@/core/components/ui/shadcn/button";
import { Input } from "@/core/components/ui/shadcn/input";
import { Checkbox } from "@/core/components/ui/shadcn/checkbox";

interface Props {
  onClose: () => void;
  onContactAdded?: () => void;
  onContactUpdated?: () => void;
  contact?: ReqContacto | null;
  RQState: "new" | "existing";
  modalMode: "add" | "edit";
  idCliente: number;
  idRQ?: number;
}

export const ModalRQContactV2 = ({
  contact,
  onClose,
  onContactAdded,
  onContactUpdated,
  modalMode,
  RQState,
  idCliente,
  idRQ,
}: Props) => {
  const { postData, postloading } = usePostHook();
  const {
    register,
    control,
    reset,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<AddRQContactSchemaType>({
    resolver: zodResolver(AddRQContactSchema),
    reValidateMode: "onChange",
    defaultValues: {
      nombres: contact?.nombre || "",
      apellidoPaterno: contact?.apellidoPaterno || "",
      apellidoMaterno: contact?.apellidoMaterno || "",
      telefono: contact?.telefono || "",
      telefono2: contact?.telefono2 || "",
      correo: contact?.correo || "",
      correo2: contact?.correo2 || "",
      cargo: contact?.cargo || "",
      asignado: contact?.asignado === 1 ? true : false || false,
    },
  });

  const submitData = async () => {
    // Validar el formulario manualmente
    const isValid = await trigger();
    if (!isValid) return;

    const data = getValues();
    let addContactData;
    let updateContactData;

    // Check if it's over an existing RQ or a new one
    if (RQState === "new") {
      addContactData = {
        idCliente: idCliente,
        flagConfirmar: data.asignado ? 1 : 0,
        ...data,
      };
      updateContactData = {
        idClienteContacto: contact?.idClienteContacto,
        flagConfirmar: data.asignado ? 1 : 0,
        ...data,
      };
    } else {
      addContactData = {
        idCliente: idCliente,
        idRq: idRQ,
        flagConfirmar: data.asignado ? 1 : 0,
        ...data,
      };
      updateContactData = {
        idClienteContacto: contact?.idClienteContacto,
        idRq: idRQ,
        flagConfirmar: data.asignado ? 1 : 0,
        ...data,
      };
    }

    switch (modalMode) {
      case "add":
        const responseAdd = await postData(
          "/fmi/client/saveContact",
          addContactData
        );
        if (responseAdd.idTipoMensaje === 2) {
          onContactAdded?.();
          onClose();
          reset();
        }
        break;
      case "edit":
        const responseUpdate = await postData(
          "/fmi/client/updateContact",
          updateContactData
        );
        if (responseUpdate.idTipoMensaje === 2) {
          onContactUpdated?.();
          onClose();
          reset();
        }
        break;
      default:
        enqueueSnackbar("Invalid modal mode", { variant: "warning" });
        return;
    }
  };

  const fields: {
    id: string;
    name: Exclude<keyof AddRQContactSchemaType, "asignado">;
    label: string;
    required?: boolean;
  }[] = [
    { id: "c-name", name: "nombres", label: "Nombres", required: true },
    { id: "c-lastname-1", name: "apellidoPaterno", label: "Apellido paterno", required: true },
    { id: "c-lastname-2", name: "apellidoMaterno", label: "Apellido materno" },
    { id: "c-telefono", name: "telefono", label: "Celular", required: true },
    { id: "c-telefono-2", name: "telefono2", label: "Celular 2" },
    { id: "c-correo", name: "correo", label: "Correo", required: true },
    { id: "c-correo-2", name: "correo2", label: "Correo 2" },
    { id: "c-cargo", name: "cargo", label: "Cargo", required: true },
  ];

  return (
    // Escape cierra como la X; un clic fuera no (como antes).
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="block w-full max-w-none md:w-[90%] lg:w-[500px] min-h-[570px] p-2 sm:p-4"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {postloading && (
          <div className="absolute rounded-lg inset-0 bg-slate-100 bg-opacity-50 flex items-center justify-center z-50 dark:bg-slate-700">
            <div className="bg-white p-4 rounded-lg shadow-sm dark:bg-slate-800">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}
        <DialogTitle className="text-lg font-bold mb-2">
          {modalMode === "add"
            ? "Nuevo Contacto"
            : "Editar Contacto"}
        </DialogTitle>
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute top-4 right-4 focus:outline-none"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.id} className="flex items-center gap-2">
              <label htmlFor={f.id} className="input-label w-1/3">
                {f.label}
                {f.required ? (
                  <span className="text-orange-500">*</span>
                ) : (
                  f.name.endsWith("2") && <span className="text-xs"> (opcional)</span>
                )}
              </label>
              <div className="flex flex-col w-2/3">
                <Input
                  type="text"
                  id={f.id}
                  aria-invalid={!!errors[f.name]}
                  {...register(f.name)}
                />
                {errors[f.name] && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors[f.name]?.message}
                  </span>
                )}
              </div>
            </div>
          ))}

          {RQState === "existing" && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="c-asignado"
                className="input-label w-1/3"
              >
                Asignado<span className="text-orange-500">*</span>
              </label>
              <div className="flex flex-col w-2/3">
                <Controller
                  name="asignado"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="c-asignado"
                      ref={field.ref}
                      checked={!!field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                {errors.asignado && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.asignado.message}
                  </span>
                )}
              </div>
            </div>
          )}

          <Button variant="blue" onClick={submitData} className="mx-1 w-full">
            {modalMode === "add"
              ? "Agregar Contacto"
              : "Actualizar Contacto"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
