import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarCheck, UserRound } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFetchClients } from "../../../../core/hooks/useFetchClients";
import {
  getSeleccionEntrevistas,
  SelectionInterviews,
  SelectionUser,
} from "../../../../core/services/seleccion.service";
import { Utils } from "../../../../core/utilities/utils";
import { FiltersBar } from "../components/FiltersBar";
import { CHROME, SERIES, colorizeSlices } from "../components/chartTheme";
import { DonutChart } from "../components/DonutChart";
import { UserPicker } from "../components/UserPicker";
import { periodLabel } from "../components/dateRange";
import type { ChartView } from "../components/ui";
import {
  ChartCard,
  ChartViewToggle,
  KpiCard,
  SectionState,
} from "../components/ui";
import { useSelectionSection } from "../useSelectionSection";

const TEAL = SERIES[0];
const INDIGO = SERIES[1];
const ROL_ADMIN = 1;
const ROL_GESTOR = 4;

const EMPTY: SelectionInterviews = {
  total: 0,
  serie: [],
  porUsuario: [],
  usuarioTotal: 0,
  usuarioSerie: [],
};

const toChart = (serie: { periodo: string; cantidad: number }[]) =>
  serie.map((p) => ({ periodo: periodLabel(p.periodo), cantidad: p.cantidad }));

const LineSerie = ({
  data,
  color,
}: {
  data: { periodo: string; cantidad: number }[];
  color: string;
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
      <CartesianGrid stroke={CHROME.grid} />
      <XAxis dataKey="periodo" tick={{ fontSize: 12, fill: CHROME.inkMuted }} />
      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: CHROME.inkMuted }} />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="cantidad"
        name="Entrevistas"
        stroke={color}
        strokeWidth={2}
        dot={{ r: 3 }}
      />
    </LineChart>
  </ResponsiveContainer>
);

export const EntrevistasSection = () => {
  const token = localStorage.getItem("token") || undefined;
  const roleIds = Utils.getUserRoleIds(token);
  const isAdmin = roleIds.includes(ROL_ADMIN);
  // Admin y Gestor ven el desglose top 5 por usuario.
  const showBreakdown = isAdmin || roleIds.includes(ROL_GESTOR);
  const myName = Utils.getUserFullname(token);

  const { clientes } = useFetchClients();
  const { filters, setFilters, data, loading, apply } = useSelectionSection(
    getSeleccionEntrevistas,
    EMPTY,
    { emptyDates: true },
  );

  const [selectedUser, setSelectedUser] = useState<SelectionUser | null>(null);
  const [userView, setUserView] = useState<ChartView>("barras");

  // Re-consulta al cambiar el usuario elegido (el picker no usa el botón Aplicar).
  const firstUsucre = useRef(true);
  useEffect(() => {
    if (firstUsucre.current) {
      firstUsucre.current = false;
      return;
    }
    apply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.usucre]);

  const pickUser = (user: SelectionUser | null) => {
    setSelectedUser(user);
    setFilters({ ...filters, usucre: user?.usuario ?? null });
  };

  const serie = toChart(data.serie);
  const usuarios = data.porUsuario;
  const barHeight = Math.max(280, usuarios.length * 34);

  // El SP ya entrega top 5 + fila 'Otros': aquí sólo se reparten los colores.
  const userSlices = useMemo(() => colorizeSlices(usuarios), [usuarios]);

  // Detalle por usuario (punto 3): Admin lo ve al elegir uno; el resto ve el suyo.
  const showUserDetail = isAdmin ? !!selectedUser : true;
  const userLabel = isAdmin
    ? selectedUser?.nombre || selectedUser?.usuario || ""
    : myName || "Mis entrevistas";
  const userSerie = toChart(data.usuarioSerie);

  return (
    <div className="flex flex-col gap-5 p-6">
      <FiltersBar
        value={filters}
        onChange={setFilters}
        onApply={apply}
        loading={loading}
        showClient
        clientes={clientes}
      >
        {isAdmin && <UserPicker value={selectedUser} onChange={pickUser} />}
      </FiltersBar>

      <SectionState loading={loading} empty={data.total === 0}>
        <div className="flex flex-wrap gap-5">
          <KpiCard
            label="Entrevistas en el periodo"
            value={data.total}
            icon={CalendarCheck}
          />
          {showUserDetail && (
            <KpiCard
              label={`Entrevistas de ${userLabel}`}
              value={data.usuarioTotal}
              icon={UserRound}
              accent={INDIGO}
            />
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <ChartCard title="Entrevistas por mes" subtitle="Total del periodo">
            <LineSerie data={serie} color={TEAL} />
          </ChartCard>

          {showUserDetail && (
            <ChartCard
              title={`Entrevistas por mes — ${userLabel}`}
              subtitle="Detalle del usuario"
            >
              <LineSerie data={userSerie} color={INDIGO} />
            </ChartCard>
          )}

          {showBreakdown && (
            <ChartCard
              title="Entrevistas por usuario de selección"
              subtitle={
                userView === "torta"
                  ? "Reparto del total del periodo — top 5 + resto acumulado"
                  : "Top 5 + resto acumulado"
              }
              className="xl:col-span-2"
              actions={
                <ChartViewToggle value={userView} onChange={setUserView} />
              }
              height={userView === "torta" ? 360 : 320}
            >
              {userView === "torta" ? (
                <DonutChart
                  slices={userSlices}
                  totalLabel="entrevistas"
                  unitLabel="Entrevistas"
                />
              ) : (
                <div className="h-full overflow-y-auto">
                  <ResponsiveContainer width="100%" height={barHeight}>
                    <BarChart
                      data={usuarios}
                      layout="vertical"
                      margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                    >
                      <CartesianGrid stroke={CHROME.grid} horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: CHROME.inkMuted }} />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={150}
                        tick={{ fontSize: 12, fill: CHROME.inkSecondary }}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="cantidad"
                        name="Entrevistas"
                        fill={TEAL}
                        maxBarSize={24}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>
          )}
        </div>
      </SectionState>
    </div>
  );
};
