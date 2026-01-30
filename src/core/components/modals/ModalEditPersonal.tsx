import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { usePostHook } from "../../hooks/usePostHook";
import { Talent } from "../../models/interfaces/Talent";
import { EditTalentPersonalSchema, EditTalentPersonalSchemaType } from "../../models/schemas/EditTalentPersonalSchema";

interface Props {
  talent: Talent;
  onClose: () => void;
  onUpdated: () => void;
}

export const ModalEditPersonal = ({ talent, onClose, onUpdated }: Props) => {
  const { postData, postloading } = usePostHook();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditTalentPersonalSchemaType>({
    resolver: zodResolver(EditTalentPersonalSchema),
    defaultValues: {
      nombres: talent.nombres,
      apellidoPaterno: talent.apellidoPaterno,
      apellidoMaterno: talent.apellidoMaterno,
      pais: talent.pais,
      dni:  "", 
    },
  });

  const onSubmit = async (data: EditTalentPersonalSchemaType) => {
    // "Mapeo DTO"
    const updateData = {
      idTalento: talent.idTalento,
      ...data
    };

    const response = await postData("/fmi/talent/updatePersonalData", updateData);
    if (response.idTipoMensaje === 2) {
      onUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-[450px] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Editar Datos Personales</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
             <img src="/assets/ic_close_x.svg" alt="close" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Nombres */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Nombres</label>
            <input {...register("nombres")} className="input w-full mt-1" />
            {errors.nombres && <p className="text-red-500 text-xs">{errors.nombres.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Ap. Paterno</label>
              <input {...register("apellidoPaterno")} className="input w-full mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Ap. Materno</label>
              <input {...register("apellidoMaterno")} className="input w-full mt-1" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Nacionalidad (País)</label>
            <input {...register("pais")} className="input w-full mt-1" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">DNI / Documento</label>
            <input {...register("dni")} className="input w-full mt-1" />
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={postloading} className="btn-primary flex-1 bg-teal-600 text-white py-2 rounded">
              {postloading ? "Guardando..." : "Actualizar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};