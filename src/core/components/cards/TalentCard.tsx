import { Talent } from "../../models/interfaces/Talent";
import { Utils } from "../../utilities/utils";

interface Props {
  talent: Talent;
  selectTalent: (talent: Talent) => void;
}

export const TalentCard = ({ talent, selectTalent }: Props) => {
  const getInitials = (talent: Talent) => {
    const firstName = talent.nombres?.trim().split(" ")[0] || "";
    const lastName = talent.apellidoPaterno?.trim() || "";
    return `${firstName.charAt(0)}${lastName.charAt(
      0
    )}`.toUpperCase();
  };

  return (
    <div
      onClick={() => selectTalent(talent)}
      className="flex items-center justify-around md:justify-start p-2 hover:bg-[#f4f4f5] rounded-xl cursor-pointer relative"
    >
      <div className="mx-2 lg:ms-4 lg:me-8 w-1/4 md:w-fit">
        <div className="w-20 h-20 md:w-24 md:h-24 xl:w-28 xl:h-28 rounded-full border border-gray-300 flex items-center justify-center bg-gray-50 text-[#3f3f46] font-medium text-lg md:text-xl xl:text-2xl select-none shadow-sm">
          {getInitials(talent)}
        </div>
      </div>
      <div className="w-3/4 min-w-0">
        <p className="text-base">{`ID: ${talent.idTalento} - ${talent.nombres} ${talent.apellidoPaterno} ${talent.apellidoMaterno}`}</p>
        <p className="text-sm text-[#71717A]">{talent.puesto}</p>
        <div className="flex gap-2 my-2">
          {Utils.getStars(talent.estrellas)}
        </div>
        <p className="text-sm text-[#71717A] flex my-1 lg:h-5 min-w-0">
          <img
            src="/assets/ic_location.svg"
            alt="location icon"
            className="h-5 w-5 shrink-0"
          />
          <span className="truncate">{`${talent.pais}, ${talent.ciudad}`}</span>
        </p>
        <div className="text-sm text-[#71717A]">
          <div className="flex flex-row md:flex-col xl:flex-row gap-2 md:gap-0 xl:gap-2 flex-wrap">
            <p>
              {`RxH ${
                Utils.formatCoinByNum1(talent.idMonedaRxh).string3
              } `}
              {talent.montoInicialRxH.toFixed(2)} -{" "}
              {talent.montoInicialRxH.toFixed(2)}
            </p>
          </div>
          <div className="flex flex-row md:flex-col xl:flex-row gap-2 md:gap-0 xl:gap-2 flex-wrap">
            <p>
              {`Planilla ${
                Utils.formatCoinByNum1(talent.idMonedaPlan).string3
              } `}
              {talent.montoInicialPlanilla.toFixed(2)} -{" "}
              {talent.montoFinalPlanilla.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      {talent.esFavorito === 1 && (
        <div className="absolute right-4 top-2">
          <img
            src="/assets/ic_fill_heart.svg"
            alt="fav"
            className="h-5 w-5"
          />
        </div>
      )}
    </div>
  );
};
