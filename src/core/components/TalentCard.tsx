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
            className="flex items-center px-4 py-2 hover:bg-[#f4f4f5] rounded-xl cursor-pointer">
            <div className="ms-4 me-8">
                <img src={talent.image ? talent.image : "/assets/ic_no_image.svg"} alt="Foto Perfil Talento" className="w-16 h-16 rounded-full border" />
            </div>
            <div>
                <p className="text-base">{talent.name}</p>
                <p className="text-sm text-[#71717A]">{talent.profession}</p>
                <div className="flex gap-2 my-2">
                    {Utils.getStars(talent.rating)}
                </div>
                <p className="text-sm text-[#71717A] flex items-end my-1 h-5">
                    <img src="/assets/ic_location.svg" alt="location icon" className="h-5 w-5" />
                    {talent.location}
                </p>
                <p className="text-sm text-[#71717A]">{`RxH S/. ${talent.salaryRxHInit} - ${talent.salaryRxHEnd} | Planilla S/. ${talent.salaryPlanillaInit} - ${talent.salaryPlanillaEnd} `}</p>
            </div>
        </div>
    );
}