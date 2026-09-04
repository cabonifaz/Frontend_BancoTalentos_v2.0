import { Info, X } from "lucide-react";
import { AsignarTalentoType } from "../../../models/interfaces/TalentoFMI";
import { Tarifa } from "../../../models/interfaces/Tarifa";
import { PanelRiesgo } from "../PanelRiesgo";
import type { DatosRiesgo } from "../PanelRiesgo";
import {
  MAESTRO_MODALIDAD_FACT,
  nombreModalidad,
} from "../../../utilities/riesgoTalento";
import type { FilaBanda } from "../../../utilities/riesgoTalento";
import { useParams } from "../../../context/ParamsContext";

interface Props {
  talento: AsignarTalentoType | null;
  /** Tarifa del perfil del talento en el tarifario del cliente del RQ. */
  tarifa?: Tarifa;
  /** El tarifario se pide al abrir el modal; mientras llega no hay tarifa aún. */
  cargandoTarifa?: boolean;
  /** Banda salarial del RQ (lstRqFacturacion): una fila por grupo de modalidad. */
  banda?: FilaBanda[];
  onClose: () => void;
}

/**
 * Compara la pretensión salarial de un talento contra la tarifa de su perfil y
 * contra la banda salarial que el RQ autorizó pagar.
 *
 * Aquí solo vive lo propio del talento: la cabecera, los avisos de que falta el
 * tarifario y el pie. Todo el cálculo y los gráficos están en
 * {@link PanelRiesgo}, que comparte con la calculadora libre.
 */
export const ModalRiesgoTalento = ({
  talento,
  tarifa,
  cargandoTarifa = false,
  banda,
  onClose,
}: Props) => {
  const { paramsByMaestro } = useParams();

  if (!talento) return null;

  const nombreCompleto = `${talento.nombres} ${
    talento.apellidos ||
    `${talento.apellidoPaterno || ""} ${talento.apellidoMaterno || ""}`.trim()
  }`;
  const modalidadTalento = nombreModalidad(
    talento.idModalidadFacturacion,
    paramsByMaestro[MAESTRO_MODALIDAD_FACT] ?? [],
  );

  const datos: DatosRiesgo = {
    montoInicialPlanilla: talento.montoInicialPlanilla,
    montoFinalPlanilla: talento.montoFinalPlanilla,
    idMonedaPlan: talento.idMonedaPlan,
    montoInicialRxH: talento.montoInicialRxH,
    montoFinalRxH: talento.montoFinalRxH,
    idMonedaRxh: talento.idMonedaRxh,
    idModalidadFacturacion: talento.idModalidadFacturacion,
    tarifa: tarifa?.tarifa,
    idMonedaTarifa: tarifa?.idMoneda,
    monedaTarifa: tarifa?.moneda,
    tipoCambioSugerido: tarifa?.tipoCambio,
    banda,
  };

  return (
    // z-[60] y no z-20: el rail del sidebar es z-40 y el logo de Fractal z-[42],
    // así que por debajo de eso el overlay no los tapa y siguen siendo clicables.
    // Es el mismo nivel que usan ModalIngreso, ModalSolicitudEquipo y el aviso de
    // lista negra.
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-slate-800">
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-50">
              Riesgo de asignación
            </h2>
            <p className="text-sm text-gray-500 mt-1 dark:text-slate-400">
              {nombreCompleto}
              {talento.perfil ? ` · ${talento.perfil}` : ""}
              {modalidadTalento ? ` · ${modalidadTalento}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
          </button>
        </div>

        {cargandoTarifa ? (
          <div className="px-6 pb-6">
            <div className="p-4 rounded-lg bg-gray-50 text-sm text-gray-500 dark:bg-slate-800 dark:text-slate-400">
              Cargando el tarifario del cliente…
            </div>
          </div>
        ) : !tarifa ? (
          <div className="px-6 pb-6">
            <div className="flex items-start gap-2 p-4 rounded-lg bg-gray-50 text-sm text-gray-600 dark:bg-slate-800 dark:text-slate-300">
              <Info className="w-5 h-5 min-w-5 text-gray-400 mt-0.5 dark:text-slate-500" />
              <span>
                El perfil <strong>{talento.perfil || "seleccionado"}</strong> no
                tiene tarifa configurada para este cliente. Sin tarifa no hay
                contra qué comparar la pretensión del talento.
              </span>
            </div>
          </div>
        ) : (
          <PanelRiesgo datos={datos} />
        )}

        <div className="flex justify-end px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline-gray mx-0"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
