import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import {
  BaseOption,
  DateFilter,
  FilterDropDown,
  Loading,
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
  const { paramsByMaestro, loading: loadingParams } = useParams(
    `${ESTADO_ENTREVISTA},${ETAPA_ENTREVISTA}`,
  );

  const interviewStates = paramsByMaestro[ESTADO_ENTREVISTA] || [];
  const interviewStages = paramsByMaestro[ETAPA_ENTREVISTA] || [];

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
    // Formatear fecha a YYYY-MM-DD
    const fechaFormateada = selectedDate
      ? selectedDate.toISOString().split("T")[0]
      : null;

    execute({
      npag: page,
      busqueda: buscar.trim() || null,
      idCliente: null,
      idEstado:
        idEstadoNum !== null && !isNaN(idEstadoNum) ? idEstadoNum : null,
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
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Búsqueda por título de RQ, talento o código
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="buscar-entrevista"
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                    placeholder="Ej: Juan Perez, Java Developer..."
                    className="input w-full pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap items-center">
              <FilterDropDown
                name="estado"
                label="Estado"
                options={interviewStates.map((state) => ({
                  value: state.num1,
                  label: state.string1,
                }))}
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
                options={interviewStages.map((stage) => ({
                  value: stage.num1,
                  label: stage.string1,
                }))}
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
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr className="table-header uppercase">
                  <th className="table-header-cell">ID</th>
                  <th className="table-header-cell">Talento</th>
                  <th className="table-header-cell">Requerimientos</th>
                  <th className="table-header-cell">Clientes</th>
                  <th className="table-header-cell">Fecha Entrevista</th>
                  <th className="table-header-cell">Etapa/Estado</th>
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
                    <tr
                      key={item.id}
                      className="table-row cursor-pointer"
                      onClick={() =>
                        navigate(`/dashboard/entrevistas/${item.id}`)
                      }
                    >
                      <td className="table-cell text-gray-500">{item.id}</td>
                      <td className="table-cell">
                        <span className="font-medium text-gray-900">
                          {item.talento}
                        </span>
                      </td>
                      <td className="table-cell">{item.tituloRq}</td>
                      <td className="table-cell">{item.cliente}</td>
                      <td className="table-cell">{item.fechaEntrevista}</td>
                      <td className="table-cell">
                        <span className="font-bold block">{item.etapa}</span>
                        <EstadoBadge
                          idEstado={item.idEstado}
                          estado={item.estado}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 my-6">
          <button
            className={`btn ${currentPage === 1 ? "btn-disabled" : "btn-outline-gray"}`}
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className={`btn ${currentPage >= totalPages ? "btn-disabled" : "btn-primary"}`}
            onClick={nextPage}
            disabled={currentPage >= totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    </Dashboard>
  );
}
