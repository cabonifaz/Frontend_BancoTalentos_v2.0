import { Pencil } from "lucide-react";
import { Language } from "../../../models/interfaces/Language";
import { Utils } from "../../../utilities/utils";

interface Props {
    data: Language;
    onEdit: () => void;
}

export const LanguageCard = ({ data, onEdit }: Props) => {
    return (
        <div className="flex items-center justify-between rounded-md my-1 px-6 sm:px-12 py-4 bg-[#f4f4f5] w-full dark:bg-slate-700">
            <div className="flex gap-6 sm:gap-0 items-center">
                <div className="flex flex-col gap-2 min-w-20 overflow-ellipsis">
                    <h2 className="text-[#27272A] text-base text-ellipsis text-nowrap dark:text-slate-100">{data.nombreIdioma}</h2>
                    <p className="text-[#71717A] text-sm text-ellipsis text-nowrap dark:text-slate-400">{data.nivelIdioma}</p>
                </div>
                <div className="flex gap-2 my-2 mx-4">
                    {Utils.getStars(data.estrellas)}
                </div>
            </div>

            {/* Actions */}
            <div>
                <button
                    type="button"
                    onClick={onEdit}
                    className="bg-transparent hover:shadow-lg hover:rounded-full hover:bg-zinc-50 flex items-center justify-center h-12 w-12 dark:hover:bg-slate-700">
                    <Pencil className="w-6 h-6 opacity-40 hover:opacity-100" />
                </button>
            </div>
        </div>
    );
}