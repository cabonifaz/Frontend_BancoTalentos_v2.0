import { Talent } from "../models/Talent";
import { Utils } from "../utils";

interface Props {
    talent: Talent;
    selectTalent: (talent: Talent) => void;
}

export const TalentCard = ({ talent, selectTalent }: Props) => {
    return (
        // #c7eeea teal
        <div
            onClick={() => selectTalent(talent)}
            className="flex items-center justify-around md:justify-start p-2 hover:bg-[#f4f4f5] rounded-xl cursor-pointer">
            <div className="mx-2 lg:ms-4 lg:me-8 w-1/4 md:w-fit bg-slate-200">
                <img src={talent.image ? talent.image : "/assets/ic_no_image.svg"} alt="Foto Perfil Talento" className="w-32 h-32 md:w-16 md:h-16 rounded-full border" />
            </div>
            <div className="w-3/4 md:w-fit">
                <p className="text-base">{talent.name}</p>
                <p className="text-sm text-[#71717A]">{talent.profession}</p>
                <div className="flex gap-2 my-2">
                    {Utils.getStars(talent.rating)}
                </div>
                <p className="text-sm text-[#71717A] flex my-1 lg:h-5">
                    <img src="/assets/ic_location.svg" alt="location icon" className="h-5 w-5" />
                    {talent.location}
                </p>
                <div className="text-sm text-[#71717A]">
                    <div className="flex flex-row md:flex-col xl:flex-row gap-2 md:gap-0 xl:gap-2 flex-wrap">
                        <p>{`RxH S/. ${talent.salaryRxHInit} - ${talent.salaryRxHEnd}`}</p>
                        <p className="block md:hidden xl:block">|</p>
                        <p>{`Planilla S/. ${talent.salaryPlanillaInit} - ${talent.salaryPlanillaEnd}`}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}