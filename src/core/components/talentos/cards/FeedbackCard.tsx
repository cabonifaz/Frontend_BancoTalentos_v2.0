import { Pencil } from "lucide-react";
import { Feedback } from "../../../models/interfaces/Feedback";
import { Utils } from "../../../utilities/utils";

interface Props {
    data: Feedback;
    onEdit: () => void;
}

export const FeedbackCard = ({ data, onEdit }: Props) => {
    return (
        <div className="flex items-center justify-between rounded-md my-1 px-2 sm:px-12 py-4 bg-[#f4f4f5] w-full dark:bg-slate-700">
            <div className="flex gap-2 sm:gap-12 items-center">
                <div className="flex flex-col gap-2">
                    <h2 className="text-[#27272A] text-base flex gap-4 items-center dark:text-slate-100">
                        {data.usuario}
                        <div className="flex gap-2 my-2">
                            {Utils.getStars(data.estrellas)}
                        </div>
                    </h2>
                    <p className="text-[#71717A] text-sm dark:text-slate-400">{data.descripcion}</p>
                </div>
            </div>
            {/* Actions */}
            <div>
                {data.editable === 1 && (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="bg-transparent hover:shadow-lg hover:rounded-full hover:bg-zinc-50 flex items-center justify-center h-12 w-12 dark:hover:bg-slate-700">
                        <Pencil className="w-6 h-6 opacity-40 hover:opacity-100" />
                    </button>
                )}
            </div>
        </div>
    );
}