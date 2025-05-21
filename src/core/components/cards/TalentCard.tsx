import { Talent } from "../../models/interfaces/Talent";
import { MODALIDAD_RXH } from "../../utilities/constants";
import { Utils } from "../../utilities/utils";

interface Props {
    talent: Talent;
    selectTalent: (talent: Talent) => void;
}

export const TalentCard = ({ talent, selectTalent }: Props) => {
    return (
        <div
            onClick={() => selectTalent(talent)}
            className="flex items-center justify-around md:justify-start p-2 hover:bg-[#f4f4f5] rounded-xl cursor-pointer relative">
            <div className="mx-2 lg:ms-4 lg:me-8 w-1/4 md:w-fit">
                <img src={Utils.getImageSrc(talent.imagen)} alt="Foto Perfil Talento" className="w-20 h-20 md:w-16 md:h-16 rounded-full border" />
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
                        {talent.idModalidadFacturacion === MODALIDAD_RXH ? (
                            <p>{`RxH ${talent?.moneda || ""} ${talent.montoInicialRxH} - ${talent.montoFinalRxH}`}</p>
                        ) : (
                            <p>{`Planilla ${talent?.moneda || ""} ${talent.montoInicialPlanilla} - ${talent.montoFinalPlanilla}`}</p>
                        )}
                    </div>
                </div>
            </div>
            {talent.esFavorito === 1 && (
                <div className="absolute right-4 top-2">
                    <img src="/assets/ic_fill_heart.svg" alt="fav" className="h-5 w-5" />
                </div>
            )}
        </div>
    );
}