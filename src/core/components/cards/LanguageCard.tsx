import { Language } from "../../models/Language";
import { Utils } from "../../utils";

interface Props {
    data: Language;
}

export const LanguageCard = ({ data }: Props) => {
    return (
        <div className="flex items-center justify-between rounded-md my-1 px-6 sm:px-12 py-4 bg-[#f4f4f5] w-full">
            <div className="flex gap-6 sm:gap-12 items-center">
                <div className="flex flex-col gap-2">
                    <h2 className="text-[#27272A] text-base">{data.languageName}</h2>
                    <p className="text-[#71717A] text-sm">{data.proficiency}</p>
                </div>
                <div className="flex gap-2 my-2">
                    {Utils.getStars(data.starCount)}
                </div>
            </div>

            {/* Actions */}
            <div>
                <button
                    type="button"
                    className="bg-transparent hover:shadow-lg hover:rounded-full hover:bg-zinc-50 flex items-center justify-center h-12 w-12">
                    <img src="/assets/ic_edit.svg" alt="edit icon" className="w-6 h-6 opacity-40 hover:opacity-100" />
                </button>
            </div>
        </div>
    );
}