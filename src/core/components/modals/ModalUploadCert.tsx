import { useRef, useState } from "react";
import { Modal } from "./Modal";
import { enqueueSnackbar } from "notistack";
import { useModal } from "../../context/ModalContext";
import { useApi } from "../../hooks/useApi";
import { BaseResponse } from "../../models";
import { TalentCertParams } from "../../models/params/TalentUpdateParams";
import { uploadTalentCert } from "../../services/apiService";
import { ARCHIVO_PDF, DOCUMENTO_CERT_DIP } from "../../utilities/constants";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { Utils } from "../../utilities/utils";
import { Loading } from "../ui/Loading";
import { validateFile } from "../../utilities/validation";

interface Props {
    idTalento?: number
    onUpdate?: () => void;
}

export const ModalUploadCert = ({ idTalento, onUpdate }: Props) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const certRef = useRef<HTMLInputElement>(null);
    const { closeModal } = useModal();

    const { loading, fetch: updateData } = useApi<BaseResponse, TalentCertParams>(uploadTalentCert, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => {
            handleResponse(response, enqueueSnackbar);

            if (response.data.idMensaje === 2) {
                if (onUpdate) onUpdate();
                closeModal("modalUploadCert");
                enqueueSnackbar("Actualizado", { variant: 'success' });
            }
        },
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setFileName(file ? file.name : null);
        setError(null);
    };

    const handleOnConfirm = async () => {
        if (certRef.current && certRef.current.files && idTalento) {
            const cert = certRef.current.files[0];
            const validation = validateFile(cert, ['pdf']);

            if (!validation.isValid) {
                setError(validation.message || "Error de validación.");
                return;
            }

            const certB64 = await Utils.fileToBase64(cert);

            updateData({
                idTalento: idTalento, certArchivo: {
                    stringB64: certB64,
                    nombreArchivo: Utils.getFileNameWithoutExtension(cert.name),
                    extensionArchivo: "pdf",
                    idTipoArchivo: ARCHIVO_PDF,
                    idTipoDocumento: DOCUMENTO_CERT_DIP,
                }
            });
        }
    }

    return (
        <Modal id="modalUploadCert" title="Subir un certificado o diploma" confirmationLabel="Subir" onConfirm={handleOnConfirm}>
            {loading && (<Loading opacity="opacity-60" />)}
            <div>
                <div className="rounded-lg overflow-hidden py-4">
                    <div className="w-full">
                        <div className="relative h-32 rounded-lg border-2 border-gray-100 flex justify-center items-center hover:bg-gray-100">
                            <div className="absolute flex flex-col items-center py-12">
                                <img
                                    alt="File Icon"
                                    className="mb-3 mt-6 w-8 h-8"
                                    src="/assets/ic_upload.svg"
                                />
                                <span className="block text-[#0b85c3] font-normal mt-1">
                                    {fileName || "Sube tu nuevo certificado o diploma"}
                                </span>
                                <span className="text-sm text-[#71717A] mb-6">{fileName ? "" : "PDF"}</span>
                            </div>
                            <input
                                type="file"
                                name="user-photo"
                                ref={certRef}
                                accept=".pdf"
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