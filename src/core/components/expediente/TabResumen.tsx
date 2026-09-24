import {
  Briefcase,
  DoorOpen,
  History,
  Monitor,
  Repeat2,
} from "lucide-react";
import { ExpedienteDetalle } from "../../models";
import {
  HitoExpediente,
  TipoHito,
  contratoVigente,
  lineaDeTiempo,
} from "../../utilities/expediente";
import { BotonPdf } from "./TablaExpediente";

interface Props {
  detalle?: ExpedienteDetalle;
  onVerHistorial: (tipoHistorial: number, idHistorial: number) => void;
  onVerEquipo: (idSolicitud: number) => void;
}

const ICONO_HITO: Record<TipoHito, typeof Briefcase> = {
  ingreso: Briefcase,
  movimiento: Repeat2,
  equipo: Monitor,
  cese: DoorOpen,
};

const TarjetaLateral = ({
  titulo,
  icono: Icono,
  filas,
  vacio,
}: {
  titulo: string;
  icono: typeof Briefcase;
  filas: { label: string; valor?: string }[];
  vacio: string;
}) => (
  <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <div className="mb-3 flex items-center gap-2">
      <Icono size={16} strokeWidth={1.8} className="text-gray-500 dark:text-slate-400" />
      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400">
        {titulo}
      </h3>
    </div>
    {filas.length === 0 ? (
      <p className="text-xs text-gray-500 dark:text-slate-400">{vacio}</p>
    ) : (
      <div className="flex flex-col gap-2">
        {filas.map((fila) => (
          <div key={fila.label} className="flex items-baseline justify-between gap-3">
            <span className="text-xs text-gray-500 dark:text-slate-400">
              {fila.label}
            </span>
            <span className="text-right text-sm font-semibold text-gray-800 dark:text-slate-100">
              {fila.valor || "—"}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const Hito = ({
  hito,
  ultimo,
  onVerHistorial,
  onVerEquipo,
}: {
  hito: HitoExpediente;
  ultimo: boolean;
  onVerHistorial: (tipoHistorial: number, idHistorial: number) => void;
  onVerEquipo: (idSolicitud: number) => void;
}) => {
  const Icono = ICONO_HITO[hito.tipo];
  const pdfHistorial =
    hito.pdf?.tipoHistorial !== undefined && hito.pdf?.idHistorial !== undefined;
  const pdfEquipo = hito.pdf?.idSolicitud !== undefined;

  return (
    <li className="flex gap-3">
      <div className="flex flex-none flex-col items-center">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-300">
          <Icono size={17} strokeWidth={1.8} />
        </span>
        {!ultimo && (
          <span
            aria-hidden="true"
            className="mt-1 w-0.5 flex-1 bg-gray-200 dark:bg-slate-700"
          />
        )}
      </div>
      <div
        className={`flex min-w-0 flex-1 items-start gap-4 ${ultimo ? "" : "pb-5"}`}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[11px] text-gray-500 dark:text-slate-400">
            {hito.fecha || "Sin fecha"}
          </span>
          <span className="text-sm font-semibold text-gray-800 dark:text-slate-100">
            {hito.titulo}
          </span>
          {hito.detalle && (
            <span className="text-xs text-gray-500 dark:text-slate-400">
              {hito.detalle}
            </span>
          )}
        </div>
        {pdfHistorial && (
          <BotonPdf
            onClick={() =>
              onVerHistorial(hito.pdf!.tipoHistorial!, hito.pdf!.idHistorial!)
            }
          />
        )}
        {pdfEquipo && (
          <BotonPdf onClick={() => onVerEquipo(hito.pdf!.idSolicitud!)} />
        )}
      </div>
    </li>
  );
};

/**
 * Resumen: la vida laboral del talento en un solo hilo, más el contrato
 * vigente y el último equipo. Es la vista que no existe en FMI, donde hay que
 * ir abriendo las cinco pestañas para reconstruirla.
 */
export const TabResumen = ({ detalle, onVerHistorial, onVerEquipo }: Props) => {
  const hitos = lineaDeTiempo(detalle);
  const vigente = contratoVigente(detalle?.contracts);
  const equipo = detalle?.equipmentRequests?.[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 xl:flex-row">
      <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-slate-100">
            <History size={18} strokeWidth={1.8} />
            Línea de tiempo
          </h3>
          <span className="text-xs text-gray-500 dark:text-slate-400">
            Ingresos, movimientos, equipos y ceses en un solo hilo
          </span>
        </div>

        {hitos.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500 dark:text-slate-400">
            Este talento todavía no tiene movimientos registrados.
          </p>
        ) : (
          <ul className="min-h-0 flex-1 list-none overflow-y-auto pr-1">
            {hitos.map((hito, indice) => (
              <Hito
                key={`${hito.tipo}-${hito.fecha}-${indice}`}
                hito={hito}
                ultimo={indice === hitos.length - 1}
                onVerHistorial={onVerHistorial}
                onVerEquipo={onVerEquipo}
              />
            ))}
          </ul>
        )}
      </section>

      <aside className="flex w-full shrink-0 flex-col gap-4 xl:w-80">
        <TarjetaLateral
          titulo="Contrato vigente"
          icono={Briefcase}
          vacio="El talento no tiene un contrato activo."
          filas={
            vigente
              ? [
                  { label: "Cliente", valor: vigente.client },
                  { label: "Requerimiento", valor: vigente.rqCode },
                  { label: "Inicio", valor: vigente.startDate },
                  { label: "Fin", valor: vigente.endDate },
                  { label: "Monto base", valor: vigente.baseAmount },
                  { label: "Modalidad", valor: vigente.contractType },
                ]
              : []
          }
        />
        <TarjetaLateral
          titulo="Último equipo"
          icono={Monitor}
          vacio="Sin solicitudes de equipo."
          filas={
            equipo
              ? [
                  { label: "Equipo", valor: equipo.equipmentType },
                  { label: "Marca", valor: equipo.brand },
                  { label: "Solicitado", valor: equipo.requestDate },
                  { label: "Entregado", valor: equipo.deliveryDate },
                  { label: "Celular", valor: equipo.mobileAssigned },
                ]
              : []
          }
        />
      </aside>
    </div>
  );
};
