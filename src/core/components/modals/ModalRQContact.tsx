import { ReqContacto } from "../../models/interfaces/ReqContacto";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  AddRQContactSchemaType,
  AddRQContactSchema,
} from "../../models/schemas/AddRQContactSchema";
import { usePostHook } from "../../hooks/usePostHook";
import { enqueueSnackbar } from "notistack";

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

export const ModalRQContact = ({
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
    handleSubmit,
    reset,
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

  const submitData: SubmitHandler<AddRQContactSchemaType> = async (data) => {
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

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60]">
        <div className="bg-white rounded-lg shadow-lg p-2 sm:p-4 relative w-full md:w-[90%] lg:w-[500px] min-h-[570px]">
          {postloading && (
            <div className="absolute rounded-lg inset-0 bg-slate-100 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}
          <h2 className="text-lg font-bold mb-2">
            {modalMode === "add" ? "Nuevo Contacto" : "Editar Contacto"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 focus:outline-none"
          >
            <img
              src="/assets/ic_close_x.svg"
              alt="icon close"
              className="w-6 h-6"
            />
          </button>

          <form className="space-y-4" onSubmit={handleSubmit(submitData)}>
            <div className="flex items-center gap-2">
              <label htmlFor="c-name" className="input-label w-1/3">
                Nombres<span className="text-orange-500">*</span>
              </label>
              <div className="flex flex-col w-2/3">
                <input
                  type="text"
                  id="c-name"
                  className="input"
                  {...register("nombres")}
                />
                {errors.nombres && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.nombres.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="c-lastname-1" className="input-label w-1/3">
                Apellido paterno<span className="text-orange-500">*</span>
              </label>
              <div className="flex flex-col w-2/3">
                <input
                  type="text"
                  id="c-lastname-1"
                  className="input"
                  {...register("apellidoPaterno")}
                />
                {errors.apellidoPaterno && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.apellidoPaterno.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="c-lastname-2" className="input-label w-1/3">
                Apellido materno
              </label>
              <div className="flex flex-col w-2/3">
                <input
                  type="text"
                  id="c-lastname-2"
                  className="input"
                  {...register("apellidoMaterno")}
                />
                {errors.apellidoMaterno && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.apellidoMaterno.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="c-telefono" className="input-label w-1/3">
                Celular<span className="text-orange-500">*</span>
              </label>
              <div className="flex flex-col w-2/3">
                <input
                  type="text"
                  id="c-telefono"
                  className="input"
                  {...register("telefono")}
                />
                {errors.telefono && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.telefono.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="c-telefono-2" className="input-label w-1/3">
                Celular 2 <span className="text-xs">(opcional)</span>
              </label>
              <div className="flex flex-col w-2/3">
                <input
                  type="text"
                  id="c-telefono-2"
                  className="input"
                  {...register("telefono2")}
                />
                {errors.telefono2 && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.telefono2.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="c-correo" className="input-label w-1/3">
                Correo<span className="text-orange-500">*</span>
              </label>
              <div className="flex flex-col w-2/3">
                <input
                  type="text"
                  id="c-correo"
                  className="input"
                  {...register("correo")}
                />
                {errors.correo && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.correo.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="c-correo-2" className="input-label w-1/3">
                Correo 2 <span className="text-xs">(opcional)</span>
              </label>
              <div className="flex flex-col w-2/3">
                <input
                  type="text"
                  id="c-correo-2"
                  className="input"
                  {...register("correo2")}
                />
                {errors.correo2 && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.correo2.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="c-cargo" className="input-label w-1/3">
                Cargo<span className="text-orange-500">*</span>
              </label>
              <div className="flex flex-col w-2/3">
                <input
                  type="text"
                  id="c-cargo"
                  className="input"
                  {...register("cargo")}
                />
                {errors.cargo && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.cargo.message}
                  </span>
                )}
              </div>
            </div>

            {RQState === "existing" && (
              <div className="flex items-center gap-2">
                <label htmlFor="c-asignado" className="input-label w-1/3">
                  Asignado<span className="text-orange-500">*</span>
                </label>
                <div className="flex flex-col w-2/3">
                  <input
                    type="checkbox"
                    id="c-asignado"
                    className="input-checkbox"
                    {...register("asignado")}
                  />
                  {errors.asignado && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.asignado.message}
                    </span>
                  )}
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-blue w-full">
              {modalMode === "add" ? "Agregar Contacto" : "Actualizar Contacto"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
