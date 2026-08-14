import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFetchClients } from "../../../../core/hooks/useFetchClients";
import {
  getSeleccionRendimiento,
  PerformanceRow,
} from "../../../../core/services/seleccion.service";
import { FiltersBar } from "../components/FiltersBar";
import { ChartCard, SectionState } from "../components/ui";
import { useSelectionSection } from "../useSelectionSection";

const TEAL = "#009688";
const INDIGO = "#5C6BC0";

export const RendimientoSection = () => {
  const { clientes } = useFetchClients();
  const { filters, setFilters, data, loading, apply } = useSelectionSection<
    PerformanceRow[]
  >(getSeleccionRendimiento, [], { emptyDates: true });

  const barHeight = Math.max(320, data.length * 48);

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

      <SectionState loading={loading} empty={data.length === 0}>
        <ChartCard
          title="Entrevistas vs Ingresos por cliente"
          subtitle="Relación entre entrevistas realizadas e ingresos concretados"
        >
          <div className="h-full overflow-y-auto">
            <ResponsiveContainer width="100%" height={barHeight}>
              <BarChart
                data={data}
                layout="vertical"
                barGap={2}
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
                <Legend />
                <Bar dataKey="entrevistas" name="Entrevistas" fill={TEAL} radius={[0, 4, 4, 0]} />
                <Bar dataKey="ingresos" name="Ingresos" fill={INDIGO} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </SectionState>
    </div>
  );
};
