import { useRef, useState } from "react";
import { Modal } from "./Modal";
import { useApi } from "../../hooks/useApi";
import { TalentProfilePhotoParams } from "../../models/params/TalentUpdateParams";
import { enqueueSnackbar } from "notistack";
import { BaseResponse, Talent } from "../../models";
import { updateTalentProfilePhoto } from "../../services/apiService";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { Utils } from "../../utilities/utils";
import { ARCHIVO_IMAGEN, DOCUMENTO_FOTO_PERFIL } from "../../utilities/constants";
import { Loading } from "../ui/Loading";
import { validateFile } from "../../utilities/validation";
import { useModal } from "../../context/ModalContext";

interface Props {
    idTalento?: number;
    updateTalentList?: (idTalento: number, fields: Partial<Talent>) => void;
}

export const ModalEditPhoto = ({ idTalento, updateTalentList }: Props) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const photoRef = useRef<HTMLInputElement>(null);
    const { closeModal } = useModal();

    const { loading, fetch: updateData } = useApi<BaseResponse, TalentProfilePhotoParams>(updateTalentProfilePhoto, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setFileName(file ? file.name : null);
        setError(null);
    };

    const handleOnConfirm = async () => {
        if (photoRef.current && photoRef.current.files && idTalento) {
            const photo = photoRef.current.files[0];
            const validation = validateFile(photo, ['png', 'jpeg']);

            if (!validation.isValid) {
                setError(validation.message || "Error de validación.");
                return;
            }

            const photoB64 = await Utils.fileToBase64(photo);

            updateData({
                idTalento: idTalento, fotoArchivo: {
                    stringB64: photoB64,
                    nombreArchivo: Utils.getFileNameWithoutExtension(photo.name),
                    extensionArchivo: Utils.detectarFormatoDesdeBase64(photoB64),
                    idTipoArchivo: ARCHIVO_IMAGEN,
                    idTipoDocumento: DOCUMENTO_FOTO_PERFIL,
                }
            }).then((response) => {
                if (response.data.idMensaje === 2 && updateTalentList && idTalento) {
                    closeModal("modalEditPhoto");
                    updateTalentList(idTalento, { imagen: photoB64 });
                }
            });
        }
    }

    return (
        <Modal id="modalEditPhoto" title="Modifica tu foto de perfil" confirmationLabel="Editar" onConfirm={handleOnConfirm}>
            {loading && (<Loading opacity="opacity-60" />)}
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">Sube una nueva foto de perfil.</h3>
                <div className="rounded-lg overflow-hidden py-4">
                    <div className="w-full">
                        <div className="relative h-32 rounded-lg border-2 border-gray-100 flex justify-center items-center hover:bg-gray-100">
                            <div className="absolute flex flex-col items-center py-12">
                                <img
                                    alt="File Icon"
                                    className="mb-3 mt-6 w-8 h-8"
                                    src={fileName ? "/assets/ic_file_selected.svg" : "/assets/ic_upload.svg"}
                                />
                                <span className="block text-[#0b85c3] font-normal mt-1">
                                    {fileName || "Sube una nueva foto de perfil"}
                                </span>
                                <span className="text-sm text-[#71717A] mb-6">{fileName ? "" : "PNG o JPEG"}</span>
                            </div>
                            <input
                                type="file"
                                name="user-photo"
                                accept=".png, .jpeg"
                                ref={photoRef}
                                onChange={handleFileChange}
                                className="h-full w-full opacity-0 cursor-pointer"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                </div>
            </div>
        </Modal>
    );
}