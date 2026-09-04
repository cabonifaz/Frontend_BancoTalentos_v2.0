import {
  BarChart3,
  Inbox,
  Loader2,
  LucideIcon,
  PieChart as PieChartIcon,
} from "lucide-react";
import { ReactNode } from "react";

/** Tarjeta KPI: valor grande + etiqueta. */
export const KpiCard = ({
  label,
  value,
  icon: Icon,
  accent = "#009688",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: string;
}) => (
  <div className="flex min-w-[200px] items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <div
      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: `${accent}1A`, color: accent }}
    >
      <Icon size={24} strokeWidth={1.75} />
    </div>
    <div>
      <p className="text-2xl font-semibold text-gray-800 dark:text-slate-100">{value}</p>
      <p className="whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{label}</p>
    </div>
  </div>
);

/** Tarjeta contenedora de un gráfico, con título, acciones y área de alto fijo. */
export const ChartCard = ({
  title,
  subtitle,
  children,
  actions,
  height = 320,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Controles de la propia tarjeta (p. ej. barras/torta). Los filtros de datos
   *  viven en la FiltersBar de arriba, nunca aquí. */
  actions?: ReactNode;
  height?: number;
  className?: string;
}) => (
  <div className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}>
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 dark:text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
    <div style={{ height }}>{children}</div>
  </div>
);

export type ChartView = "barras" | "torta";

/**
 * Conmutador de representación. La barra rankea y compara; la torta responde
 * "de qué se compone el total". Son preguntas distintas sobre los mismos datos,
 * así que se ofrecen las dos en vez de elegir por el usuario.
 */
export const ChartViewToggle = ({
  value,
  onChange,
}: {
  value: ChartView;
  onChange: (view: ChartView) => void;
}) => {
  const options: { key: ChartView; label: string; icon: LucideIcon }[] = [
    { key: "barras", label: "Barras", icon: BarChart3 },
    { key: "torta", label: "Torta", icon: PieChartIcon },
  ];

  return (
    <div
      role="group"
      aria-label="Tipo de gráfico"
      className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-slate-700 dark:bg-slate-800"
    >
      {options.map(({ key, label, icon: Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={active}
            title={label}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              active
                ? "bg-white text-gray-800 shadow-sm dark:bg-slate-800 dark:text-slate-100"
                : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Icon size={14} strokeWidth={2} />
            {label}
          </button>
        );
      })}
    </div>
  );
};

export const SectionState = ({
  loading,
  empty,
  emptyLabel = "Sin datos para el filtro seleccionado.",
  children,
}: {
  loading: boolean;
  empty: boolean;
  emptyLabel?: string;
  children: ReactNode;
}) => {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 dark:text-slate-500">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }
  if (empty) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-gray-400 dark:text-slate-500">
        <Inbox size={32} strokeWidth={1.5} />
        <p className="text-sm">{emptyLabel}</p>
      </div>
    );
  }
  return <>{children}</>;
};
