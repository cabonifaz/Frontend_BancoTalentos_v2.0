import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { usePostHook } from "../../hooks/usePostHook";
import { Talent } from "../../models/interfaces/Talent";
import {
  EditTalentPersonalSchema,
  EditTalentPersonalSchemaType,
} from "../../models/schemas/EditTalentPersonalSchema";
import { Modal } from "./Modal";

interface Props {
  talent?: Talent;
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
      nombres: talent?.nombres,
      apellidoPaterno: talent?.apellidoPaterno,
      apellidoMaterno: talent?.apellidoMaterno,
      pais: talent?.pais,
      dni: "",
    },
  });

  const onSubmit = async (data: EditTalentPersonalSchemaType) => {
    // "Mapeo DTO"
    const updateData = {
      idTalento: talent?.idTalento,
      ...data,
    };

    const response = await postData(
      "/fmi/talent/updatePersonalData",
      updateData,
    );
    if (response.idTipoMensaje === 2) {
      onUpdated();
      onClose();
    }
  };

  return (
    <Modal
      id="modalEditPersonal"
      title="Editar perfil"
      confirmationLabel="Guardar"
      onConfirm={handleSubmit(onSubmit)}
    >
      <div>
        <div className="rounded-lg overflow-hidden py-4">
          <div className="w-full">
            <div className="relative h-32 rounded-lg border-2 border-gray-100 flex justify-center items-center hover:bg-gray-100"></div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
