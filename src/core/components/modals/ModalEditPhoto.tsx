import { FileCheck, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Modal } from "./Modal";
import { enqueueSnackbar } from "notistack";
import { Talent } from "../../models";
import {
    describeS3Error,
    generateTalentPhotoUploadUrl,
    updateTalentProfilePhoto,
    uploadFileToS3,
} from "../../services/apiService";
import { handleError } from "../../utilities/errorHandler";
import { Utils } from "../../utilities/utils";
import { ARCHIVO_IMAGEN, DOCUMENTO_FOTO_PERFIL } from "../../utilities/constants";
import { Loading } from "../ui/Loading";
import { validateFile } from "../../utilities/validation";
import { useModal } from "../../context/ModalContext";

interface Props {
    idTalento?: number;
    updateTalentList?: (idTalento: number, fields: Partial<Talent>) => void;
    onUpdate?: (idTalento: number) => void;
}

export const ModalEditPhoto = ({ idTalento, updateTalentList, onUpdate }: Props) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const photoRef = useRef<HTMLInputElement>(null);
    const { closeModal } = useModal();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setFileName(file ? file.name : null);
        setError(null);
    };

    /**
     * Sube la foto directamente a S3 con URL pre-firmada (ya no viaja en base64
     * por el backend).
     *
     * No hay confirm-upload: la foto es la columna `TALENTO.RUTA_IMAGEN`, no una
     * fila de TALENTO_ARCHIVOS, así que la ruta se registra en el
     * `addOrUpdateTalent` de siempre — el mismo patrón que la firma de usuario.
     * El aviso de éxito se lanza en cuanto el PUT a S3 devuelve 200, que es el
     * momento en que el archivo del usuario ya está guardado; el registro de la
     * ruta va después y sólo avisa si falla.
     */
    const handleOnConfirm = async () => {
        const photo = photoRef.current?.files?.[0];
        if (!photo || !idTalento) return;

        const validation = validateFile(photo, ['png', 'jpeg']);
        if (!validation.isValid) {
            setError(validation.message || "Error de validación.");
            return;
        }

        setLoading(true);
        try {
            // 1. Pedir la URL PUT pre-firmada.
            const { data: presigned } = await generateTalentPhotoUploadUrl({
                idTalento,
                fileName: photo.name,
                contentType: photo.type,
            });

            if (presigned.result?.idMensaje !== 2 || !presigned.url) {
                enqueueSnackbar(
                    presigned.result?.mensaje || "No se pudo generar la URL de subida",
                    { variant: "error" },
                );
                return;
            }

            // 2. Subir a S3. El 200 de este PUT es lo que confirma la subida.
            const s3Response = await uploadFileToS3(
                presigned.url,
                photo,
                presigned.contentType,
            );
            if (!s3Response.ok) {
                enqueueSnackbar(await describeS3Error(s3Response), { variant: "error" });
                return;
            }

            enqueueSnackbar("Foto de perfil actualizada con éxito", {
                variant: "success",
            });

            // Vista previa inmediata mientras el detalle se recarga.
            const previewUrl = URL.createObjectURL(photo);
            updateTalentList?.(idTalento, { photoUrl: previewUrl });
            closeModal("modalEditPhoto");

            // 3. Registrar la ruta en BD. Ya no se manda base64.
            const { data: saved } = await updateTalentProfilePhoto({
                idTalento,
                fotoArchivo: {
                    stringB64: "",
                    rutaArchivo: presigned.path,
                    nombreArchivo: Utils.getFileNameWithoutExtension(presigned.fileName),
                    extensionArchivo: Utils.getFileExtension(presigned.fileName),
                    idTipoArchivo: ARCHIVO_IMAGEN,
                    idTipoDocumento: DOCUMENTO_FOTO_PERFIL,
                },
            });

            if (saved.idMensaje !== 2) {
                enqueueSnackbar(
                    saved.mensaje || "La foto se subió, pero no se pudo registrar en el perfil",
                    { variant: "warning" },
                );
                return;
            }

            onUpdate?.(idTalento);
        } catch (err) {
            handleError(err, enqueueSnackbar);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal id="modalEditPhoto" title="Modifica tu foto de perfil" confirmationLabel="Editar" onConfirm={handleOnConfirm} busy={loading}>
            {loading && (<Loading opacity="opacity-60" />)}
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">Sube una nueva foto de perfil.</h3>
                <div className="rounded-lg overflow-hidden py-4">
                    <div className="w-full">
                        <div className="relative h-32 rounded-lg border-2 border-gray-100 flex justify-center items-center hover:bg-gray-100">
                            <div className="absolute flex flex-col items-center py-12">
                                {fileName ? (
                                    <FileCheck className="mb-3 mt-6 w-8 h-8 text-[#0b85c3]" />
                                ) : (
                                    <Upload className="mb-3 mt-6 w-8 h-8 text-[#0b85c3]" />
                                )}
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
