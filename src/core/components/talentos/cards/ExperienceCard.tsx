import { Pencil } from "lucide-react";
import { Experience } from "../../../models/interfaces/Experience";
import { Utils } from "../../../utilities/utils";

interface Props {
  data: Experience;
  onEdit: () => void;
}

export const ExperienceCard = ({ data, onEdit }: Props) => {
  return (
    <div className="flex items-center justify-between rounded-md my-1 px-2 sm:px-12 py-4 bg-[#f4f4f5] w-full dark:bg-slate-700">
      <div className="flex gap-2 sm:gap-12 items-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-[#27272A] text-base dark:text-slate-100">{data.nombreEmpresa}</h2>
          <p className="text-[#71717A] text-sm flex dark:text-slate-400">
            {data.puesto}
            <span className="ms-6">
              {`${Utils.formatMonthYear(data?.fechaInicio)} - ${Utils.formatMonthYear(data?.fechaFin)} | ${data?.tiempo ? data?.tiempo : ""}`}
            </span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div>
        <button
          type="button"
          onClick={onEdit}
          className="bg-transparent hover:shadow-lg hover:rounded-full hover:bg-zinc-50 flex items-center justify-center h-12 w-12 dark:hover:bg-slate-700"
        >
          <Pencil className="w-6 h-6 opacity-40 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};
