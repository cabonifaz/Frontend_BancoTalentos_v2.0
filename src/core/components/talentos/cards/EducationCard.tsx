import { GraduationCap, Pencil } from "lucide-react";
import { Education } from "@/core/models/interfaces/Education";
import { Utils } from "@/core/utilities/utils";

interface Props {
  data: Education;
  onEdit: () => void;
}

// Mismo esquema que FileCard (icono de 32 px, px-6, gap-6): así el texto de
// todas las tarjetas del detalle del talento empieza a la misma altura.
export const EducationCard = ({ data, onEdit }: Props) => {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md my-1 px-2 sm:px-6 py-4 bg-[#f4f4f5] w-full dark:bg-slate-700">
      <div className="flex gap-3 sm:gap-6 items-center min-w-0">
        <GraduationCap
          className="w-8 h-8 shrink-0 text-[#71717A] dark:text-slate-400"
          aria-hidden
        />
        <div className="flex flex-col gap-1 min-w-0">
          <h2 className="text-[#27272A] text-base dark:text-slate-100">{data.nombreInstitucion}</h2>
          <p className="text-[#71717A] text-sm flex flex-col dark:text-slate-400">
            <span>
              {Utils.formatDegree(data.grado)} - {data.carrera}
            </span>

            <span>
              {`${data?.tipoFechaEducaciones === 2 ? Utils.formatDateForMonthInput(data?.fechaInicio) : Utils.formatDateForYearInput(data?.fechaInicio)} - ${data?.flActualidad ? "Actualidad" : data?.tipoFechaEducaciones === 2 ? Utils.formatDateForMonthInput(data.fechaFin) : Utils.formatDateForYearInput(data.fechaFin)}`}
            </span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0">
        <button
          type="button"
          aria-label={`Editar ${data.nombreInstitucion}`}
          onClick={onEdit}
          className="bg-transparent hover:shadow-lg hover:rounded-full hover:bg-zinc-50 flex items-center justify-center h-12 w-12 dark:hover:bg-slate-700"
        >
          <Pencil className="w-6 h-6 opacity-40 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};
