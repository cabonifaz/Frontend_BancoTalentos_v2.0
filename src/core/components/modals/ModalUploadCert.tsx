import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Modal } from "./Modal";
import { enqueueSnackbar } from "notistack";
import {
  confirmTalentUpload,
  generateTalentUploadUrl,
  uploadFileToS3,
} from "../../services/apiService";
import { ARCHIVO_PDF, DOCUMENTO_CERT_DIP } from "../../utilities/constants";
import { handleError } from "../../utilities/errorHandler";
import { Loading } from "../ui/Loading";
import { validateFile } from "../../utilities/validation";
import { useModal } from "../../context/ModalContext";

interface Props {
    idTalento?: number
    onUpdate: (idTalento: number) => void;
}

export const ModalUploadCert = ({ idTalento, onUpdate }: Props) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const certRef = useRef<HTMLInputElement>(null);
    const { closeModal } = useModal();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setFileName(file ? file.name : null);
        setError(null);
    };

    const handleOnConfirm = async () => {
        const cert = certRef.current?.files?.[0];
        if (!cert || !idTalento) return;

        const validation = validateFile(cert, ['pdf']);
        if (!validation.isValid) {
            setError(validation.message || "Error de validación.");
            return;
        }

        setLoading(true);
        try {
            // 1. Pedir URL PUT pre-firmada al backend
            const { data: presigned } = await generateTalentUploadUrl({
                idTalento,
                idTipoDocumento: DOCUMENTO_CERT_DIP,
                fileName: cert.name,
                contentType: cert.type,
            });

            if (presigned.result?.idMensaje !== 2) {
                enqueueSnackbar(
                    presigned.result?.mensaje || "No se pudo generar la URL de subida",
                    { variant: "error" },
                );
                return;
            }

            // 2. Subir el archivo directamente a S3
            const s3Response = await uploadFileToS3(presigned.url, cert);
            if (!s3Response.ok) {
                enqueueSnackbar("Error subiendo el archivo a S3", { variant: "error" });
                return;
            }

            // 3. Confirmar en el backend para registrarlo en BD
            const { data: confirm } = await confirmTalentUpload({
                idTalento,
                idTipoDocumento: DOCUMENTO_CERT_DIP,
                idTipoArchivo: ARCHIVO_PDF,
                nombreArchivo: presigned.fileName,
                path: presigned.path,
            });

            if (confirm.idMensaje === 2) {
                enqueueSnackbar(confirm.mensaje || "Archivo subido con éxito", {
                    variant: "success",
                });
                closeModal("modalUploadCert");
                onUpdate(idTalento);
            } else {
                enqueueSnackbar(confirm.mensaje || "Error al registrar el archivo", {
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
        <Modal id="modalUploadCert" title="Sube un archivo del talento" confirmationLabel="Subir" onConfirm={handleOnConfirm}>
            {loading && (<Loading opacity="opacity-60" />)}
            <div className="pt-2">
                <div className="relative h-32 rounded-lg border-2 border-dashed border-gray-200 flex justify-center items-center transition-colors hover:border-[#0b85c3] hover:bg-[#f5fbff]">
                    <div className="absolute flex flex-col items-center pointer-events-none">
                        <Upload className="mb-2 w-8 h-8 text-[#0b85c3]" />
                        <span className="block text-[#0b85c3] font-normal">
                            {fileName || "Arrastra o selecciona un certificado o diploma"}
                        </span>
                        <span className="text-sm text-[#71717A]">{fileName ? "" : "Formato PDF"}</span>
                    </div>
                    <input
                        type="file"
                        name="cert"
                        ref={certRef}
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="h-full w-full opacity-0 cursor-pointer"
                    />
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
        </Modal>
    );
}
