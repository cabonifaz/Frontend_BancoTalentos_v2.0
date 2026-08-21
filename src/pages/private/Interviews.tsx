import { useEffect, useState } from "react";
import {
  CalendarRange,
  Eye,
  FilterX,
  Plus,
  Search,
  Zap,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import {
  DateFilter,
  FilterDropDown,
  Loading,
  Pagination,
} from "../../core/components";
import { useAsyncService } from "../../core/hooks/useAsyncService";
import { listInterviews } from "../../core/services/interviews.service";
import {
  ESTADO_ENTREVISTA,
  ETAPA_ENTREVISTA,
} from "../../core/utilities/constants";
import { useParams } from "../../core/context/ParamsContext";

const TOTAL_PAGES = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BADGE_CLASSES: Record<number, string> = {
  1: "bg-green-100 text-green-700", // Registrado
  2: "bg-blue-100 text-blue-700", // En Proceso
  3: "bg-gray-100 text-gray-600", // Finalizado
  4: "bg-red-100 text-red-600", // Cancelado — mismo rojo que Perdido/Cancelado en RQ
};

function EstadoBadge({
  idEstado,
  estado,
}: {
  idEstado: number;
  estado: string;
}) {
  const badgeClass = BADGE_CLASSES[idEstado] || "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${badgeClass}`}
    >
      {estado}
    </span>
  );
}

