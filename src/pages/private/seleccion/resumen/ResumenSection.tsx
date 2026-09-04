import {
  CalendarCheck,
  ChevronRight,
  LineChart,
  UserPlus,
  Users,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import {
  getSeleccionResumen,
  SelectionSummary,
} from "../../../../core/services/seleccion.service";
import { SectionProps } from "../sections";
import { KpiCard, SectionState } from "../components/ui";
import { Meter } from "../components/Meter";
import { SERIES } from "../components/chartTheme";
import { useSelectionSection } from "../useSelectionSection";

const EMPTY: SelectionSummary = { totalEntrevistas: 0, totalIngresos: 0 };

const NAV: { key: string; label: string; desc: string; icon: LucideIcon }[] = [
  { key: "entrevistas", label: "Entrevistas", desc: "Volumen por periodo y por usuario de selección", icon: Users },
  { key: "ingresos", label: "Ingresos", desc: "Ingresos por cliente en el periodo", icon: UserPlus },
  { key: "rendimiento", label: "Rendimiento", desc: "Entrevistas vs. ingresos por cliente", icon: LineChart },
];

export const ResumenSection = ({ onNavigate }: SectionProps) => {
  const { data, loading } = useSelectionSection(getSeleccionResumen, EMPTY);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <p className="text-sm text-gray-500 dark:text-slate-400">Últimos 30 días</p>
      </div>

      <SectionState loading={loading} empty={false}>
        <div className="flex flex-wrap gap-5">
          <KpiCard
            label="Entrevistas realizadas"
            value={data.totalEntrevistas}
            icon={CalendarCheck}
          />
          <KpiCard
            label="Ingresos concretados"
            value={data.totalIngresos}
            icon={UserPlus}
            accent={SERIES[1]}
          />
          {/* Una razón contra su total es un medidor, no una torta de dos
              porciones: con dos sectores hay que comparar ángulos para leer un
              número que ya está escrito al lado. */}
          <Meter
            label="Tasa de conversión"
            value={data.totalIngresos}
            total={data.totalEntrevistas}
            valueLabel="ingresos"
            totalLabel="entrevistas"
          />
        </div>
      </SectionState>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-slate-200">
          Secciones detalladas
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {NAV.map(({ key, label, desc, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate?.(key)}
              className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-colors hover:border-[#009688]/40 hover:bg-[#009688]/5 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#009688]/10 text-[#009688]">
                <Icon size={22} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center justify-between font-medium text-gray-800 dark:text-slate-100">
                  {label}
                  <ChevronRight
                    size={18}
                    className="text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#009688] dark:text-slate-600"
                  />
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
