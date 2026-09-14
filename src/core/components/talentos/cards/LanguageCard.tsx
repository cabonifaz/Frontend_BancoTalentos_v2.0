import { Languages, Pencil } from "lucide-react";
import { Language } from "@/core/models/interfaces/Language";
import { Utils } from "@/core/utilities/utils";

interface Props {
    data: Language;
    onEdit: () => void;
}

// Mismo esquema que FileCard (icono de 32 px, px-6, gap-6): así el texto de
// todas las tarjetas del detalle del talento empieza a la misma altura.
export const LanguageCard = ({ data, onEdit }: Props) => {
    return (
        <div className="flex items-center justify-between gap-2 rounded-md my-1 px-2 sm:px-6 py-4 bg-[#f4f4f5] w-full dark:bg-slate-700">
            <div className="flex gap-3 sm:gap-6 items-center min-w-0">
                <Languages
                    className="w-8 h-8 shrink-0 text-[#71717A] dark:text-slate-400"
                    aria-hidden
                />
                {/* Ancho mínimo: las estrellas quedan en columna aunque cambie el largo del idioma. */}
                <div className="flex flex-col gap-1 min-w-0 sm:min-w-32">
                    <h2 className="text-[#27272A] text-base truncate dark:text-slate-100">{data.nombreIdioma}</h2>
                    <p className="text-[#71717A] text-sm truncate dark:text-slate-400">{data.nivelIdioma}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                    {Utils.getStars(data.estrellas)}
                </div>
            </div>

            {/* Actions */}
            <div className="shrink-0">
                <button
                    type="button"
                    aria-label={`Editar ${data.nombreIdioma}`}
                    onClick={onEdit}
                    className="bg-transparent hover:shadow-lg hover:rounded-full hover:bg-zinc-50 flex items-center justify-center h-12 w-12 dark:hover:bg-slate-700">
                    <Pencil className="w-6 h-6 opacity-40 hover:opacity-100" />
                </button>
            </div>
        </div>
    );
}
