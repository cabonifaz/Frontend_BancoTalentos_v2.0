import { Download, FileText } from "lucide-react";
import { TalentFile } from "../../models";

interface Props {
  data: TalentFile;
  onDownload: () => void;
  downloading?: boolean;
}

export const FileCard = ({ data, onDownload, downloading = false }: Props) => {
  return (
    <div className="flex items-center justify-between rounded-md my-1 px-2 sm:px-6 py-4 bg-[#f4f4f5] w-full">
      <div className="flex gap-3 sm:gap-6 items-center min-w-0">
        <FileText className="w-8 h-8 shrink-0 text-[#71717A]" />
        <div className="flex flex-col gap-1 min-w-0">
          <h2
            className="text-[#27272A] text-base truncate"
            title={data.nombreArchivo}
          >
            {data.nombreArchivo}
          </h2>
          <p className="text-[#71717A] text-sm flex gap-2 items-center">
            {data.tipoArchivo && (
              <span className="uppercase">{data.tipoArchivo}</span>
            )}
            {data.fechaCarga && (
              <>
                <span>·</span>
                <span>{data.fechaCarga}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div>
        <button
          type="button"
          onClick={onDownload}
          disabled={downloading}
          title="Descargar"
          className="bg-transparent hover:shadow-lg hover:rounded-full hover:bg-zinc-50 flex items-center justify-center h-12 w-12 disabled:opacity-50"
        >
          <Download className="w-6 h-6 opacity-40 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};
