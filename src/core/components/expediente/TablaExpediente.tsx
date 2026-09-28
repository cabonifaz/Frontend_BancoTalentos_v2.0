import { FileDown, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export interface ColumnaExpediente {
  label: string;
  align?: "left" | "center" | "right";
}

interface Props {
  columnas: ColumnaExpediente[];
  /** Filas ya construidas por cada pestaña. */
  children: ReactNode;
  hayFilas: boolean;
  vacio: { icono: LucideIcon; titulo: string; texto: string };
  pie?: ReactNode;
  /** Ancho mínimo cuando la tabla tiene muchas columnas (contratos). */
  anchoMinimo?: string;
}

const alineacion = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/**
 * Caparazón común de las tablas del expediente: mismo encabezado, mismo vacío
 * y mismo pie en Contratos, Movimientos, Equipos y Ceses.
 */
export const TablaExpediente = ({
  columnas,
  children,
  hayFilas,
  vacio,
  pie,
  anchoMinimo,
}: Props) => {
  const IconoVacio = vacio.icono;

  if (!hayFilas) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center dark:border-slate-600 dark:bg-slate-800">
        <IconoVacio
          className="h-7 w-7 text-gray-400 dark:text-slate-500"
          strokeWidth={1.6}
        />
        <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">
          {vacio.titulo}
        </p>
        <p className="max-w-md text-xs text-gray-500 dark:text-slate-400">
          {vacio.texto}
        </p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="table" style={anchoMinimo ? { minWidth: anchoMinimo } : undefined}>
          <thead className="table-header">
            <tr>
              {columnas.map((columna, indice) => (
                <th
                  key={`${columna.label}-${indice}`}
                  scope="col"
                  className={`table-header-cell uppercase ${alineacion[columna.align ?? "left"]}`}
                >
                  {columna.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      {pie && (
        <div className="border-t border-gray-200 px-4 py-3 text-xs text-gray-500 dark:border-slate-700 dark:text-slate-400">
          {pie}
        </div>
      )}
    </div>
  );
};

/** Botón de PDF: mismo aspecto en las cuatro pestañas y en la línea de tiempo. */
export const BotonPdf = ({
  onClick,
  label = "PDF",
  disabled,
  titulo,
}: {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  titulo?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={titulo}
    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
      disabled
        ? "cursor-not-allowed border-gray-200 text-gray-400 dark:border-slate-700 dark:text-slate-500"
        : "border-gray-300 text-[#0b85c3] hover:bg-sky-50 dark:border-slate-600 dark:text-sky-400 dark:hover:bg-sky-400/10"
    }`}
  >
    <FileDown size={14} strokeWidth={2} />
    {label}
  </button>
);
