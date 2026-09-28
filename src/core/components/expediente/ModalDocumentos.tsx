import { FileText, Monitor } from "lucide-react";
import { Modal } from "../modals/Modal";
import { useParams } from "../../context/ParamsContext";
import { MAESTRO_TIPO_HISTORIAL } from "../../utilities/expediente";

export const MODAL_DOCUMENTOS_EXPEDIENTE = "modalDocumentosExpediente";

interface Props {
  /** Nombre del talento, sólo para el texto de ayuda. */
  nombre: string;
  onVerUltimoHistorial: (tipoHistorial: number) => void;
  onVerUltimoEquipo: () => void;
  busy?: boolean;
}

const Opcion = ({
  titulo,
  descripcion,
  icono: Icono,
  onClick,
  disabled,
}: {
  titulo: string;
  descripcion: string;
  icono: typeof FileText;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-[#0b85c3] hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:hover:border-sky-400 dark:hover:bg-sky-400/10"
  >
    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-300">
      <Icono size={18} strokeWidth={1.8} />
    </span>
    <span className="flex min-w-0 flex-col">
      <span className="text-sm font-semibold text-gray-800 dark:text-slate-100">
        {titulo}
      </span>
      <span className="text-xs text-gray-500 dark:text-slate-400">
        {descripcion}
      </span>
    </span>
  </button>
);

/**
 * Los últimos formularios del talento (en FMI esta misma pantalla se llama
 * "Documentos").
 *
 * Es la única vía para el PDF de ingreso: el detalle del expediente no devuelve
 * el `ID_HISTORIAL` de cada contrato, sólo `lastHistory` sabe cuál fue el
 * último de cada tipo.
 */
export const ModalDocumentos = ({
  nombre,
  onVerUltimoHistorial,
  onVerUltimoEquipo,
  busy,
}: Props) => {
  const { paramsByMaestro } = useParams();
  const tiposHistorial = paramsByMaestro[MAESTRO_TIPO_HISTORIAL] || [];

  return (
    <Modal
      id={MODAL_DOCUMENTOS_EXPEDIENTE}
      title="Formularios del talento"
      showButtonOptions={false}
      width="small"
      busy={busy}
    >
      <div className="flex flex-col gap-3">
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Último formulario generado de cada tipo para {nombre}.
        </p>

        {tiposHistorial.map((tipo) => (
          <Opcion
            key={tipo.idParametro}
            titulo={tipo.string1}
            descripcion="Abre el último formulario de este tipo"
            icono={FileText}
            disabled={busy}
            onClick={() => onVerUltimoHistorial(tipo.num1)}
          />
        ))}

        <Opcion
          titulo="Solicitud de equipo"
          descripcion="Abre la última solicitud de hardware y software"
          icono={Monitor}
          disabled={busy}
          onClick={onVerUltimoEquipo}
        />
      </div>
    </Modal>
  );
};
