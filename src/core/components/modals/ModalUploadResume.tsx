import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Modal } from "./Modal";
import { enqueueSnackbar } from "notistack";
import {
    confirmTalentUpload,
    generateTalentUploadUrl,
    uploadFileToS3,
} from "../../services/apiService";
import { ARCHIVO_PDF, DOCUMENTO_CV } from "../../utilities/constants";
import { handleError } from "../../utilities/errorHandler";
import { Loading } from "../ui/Loading";
import { validateFile } from "../../utilities/validation";
import { useModal } from "../../context/ModalContext";

interface Props {
    idTalento?: number;
    idArchivo?: number;
    onUpdate: (idTalento: number) => void;
}

export const ModalUploadResume = ({ idTalento, idArchivo, onUpdate }: Props) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const cvRef = useRef<HTMLInputElement>(null);
    const { closeModal } = useModal();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setFileName(file ? file.name : null);
        setError(null);
    };

    const handleOnConfirm = async () => {
        const cv = cvRef.current?.files?.[0];
        if (!cv || !idTalento || !idArchivo) return;

        const validation = validateFile(cv, ['pdf']);
        if (!validation.isValid) {
            setError(validation.message || "Error de validación.");
            return;
        }

        setLoading(true);
        try {
            // 1. Pedir URL PUT pre-firmada al backend
            const { data: presigned } = await generateTalentUploadUrl({
                idTalento,
                idTipoDocumento: DOCUMENTO_CV,
                fileName: cv.name,
                contentType: cv.type,
            });

            if (presigned.result?.idMensaje !== 2) {
                enqueueSnackbar(
                    presigned.result?.mensaje || "No se pudo generar la URL de subida",
                    { variant: "error" },
                );
                return;
            }

            // 2. Subir el archivo directamente a S3
            const s3Response = await uploadFileToS3(presigned.url, cv);
            if (!s3Response.ok) {
                enqueueSnackbar("Error subiendo el archivo a S3", { variant: "error" });
                return;
            }

            if (presigned.requiresConfirm === false) {
                enqueueSnackbar("CV actualizado con éxito", { variant: "success" });
                closeModal("modalUploadResume");
                onUpdate(idTalento);
                return;
            }

            // Al enviar idArchivo se reemplaza el CV existente.
            const { data: confirm } = await confirmTalentUpload({
                idTalento,
                idArchivo,
                idTipoDocumento: DOCUMENTO_CV,
                idTipoArchivo: ARCHIVO_PDF,
                nombreArchivo: presigned.fileName,
                path: presigned.path,
            });

            if (confirm.idMensaje === 2) {
                enqueueSnackbar(confirm.mensaje || "CV actualizado con éxito", {
                    variant: "success",
                });
                closeModal("modalUploadResume");
                onUpdate(idTalento);
            } else {
                enqueueSnackbar(confirm.mensaje || "Error al actualizar el CV", {
                    variant: "error",
                });
            }
        } catch (err) {
            handleError(err, enqueueSnackbar);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal id="modalUploadResume" title="Editar Curriculum Vitae" confirmationLabel="Subir" onConfirm={handleOnConfirm} busy={loading}>
            {loading && (<Loading opacity="opacity-60" />)}
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">Sube tu nuevo Curriculum Vitae.</h3>
                <div className="rounded-lg overflow-hidden py-4">
                    <div className="w-full">
                        <div className="relative h-32 rounded-lg border-2 border-gray-100 flex justify-center items-center hover:bg-gray-100">
                            <div className="absolute flex flex-col items-center py-12">
                                <Upload className="mb-3 mt-6 w-8 h-8 text-[#0b85c3]" />
                                <span className="block text-[#0b85c3] font-normal mt-1">
                                    {fileName || "Sube tu nuevo CV"}
                                </span>
                                <span className="text-sm text-[#71717A] mb-6">{fileName ? "" : "PDF"}</span>
                            </div>
                            <input
                                type="file"
                                name="user-photo"
                                ref={cvRef}
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
