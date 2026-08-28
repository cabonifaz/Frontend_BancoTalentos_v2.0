import { Heart, MapPin } from "lucide-react";
import { Talent } from "../../models/interfaces/Talent";
import { Utils } from "../../utilities/utils";

interface Props {
  talent: Talent;
  selectTalent: (talent: Talent) => void;
}

export const TalentCard = ({ talent, selectTalent }: Props) => {
  return (
    <div
      onClick={() => selectTalent(talent)}
      className="flex items-center px-3 py-2 hover:bg-[#f4f4f5] rounded-lg cursor-pointer relative"
    >
      <div className="w-full min-w-0 pe-6">
        <p className="text-sm leading-tight truncate">{`ID: ${talent.idTalento} - ${talent.nombres} ${talent.apellidoPaterno} ${talent.apellidoMaterno}`}</p>
        <p className="text-xs leading-tight text-[#71717A] truncate">
          {talent.puesto}
        </p>
        <div className="flex items-center gap-2 mt-0.5 min-w-0">
          <div className="flex shrink-0 [&_svg]:h-3.5 [&_svg]:w-3.5">
            {Utils.getStars(talent.estrellas)}
          </div>
          <p className="text-xs leading-tight text-[#71717A] flex items-center min-w-0">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{`${talent.pais}, ${talent.ciudad}`}</span>
          </p>
        </div>
        <div className="text-xs leading-tight text-[#71717A] flex flex-wrap gap-x-3">
          <p>
            {`RxH ${
              Utils.formatCoinByNum1(talent.idMonedaRxh).string3
            } `}
            {talent.montoInicialRxH.toFixed(2)} -{" "}
            {talent.montoInicialRxH.toFixed(2)}
          </p>
          <p>
            {`Planilla ${
              Utils.formatCoinByNum1(talent.idMonedaPlan).string3
            } `}
            {talent.montoInicialPlanilla.toFixed(2)} -{" "}
            {talent.montoFinalPlanilla.toFixed(2)}
          </p>
        </div>
      </div>
      {talent.esFavorito === 1 && (
        <div className="absolute right-3 top-2">
          <Heart className="h-4 w-4" color="#e9399a" fill="#e9399a" />
        </div>
      )}
    </div>
  );
};
