import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import {
  AsistenteResultado,
  EntrevistaResultado,
  RendimientoResultado,
  RestriccionResultado,
  TalentoResultado,
} from "../../../core/services/asistente.service";

const RUTA_TALENTOS = "/dashboard/talentos";
const RUTA_ENTREVISTAS = "/dashboard/entrevistas";
const RUTA_SELECCION = "/dashboard/seleccion";

// Mismos colores que el listado de Entrevistas
const BADGE_CLASSES: Record<number, string> = {
  1: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  2: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  3: "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300",
  4: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
};

const iniciales = (nombre: string) =>
  nombre
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase();

const Tabla = ({ columnas, children, minWidth = "min-w-[680px]" }: { columnas: string[]; children: ReactNode; minWidth?: string }) => (
  <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
    <table className={`w-full border-collapse text-[13px] ${minWidth}`}>
      <thead>
        <tr className="text-left text-gray-600 dark:text-slate-400">
          {columnas.map((columna) => (
            <th key={columna} className="px-3.5 py-3 font-semibold">
              {columna || <span className="sr-only">Detalle</span>}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="text-gray-800 dark:text-slate-200">{children}</tbody>
    </table>
  </div>
);

const celda = "px-3.5 py-3";

const EnlaceDetalle = ({ to, state, label }: { to: string; state?: unknown; label: string }) => (
  <Link
    to={to}
    state={state}
    aria-label={label}
    className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700"
  >
    <ChevronRight className="h-[18px] w-[18px]" />
  </Link>
);

const Talentos = ({ total, items, onVerMas }: { total: number; items: TalentoResultado[]; onVerMas: () => void }) => {
  const restantes = total - items.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((talento) => (
          <Link
            key={talento.idTalento}
            to={RUTA_TALENTOS}
            state={{ talentId: talento.idTalento, talentName: talento.nombre }}
            className="flex min-h-[76px] items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 text-gray-800 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#e6f5f5] font-semibold text-[#00706f] dark:bg-teal-400/10 dark:text-teal-300">
              {iniciales(talento.nombre)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{talento.nombre}</span>
              <span className="mt-0.5 block text-[13px] text-gray-600 dark:text-slate-400">
                {talento.puesto} · {talento.ciudad}
              </span>
              <span className="mt-0.5 block text-[13px] text-gray-600 dark:text-slate-400">
                {talento.expectativa}
              </span>
            </span>
            <ChevronRight className="h-[18px] w-[18px] flex-none" aria-hidden="true" />
          </Link>
        ))}
      </div>
      {restantes > 0 && (
        <button
          type="button"
          onClick={onVerMas}
          className="h-11 self-start rounded-lg border border-gray-400 px-3.5 font-medium text-gray-800 hover:bg-gray-100 dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          Ver {restantes} más
        </button>
      )}
    </div>
  );
};

const Entrevistas = ({ items }: { items: EntrevistaResultado[] }) => (
  <Tabla columnas={["Talento", "Requerimiento", "Cliente", "Fecha", "Estado", ""]}>
    {items.map((entrevista) => (
      <tr key={entrevista.id} className="border-t border-gray-200 dark:border-slate-700">
        <td className={`${celda} font-medium`}>{entrevista.talento}</td>
        <td className={celda}>{entrevista.requerimiento}</td>
        <td className={celda}>{entrevista.cliente}</td>
        <td className={`${celda} whitespace-nowrap`}>{entrevista.fecha}</td>
        <td className={celda}>
          <span
            className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              BADGE_CLASSES[entrevista.idEstado] ?? "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200"
            }`}
          >
            {entrevista.estado}
          </span>
        </td>
        <td className="px-2 py-1">
          <EnlaceDetalle to={`${RUTA_ENTREVISTAS}/${entrevista.id}`} label={`Ver entrevista de ${entrevista.talento}`} />
        </td>
      </tr>
    ))}
  </Tabla>
);

const ListaNegra = ({ items }: { items: RestriccionResultado[] }) => (
  <Tabla columnas={["Talento", "Alcance", "Motivo", "Registrado", ""]}>
    {items.map((restriccion, indice) => (
      <tr key={`${restriccion.idTalento}-${indice}`} className="border-t border-gray-200 dark:border-slate-700">
        <td className={`${celda} font-medium`}>{restriccion.talento}</td>
        <td className={`${celda} whitespace-nowrap`}>{restriccion.alcance}</td>
        <td className={celda}>{restriccion.motivo}</td>
        <td className={`${celda} whitespace-nowrap`}>{restriccion.fecha}</td>
        <td className="px-2 py-1">
          <EnlaceDetalle
            to={RUTA_TALENTOS}
            state={{ talentId: restriccion.idTalento, talentName: restriccion.talento }}
            label={`Ver a ${restriccion.talento}`}
          />
        </td>
      </tr>
    ))}
  </Tabla>
);

const Indicador = ({ titulo, valor }: { titulo: string; valor: number }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
    <div className="text-[13px] text-gray-600 dark:text-slate-400">{titulo}</div>
    <div className="mt-1.5 text-[28px] font-semibold text-gray-800 dark:text-slate-100">{valor}</div>
  </div>
);

const Seleccion = ({
  totalEntrevistas,
  totalIngresos,
  items,
}: {
  totalEntrevistas: number;
  totalIngresos: number;
  items: RendimientoResultado[];
}) => (
  <div className="flex flex-col gap-3">
    <div className="grid gap-3 sm:grid-cols-2">
      <Indicador titulo="Entrevistas" valor={totalEntrevistas} />
      <Indicador titulo="Ingresos" valor={totalIngresos} />
    </div>
    <Tabla columnas={["Cliente", "Entrevistas", "Ingresos"]} minWidth="min-w-[420px]">
      {items.map((fila) => (
        <tr key={fila.cliente} className="border-t border-gray-200 dark:border-slate-700">
          <td className={`${celda} font-medium`}>{fila.cliente}</td>
          <td className={celda}>{fila.entrevistas}</td>
          <td className={celda}>{fila.ingresos}</td>
        </tr>
      ))}
    </Tabla>
    <Link
      to={RUTA_SELECCION}
      className="inline-flex min-h-11 items-center self-start font-medium text-[#00706f] hover:underline dark:text-teal-300"
    >
      Abrir el módulo Selección
    </Link>
  </div>
);

export const AsistenteResultados = ({
  resultado,
  onVerMas,
}: {
  resultado: AsistenteResultado;
  onVerMas: () => void;
}) => {
  switch (resultado.tipo) {
    case "talentos":
      return <Talentos total={resultado.total} items={resultado.items} onVerMas={onVerMas} />;
    case "entrevistas":
      return <Entrevistas items={resultado.items} />;
    case "listaNegra":
      return <ListaNegra items={resultado.items} />;
    case "seleccion":
      return (
        <Seleccion
          totalEntrevistas={resultado.totalEntrevistas}
          totalIngresos={resultado.totalIngresos}
          items={resultado.items}
        />
      );
  }
};
