import { LucideIcon, Inbox, Loader2 } from "lucide-react";
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
  <div className="flex min-w-[200px] items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    <div
      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: `${accent}1A`, color: accent }}
    >
      <Icon size={24} strokeWidth={1.75} />
    </div>
    <div>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
      <p className="whitespace-nowrap text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

/** Tarjeta contenedora de un gráfico, con título y área de alto fijo. */
export const ChartCard = ({
  title,
  subtitle,
  children,
  height = 320,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  height?: number;
  className?: string;
}) => (
  <div className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
    <div style={{ height }}>{children}</div>
  </div>
);

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
      <div className="flex h-64 items-center justify-center text-gray-400">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }
  if (empty) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-gray-400">
        <Inbox size={32} strokeWidth={1.5} />
        <p className="text-sm">{emptyLabel}</p>
      </div>
    );
  }
  return <>{children}</>;
};
