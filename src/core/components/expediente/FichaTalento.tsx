import {
  Building2,
  CalendarDays,
  Phone,
  ChevronLeft,
  Clock,
  FolderOpen,
  IdCard,
  Mail,
  UserRound,
} from "lucide-react";
import { ExpedienteDetalle } from "../../models";
import {
  antiguedad,
  contratoVigente,
  estadoTalento,
  iniciales,
  nombreCompleto,
} from "../../utilities/expediente";

interface Props {
  detalle?: ExpedienteDetalle;
  onVolver: () => void;
  onDocumentos: () => void;
}

const Dato = ({
  icono: Icono,
  label,
  valor,
}: {
  icono: typeof Building2;
  label: string;
  valor: string;
}) => (
  <div className="flex min-w-0 items-center gap-3">
    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-300">
      <Icono size={17} strokeWidth={1.8} />
    </span>
    <span className="flex min-w-0 flex-col">
      <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-slate-400">
        {label}
      </span>
      <span
        className="truncate text-sm font-semibold text-gray-800 dark:text-slate-100"
        title={valor}
      >
        {valor}
      </span>
    </span>
  </div>
);

const Chip = ({
  icono: Icono,
  texto,
}: {
  icono: typeof Mail;
  texto: string;
}) => (
  <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-slate-700 dark:text-slate-200">
    <Icono size={14} strokeWidth={1.8} className="flex-none" />
    <span className="truncate">{texto}</span>
  </span>
);

/**
 * Cabecera del expediente: quién es el talento y en qué situación está.
 *
 * Cliente, modalidad, fecha de ingreso, antigüedad y el estado no vienen del
 * backend: se derivan del contrato vigente (ver `utilities/expediente`).
 */
export const FichaTalento = ({ detalle, onVolver, onDocumentos }: Props) => {
  const nombre = nombreCompleto(detalle) || "Talento";
  const vigente = contratoVigente(detalle?.contracts);
  // La antigüedad se cuenta desde el contrato más reciente, haya terminado o
  // no: si sólo mirara el vigente, un talento cesado no tendría antigüedad.
  const ultimo = vigente ?? detalle?.contracts?.[0];
  const estado = estadoTalento(detalle?.contracts);

  return (
    <div className="flex shrink-0 flex-col gap-3">
      <button
        type="button"
        onClick={onVolver}
        className="flex w-fit items-center gap-1.5 text-sm font-semibold text-[#0b85c3] hover:underline dark:text-sky-400"
      >
        <ChevronLeft size={16} strokeWidth={2} />
        Volver al buscador
      </button>

      <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span
              aria-hidden="true"
              className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-sky-100 text-lg font-bold text-sky-800 dark:bg-slate-700 dark:text-slate-100"
            >
              {iniciales(nombre)}
            </span>
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="truncate text-xl font-semibold text-gray-800 dark:text-slate-100">
                  {nombre}
                </h2>
                <span className={`badge ${estado.clase}`}>{estado.texto}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Chip
                  icono={IdCard}
                  texto={`DNI ${detalle?.documentNumber || "—"}`}
                />
                {detalle?.email && <Chip icono={Mail} texto={detalle.email} />}
                {detalle?.celular && (
                  <Chip icono={Phone} texto={detalle.celular} />
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onDocumentos}
            className="btn btn-outline-blue mx-0 flex h-10 items-center gap-2"
          >
            <FolderOpen size={17} strokeWidth={1.8} />
            Formularios
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 dark:border-slate-700 sm:grid-cols-2 xl:grid-cols-4">
          <Dato
            icono={Building2}
            label="Cliente actual"
            valor={vigente?.client || "—"}
          />
          <Dato icono={UserRound} label="Área" valor={vigente?.area || "—"} />
          <Dato
            icono={CalendarDays}
            label="Inicio de contrato"
            valor={vigente?.startDate || "—"}
          />
          <Dato
            icono={Clock}
            label="Antigüedad (último contrato)"
            valor={ultimo ? antiguedad(ultimo.startDate) : "—"}
          />
        </div>
      </div>
    </div>
  );
};
