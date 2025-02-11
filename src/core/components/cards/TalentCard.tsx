import { Talent } from "../../models/interfaces/Talent";
import { Utils } from "../../utilities/utils";

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
            <div className="mx-2 lg:ms-4 lg:me-8 w-1/4 md:w-fit">
                <img src={talent.imagen ? talent.imagen : "/assets/ic_no_image.svg"} alt="Foto Perfil Talento" className="w-32 h-32 md:w-16 md:h-16 rounded-full border" />
            </div>
            <div className="w-3/4 md:w-fit">
                <p className="text-base">{`${talent.nombres} ${talent.apellidoPaterno} ${talent.apellidoMaterno}`}</p>
                <p className="text-sm text-[#71717A]">{talent.puesto}</p>
                <div className="flex gap-2 my-2">
                    {Utils.getStars(talent.estrellas)}
                </div>
                <p className="text-sm text-[#71717A] flex my-1 lg:h-5">
                    <img src="/assets/ic_location.svg" alt="location icon" className="h-5 w-5" />
                    {`${talent.pais}, ${talent.ciudad}`}
                </p>
                <div className="text-sm text-[#71717A]">
                    <div className="flex flex-row md:flex-col xl:flex-row gap-2 md:gap-0 xl:gap-2 flex-wrap">
                        <p>{`RxH S/. ${talent.montoInicialRxH} - ${talent.montoFinalRxH}`}</p>
                        <p className="block md:hidden xl:block">|</p>
                        <p>{`Planilla S/. ${talent.montoInicialPlanilla} - ${talent.montoFinalPlanilla}`}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}