export default function InterviewsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * Fetch params

   */
  // get params
  const { paramsByMaestro, loading: loadingParams } = useParams();

  const interviewStates = paramsByMaestro[ESTADO_ENTREVISTA] || [];
  const interviewStages = paramsByMaestro[ETAPA_ENTREVISTA] || [];
  const sortedInterviewStates = [...interviewStates].sort(
    (a, b) => a.num1 - b.num1,
  );
  const sortedInterviewStages = [...interviewStages].sort(
    (a, b) => a.num1 - b.num1,
  );

  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [selectedEstado, setSelectedEstado] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [buscar, setBuscar] = useState("");

  // Initialize page from URL query param (default 1)
  const initialPage = parseInt(searchParams.get("page") ?? "1", 10);
  const [currentPage, setCurrentPage] = useState<number>(
    isNaN(initialPage) ? 1 : initialPage,
  );

  const { execute, loading, result } = useAsyncService(listInterviews);

  const response = result?.data;
  const interviews = response?.items || [];
  const totalPages = response?.totalPages ?? TOTAL_PAGES;
  const totalElements = response?.totalElements ?? 0;

  const hasActiveFilters =
    buscar.trim() !== "" ||
    selectedEstado.length > 0 ||
    selectedStage.length > 0 ||
    selectedDate !== null;

  const fetchInterviews = (page = 1) => {
    // Obtenemos el ID del estado, asegurándonos de que sea un número válido o null
    const selectedId = selectedEstado[0];
    const idEstadoNum = selectedId ? Number(selectedId) : null;
    const selectedStageId = selectedStage[0];
    const idEtapaNum = selectedStageId ? Number(selectedStageId) : null;
    // Formatear fecha a YYYY-MM-DD
    const fechaFormateada = selectedDate
      ? selectedDate.toISOString().split("T")[0]
      : null;

    execute({
      npag: page,
      busqueda: buscar.trim() || null,
      idCliente: null,
      idEstado: idEstadoNum !== null && !isNaN(idEstadoNum) ? idEstadoNum : null,
      idEtapa: idEtapaNum !== null && !isNaN(idEtapaNum) ? idEtapaNum : null,//FRANCO LO HIZO
      fecha: fechaFormateada,
    });
  };

  // Sincronizar URL y cargar datos cuando cambie la página o al montar
  useEffect(() => {
    setSearchParams({ page: currentPage.toString() });
    fetchInterviews(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearch = () => {
    if (currentPage === 1) {
      // Si ya estamos en la página 1, forzamos la recarga de datos con los nuevos filtros
      fetchInterviews(1);
    } else {
      // Si estamos en otra página, volver a la 1 disparará automáticamente el useEffect
      setCurrentPage(1);
    }
  };

  const handleClearFilters = () => {
    setBuscar("");
    setSelectedEstado([]);
    setSelectedStage([]);
    setSelectedDate(null);
    setOpenDropdown(null);
    // Los filtros ya están limpios en el estado; se recarga desde la página 1.
    if (currentPage === 1) {
      execute({
        npag: 1,
        busqueda: null,
        idCliente: null,
        idEstado: null,
        idEtapa: null,
        fecha: null,
      });
    } else {
      setCurrentPage(1);
    }
  };

  const isToday = (fechaEntrevista: string) => {
    const [fecha] = fechaEntrevista.split(" "); // 01/06/2026
    const [dia, mes, anio] = fecha.split("/").map(Number);

    const hoy = new Date();

    return (
      dia === hoy.getDate() &&
      mes === hoy.getMonth() + 1 &&
      anio === hoy.getFullYear()
    );
  };

  return (
    <Dashboard>
      {loading && <Loading opacity="opacity-50" />}
      <div className="flex h-full flex-col overflow-x-hidden gap-4">
        {/* Page header */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-semibold">Entrevistas</h2>
            {totalElements > 0 && (
              <span className="text-sm text-gray-500">
                {totalElements} registro{totalElements === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-primary mx-0 flex h-10 items-center gap-2"
            onClick={() => navigate("/dashboard/entrevistas/nueva")}
          >
            <Plus size={18} strokeWidth={2} />
            Nueva Entrevista
          </button>
        </div>

        {/* Filters panel */}
        <div className="shrink-0 rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Búsqueda + acción principal, alineadas por la base */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="buscar-entrevista"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Búsqueda por talento
                </label>
                <div className="relative">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    id="buscar-entrevista"
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Ej: Juan Perez"
                    className="input h-10 w-full py-0 pl-10"
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary mx-0 flex h-10 shrink-0 items-center justify-center gap-2 sm:w-32"
                onClick={handleSearch}
              >
                <Search size={18} strokeWidth={2} />
                Buscar
              </button>
            </div>

            {/* Filtros secundarios */}
            <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
              <FilterDropDown
                name="estado"
                label="Estado"
                options={sortedInterviewStates.map((state) => ({
                  value: state.num1,
                  label: state.string1,
                }))}
                sortOptions={false}
                optionsType="radio"
                optionsPanelSize="w-44"
                inputPosition="right"
                isOpen={openDropdown === 1}
                onToggle={() => setOpenDropdown(openDropdown === 1 ? null : 1)}
                selectedValues={selectedEstado}
                onChange={setSelectedEstado}
              />
              <FilterDropDown
                name="etapa"
                label="Etapa"
                options={sortedInterviewStages.map((stage) => ({
                  value: stage.num1,
                  label: stage.string1,
                }))}
                sortOptions={false}
                optionsType="radio"
                optionsPanelSize="w-60"
                inputPosition="right"
                isOpen={openDropdown === 2}
                onToggle={() => setOpenDropdown(openDropdown === 2 ? null : 2)}
                selectedValues={selectedStage}
                onChange={setSelectedStage}
              />
              <DateFilter label="Fecha" onDateSelected={setSelectedDate} />

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                >
                  <FilterX size={16} strokeWidth={2} />
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-container min-h-0 flex-1 rounded-xl border border-gray-100 shadow-sm">
          <div className="table-wrapper h-full overflow-auto">
            <table className="table table-fixed min-w-[980px]">
              <colgroup>
                <col className="w-20" />
                <col className="w-[18%]" />
                <col className="w-[30%]" />
                <col className="w-[12%]" />
                <col className="w-[15%]" />
                <col className="w-[17%]" />
                <col className="w-24" />
              </colgroup>
              <thead>
                {/* La cabecera se fija en los th (no en el thead): con
                    border-collapse es lo único que sostiene el sticky. */}
                <tr className="table-header uppercase [&>th]:sticky [&>th]:top-0 [&>th]:z-10 [&>th]:bg-gray-50">
                  <th className="table-header-cell text-center">ID</th>
                  <th className="table-header-cell">Talento</th>
                  <th className="table-header-cell">Requerimiento</th>
                  <th className="table-header-cell text-center">Cliente</th>
                  <th className="table-header-cell text-center">Fecha Entrevista</th>
                  <th className="table-header-cell">Etapa / Estado</th>
                  <th className="table-header-cell text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {interviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-empty">
                      <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
                        <CalendarRange size={32} strokeWidth={1.5} />
                        <p className="text-sm">
                          No hay entrevistas disponibles.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  interviews.map((item) => (
                    <tr key={item.id} className="table-row align-top">
                      <td className="table-cell text-center text-gray-500 tabular-nums">
                        {item.id}
                      </td>
                      <td className="table-cell truncate" title={item.talento}>
                        <span className="font-medium text-gray-900">
                          {item.talento}
                        </span>
                      </td>
                      <td className="table-cell truncate" title={item.tituloRq}>
                        {item.tituloRq}
                      </td>
                      <td className="table-cell truncate text-center" title={item.cliente}>
                        {item.cliente}
                      </td>
                      <td className="table-cell">
                        <div className="flex flex-col items-center gap-1">
                          <span className="tabular-nums">
                            {item.fechaEntrevista}
                          </span>

                          {isToday(item.fechaEntrevista) && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                              <Zap size={12} className="fill-amber-500 text-amber-500" />
                              Hoy
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex flex-col items-start gap-1.5">
                          <span
                            className="block max-w-full truncate font-semibold text-gray-800"
                            title={item.etapa}
                          >
                            {item.etapa}
                          </span>
                          <EstadoBadge
                            idEstado={item.idEstado}
                            estado={item.estado}
                          />
                        </div>
                      </td>
                      <td className="table-cell text-center">
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-[var(--color-primary)]"
                          onClick={() =>
                            navigate(`/dashboard/entrevistas/${item.id}`)
                          }
                          title="Ver detalle"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="shrink-0">
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPaginate={setCurrentPage}
            />
          </div>
        )}
      </div>
    </Dashboard>
  );
}
