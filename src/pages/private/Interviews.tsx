import { useEffect, useState } from "react";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import { DateFilter, FilterDropDown, Loading } from "../../core/components";
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
  4: "bg-red-100 text-red-500", // Cancelado
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
      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${badgeClass}`}
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

  const nextPage = () => setCurrentPage((prev) => prev + 1);
  const prevPage = () => setCurrentPage((prev) => prev - 1);

  const { execute, loading, result } = useAsyncService(listInterviews);

  const response = result?.data;
  const interviews = response?.items || [];
  const totalPages = response?.totalPages ?? TOTAL_PAGES;

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

  return (
    <Dashboard>
      {loading && <Loading opacity="opacity-50" />}
      <div className="p-4 mx-4 xl:mx-16">
        {/* Page header */}
        <div className="flex justify-between items-center my-4">
          <h2 className="text-2xl font-semibold">Entrevistas</h2>
          <button
            type="button"
            className="btn btn-primary p-3 h-12 flex items-center gap-2"
            onClick={() => navigate("/dashboard/entrevistas/nueva")}
          >
            <span className="text-lg leading-none">+</span>
            Nueva Entrevista
          </button>
        </div>

        {/* Filters panel */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 lg:flex-row lg:gap-4">
              <div className="flex-1">
                <label
                  htmlFor="buscar-entrevista"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"
                >
                  Búsqueda por talento
                </label>
                <input
                  type="text"
                  id="buscar-entrevista"
                  value={buscar}
                  onChange={(e) => setBuscar(e.target.value)}
                  placeholder="Ej: Juan Perez"
                  className="input w-full"
                />
              </div>
            </div>

            <div className="flex gap-4 flex-wrap items-center">
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

              <button
                type="button"
                className="btn btn-primary p-3 h-10"
                onClick={handleSearch}
              >
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-container shadow-lg rounded-xl border border-gray-100 overflow-hidden">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr className="table-header uppercase">
                  <th className="table-header-cell">ID</th>
                  <th className="table-header-cell">Talento</th>
                  <th className="table-header-cell">Requerimientos</th>
                  <th className="table-header-cell">Clientes</th>
                  <th className="table-header-cell">Fecha Entrevista</th>
                  <th className="table-header-cell">Etapa / Estado</th>
                  <th className="table-header-cell text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {interviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      No hay entrevistas disponibles.
                    </td>
                  </tr>
                ) : (
                  interviews.map((item) => (
                    <tr key={item.id} className="table-row">
                      <td className="table-cell text-gray-500">{item.id}</td>
                      <td className="table-cell">
                        <span className="font-medium text-gray-900">
                          {item.talento}
                        </span>
                      </td>
                      <td className="table-cell max-w-[300px] truncate" title={item.tituloRq}>
                        {item.tituloRq}
                      </td>
                      <td className="table-cell">{item.cliente}</td>
                      <td className="table-cell">{item.fechaEntrevista}</td>
                      <td className="table-cell">
                        <span className="font-bold block">{item.etapa}</span>
                        <EstadoBadge
                          idEstado={item.idEstado}
                          estado={item.estado}
                        />
                      </td>
                      <td className="table-cell text-center">
                        <button
                          type="button"
                          className="p-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                          onClick={() =>
                            navigate(`/dashboard/entrevistas/${item.id}`)
                          }
                          title="Ver detalle"
                        >
                          <Eye size={20} />
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
        <div className="flex justify-center items-center gap-6 my-8">
          <button
            className={`flex items-center justify-center h-10 w-10 rounded-lg transition-all duration-200 ${
              currentPage === 1
                ? "text-gray-300 cursor-not-allowed border border-gray-100 bg-gray-50"
                : "text-gray-600 border border-gray-200 bg-white hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:shadow-md active:scale-95 shadow-sm"
            }`}
            onClick={prevPage}
            disabled={currentPage === 1}
            title="Página Anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Página</span>
            <span className="flex items-center justify-center h-9 w-9 rounded-lg bg-[var(--color-primary-10)] text-[var(--color-primary)] text-sm font-bold shadow-sm border border-[var(--color-primary-20)]">
              {currentPage}
            </span>
            <span className="text-sm font-medium">de</span>
            <span className="text-sm font-bold text-gray-700">
              {totalPages}
            </span>
          </div>

          <button
            className={`flex items-center justify-center h-10 w-10 rounded-lg transition-all duration-200 ${
              currentPage >= totalPages
                ? "text-gray-300 cursor-not-allowed border border-gray-100 bg-gray-50"
                : "text-[var(--color-primary)] border border-[var(--color-primary-20)] bg-white hover:bg-[var(--color-primary)] hover:text-white hover:shadow-md active:scale-95 shadow-sm"
            }`}
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            title="Página Siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </Dashboard>
  );
}
