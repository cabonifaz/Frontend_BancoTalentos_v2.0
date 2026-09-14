import { Info, X } from "lucide-react";
import { AsignarTalentoType } from "@/core/models/interfaces/TalentoFMI";
import { Tarifa } from "@/core/models/interfaces/Tarifa";
import { PanelRiesgo } from "@/core/components/requerimientos/PanelRiesgo";
import type { DatosRiesgo } from "@/core/components/requerimientos/PanelRiesgo";
import {
  MAESTRO_MODALIDAD_FACT,
  nombreModalidad,
} from "@/core/utilities/riesgoTalento";
import type { FilaBanda } from "@/core/utilities/riesgoTalento";
import { useParams } from "@/core/context/ParamsContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/core/components/ui/shadcn/dialog";
import { Button } from "@/core/components/ui/shadcn/button";

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
    // El Dialog va a z-[60], por encima del rail del sidebar (z-40) y del logo
    // de Fractal (z-[42]), como el resto de modales. Escape cierra; un clic
    // fuera no (como antes).
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        aria-describedby="riesgo-talento-desc"
        className="block w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-y-auto p-0 shadow-none"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-slate-50">
              Riesgo de asignación
            </DialogTitle>
            <DialogDescription id="riesgo-talento-desc" className="text-gray-500 mt-1 dark:text-slate-400">
              {nombreCompleto}
              {talento.perfil ? ` · ${talento.perfil}` : ""}
              {modalidadTalento ? ` · ${modalidadTalento}` : ""}
            </DialogDescription>
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
          <Button variant="outline" onClick={onClose} className="mx-0">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
