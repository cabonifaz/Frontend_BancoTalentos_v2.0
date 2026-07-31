import { useEffect, useRef, useState } from "react";
import { Upload, Download, Trash2 } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { ReqTalento } from "../../models/interfaces/ReqTalento";
import {
  MAESTRO_TIPO_ARCHIVO_POSTULANTE,
  POSTULANT_ALLOWED_EXTENSIONS,
  POSTULANT_MAX_FILE_SIZE_MB,
} from "../../utilities/constants";
import { usePostulantFiles } from "../../hooks/usePostulantFiles";
import { useParams } from "../../context/ParamsContext";
import { Loading } from "../ui/Loading";
import { CloseModalButton } from "../ui/CloseModalButton";

interface ModalProps {
  rqId: number;
  /** Cliente del RQ: los tipos de documento se configuran por cliente. */
  idCliente: number;
  postulant: ReqTalento;
  onClose: () => void;
}

const selectClass =
  "w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 cursor-pointer";

/**
 * Modal de archivos de un postulante (REQUERIMIENTO_TALENTO). Se abre desde la tabla
 * de Postulantes con el postulante ya seleccionado: carga y gestiona sus archivos vía
 * URL pre-firmada (sin combo de selección).
 */
export const ModalPostulantFiles = ({
  rqId,
  idCliente,
  postulant,
  onClose,
}: ModalProps) => {
  const {
    files,
    selectedId,
    selectPostulante,
    uploadFile,
    downloadFile,
    deleteFile,
    isBusy,
    loadingList,
  } = usePostulantFiles(rqId);

  const [docTypeId, setDocTypeId] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Catálogo dinámico de tipos de documento (maestro 46): son 4 filas fijas,
  // una por tipo, y los 4 se ofrecen a todos los clientes. num1 = id,
  // string1 = descripción. La obligatoriedad es por cliente: el tipo es
  // obligatorio para el cliente que figure en su num2 y opcional para todos
  // los demás (por eso num2 = 0 no marca a nadie). num3 no se usa.
  const { paramsByMaestro } = useParams();
  const docTypes = paramsByMaestro[MAESTRO_TIPO_ARCHIVO_POSTULANTE] || [];
  const typeLabel = (id: number) =>
    docTypes.find((p) => p.num1 === id)?.string1 ?? "—";

  // Carga directa de los archivos del postulante seleccionado.
  useEffect(() => {
    selectPostulante(postulant.idRequerimientoTalento);
  }, [postulant.idRequerimientoTalento, selectPostulante]);

  const acceptAttr = POSTULANT_ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",");

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!docTypeId) {
      enqueueSnackbar({
        message: "Seleccione el tipo de documento antes de subir el archivo",
        variant: "warning",
      });
      return;
    }
    // Extensión permitida (whitelist).
    const ext = file.name.includes(".")
      ? file.name.split(".").pop()!.toLowerCase()
      : "";
    if (!POSTULANT_ALLOWED_EXTENSIONS.includes(ext)) {
      enqueueSnackbar({
        message: `Tipo de archivo no permitido. Permitidos: ${POSTULANT_ALLOWED_EXTENSIONS.join(
          ", "
        )}`,
        variant: "warning",
      });
      return;
    }
    // Tamaño máximo.
    if (file.size > POSTULANT_MAX_FILE_SIZE_MB * 1024 * 1024) {
      enqueueSnackbar({
        message: `El archivo supera el tamaño máximo de ${POSTULANT_MAX_FILE_SIZE_MB} MB`,
        variant: "warning",
      });
      return;
    }
    uploadFile(file, docTypeId);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const fullName = `${postulant.nombresTalento ?? ""} ${
    postulant.apellidosTalento ?? ""
  }`.trim();

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative flex h-[calc(100vh-2rem)] max-h-[640px] min-h-0 w-full flex-col overflow-hidden rounded-lg bg-white p-4 shadow-lg md:w-[600px]">
        {isBusy && <Loading opacity="opacity-30" />}

        <header className="flex shrink-0 items-center justify-between">
          <h2 className="mb-2 text-lg font-bold">
            Archivos del postulante
            {fullName ? ` — ${fullName}` : ""}
          </h2>
          <CloseModalButton onClick={onClose} />
        </header>

        {selectedId != null && (
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Dropzone (un archivo por vez) */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }`}
            >
              <Upload className="mb-2 h-6 w-6 text-gray-500 opacity-70" />
              <p className="text-sm text-gray-600">
                Arrastra un archivo aquí o haz clic para seleccionar
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptAttr}
              className="hidden"
              onChange={handleInputChange}
            />

            {/* Tipo de documento */}
            <div className="mt-3 shrink-0">
              <label className="text-sm font-medium text-gray-700">
                Tipo de documento
              </label>
              <select
                value={docTypeId || ""}
                onChange={(e) => setDocTypeId(Number(e.target.value))}
                className={`mt-1 ${selectClass}`}
              >
                <option value="">Elija un tipo</option>
                {docTypes.map((type) => (
                  <option key={type.num1} value={type.num1}>
                    {type.num2 === idCliente
                      ? `${type.string1} (Obligatorio)`
                      : type.string1}
                  </option>
                ))}
              </select>
            </div>

            {/* Listado de archivos */}
            <div className="mt-4 flex min-h-0 flex-1 flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Listado de archivos
              </label>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {!loadingList && files.length === 0 ? (
                  <p className="mt-4 text-center text-sm text-gray-500">
                    Este postulante aún no tiene archivos registrados.
                  </p>
                ) : (
                  files.map((file) => (
                    <div
                      key={file.idRequerimientoTalentoArchivo}
                      className="mb-1 flex items-center justify-between gap-2 rounded-md bg-gray-50 p-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-gray-700">
                          {file.nombreArchivo}
                        </p>
                        <span className="text-xs text-gray-500">
                          {typeLabel(file.idTipoArchivo)}
                        </span>
                      </div>
                      <button
                        type="button"
                        title="Descargar"
                        onClick={() =>
                          downloadFile(file.idRequerimientoTalentoArchivo)
                        }
                        className="text-blue-500 hover:text-blue-600 focus:outline-none"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        title="Eliminar"
                        onClick={() =>
                          deleteFile(file.idRequerimientoTalentoArchivo)
                        }
                        className="text-red-500 hover:text-red-600 focus:outline-none"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
