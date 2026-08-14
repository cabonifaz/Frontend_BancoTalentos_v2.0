import { UserPlus } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFetchClients } from "../../../../core/hooks/useFetchClients";
import {
  getSeleccionIngresos,
  LabelCount,
} from "../../../../core/services/seleccion.service";
import { FiltersBar } from "../components/FiltersBar";
import { ChartCard, KpiCard, SectionState } from "../components/ui";
import { useSelectionSection } from "../useSelectionSection";

const INDIGO = "#5C6BC0";

export const IngresosSection = () => {
  const { clientes } = useFetchClients();
  const { filters, setFilters, data, loading, apply } = useSelectionSection<
    LabelCount[]
  >(getSeleccionIngresos, [], { emptyDates: true });

  const total = data.reduce((acc, r) => acc + r.cantidad, 0);
  const rows = data.map((r) => ({ cliente: r.label, cantidad: r.cantidad }));
  const barHeight = Math.max(280, rows.length * 34);

  return (
    <div className="flex flex-col gap-5 p-6">
      <FiltersBar
        value={filters}
        onChange={setFilters}
        onApply={apply}
        loading={loading}
        showClient
        clientes={clientes}
      />

      <SectionState loading={loading} empty={rows.length === 0}>
        <div className="flex flex-wrap gap-5">
          <KpiCard
            label="Ingresos en el periodo"
            value={total}
            icon={UserPlus}
            accent={INDIGO}
          />
          <KpiCard
            label="Clientes con ingresos"
            value={rows.length}
            icon={UserPlus}
            accent={INDIGO}
          />
        </div>

        <ChartCard
          title="Ingresos por cliente"
          subtitle={`${rows.length} cliente(s)`}
        >
          <div className="h-full overflow-y-auto">
            <ResponsiveContainer width="100%" height={barHeight}>
              <BarChart
                data={rows}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f2" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                <YAxis
                  type="category"
                  dataKey="cliente"
                  width={200}
                  tick={{ fontSize: 12, fill: "#374151" }}
                />
                <Tooltip />
                <Bar dataKey="cantidad" name="Ingresos" fill={INDIGO} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </SectionState>
    </div>
  );
};
