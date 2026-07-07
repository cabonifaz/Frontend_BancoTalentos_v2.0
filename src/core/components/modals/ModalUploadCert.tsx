import { useRef, useState } from "react";
import { Modal } from "./Modal";
import { enqueueSnackbar } from "notistack";
import {
  confirmTalentUpload,
  generateTalentDownloadUrl,
  generateTalentUploadUrl,
  uploadFileToS3,
} from "../../services/apiService";
import {
    ARCHIVO_PDF,
    DOCUMENTO_CERT_DIP,
    DOCUMENTO_CV,
    DOCUMENTO_CV_FR_EN,
    DOCUMENTO_CV_FR_ES,
    DOCUMENTO_FOTO_PERFIL,
} from "../../utilities/constants";
import { handleError } from "../../utilities/errorHandler";
import { Loading } from "../ui/Loading";
import { validateFile } from "../../utilities/validation";
import { useModal } from "../../context/ModalContext";
import { TalentFile } from "../../models";

interface Props {
    idTalento?: number
    files?: TalentFile[];
    onUpdate: (idTalento: number) => void;
}

const documentTypeLabels: Record<number, string> = {
    [DOCUMENTO_FOTO_PERFIL]: "Foto de perfil",
    [DOCUMENTO_CV]: "CV",
    [DOCUMENTO_CV_FR_ES]: "CV Fractal (ES)",
    [DOCUMENTO_CV_FR_EN]: "CV Fractal (EN)",
    [DOCUMENTO_CERT_DIP]: "Certificado / Diploma",
};

export const ModalUploadCert = ({ idTalento, files, onUpdate }: Props) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const certRef = useRef<HTMLInputElement>(null);
    const { closeModal } = useModal();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setFileName(file ? file.name : null);
        setError(null);
    };

    const handleDownload = async (file: TalentFile) => {
        setDownloadingId(file.idArchivo);
        try {
            const { data } = await generateTalentDownloadUrl({ idFile: file.idArchivo });
            if (data.result?.idMensaje === 2 && data.url) {
                window.open(data.url, "_blank", "noopener,noreferrer");
            } else {
                enqueueSnackbar(
                    data.result?.mensaje || "No se pudo generar el enlace de descarga",
                    { variant: "error" },
                );
            }
        } catch (err) {
            handleError(err, enqueueSnackbar);
        } finally {
            setDownloadingId(null);
        }
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
        <Modal id="modalUploadCert" title="Gestión de archivos del Talento" confirmationLabel="Subir" onConfirm={handleOnConfirm}>
            {loading && (<Loading opacity="opacity-60" />)}
            <div className="flex flex-col gap-6 pt-2">
                <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[#71717A] mb-2">
                        Subir nuevo archivo
                    </h3>
                    <div className="relative h-32 rounded-lg border-2 border-dashed border-gray-200 flex justify-center items-center transition-colors hover:border-[#0b85c3] hover:bg-[#f5fbff]">
                        <div className="absolute flex flex-col items-center pointer-events-none">
                            <img
                                alt="File Icon"
                                className="mb-2 w-8 h-8"
                                src="/assets/ic_upload.svg"
                            />
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
                </section>

                <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[#71717A] mb-2">
                        Archivos registrados
                    </h3>
                    {files && files.length > 0 ? (
                        <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                            {files.map((file) => (
                                <li
                                    key={file.idArchivo}
                                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2 hover:bg-gray-50"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm text-[#18181B]" title={file.nombreArchivo}>
                                            {file.nombreArchivo}
                                        </p>
                                        <span className="text-xs text-[#71717A]">
                                            {documentTypeLabels[file.idTipoDocumento] ?? "Archivo"}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDownload(file)}
                                        disabled={downloadingId === file.idArchivo}
                                        className="shrink-0 text-sm font-medium text-[#0b85c3] hover:underline disabled:opacity-50"
                                    >
                                        {downloadingId === file.idArchivo ? "Abriendo…" : "Descargar"}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-sm text-[#71717A]">
                            Este talento aún no tiene archivos registrados.
                        </p>
                    )}
                </section>
            </div>
        </Modal>
    );
}
