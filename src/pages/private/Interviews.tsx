import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import {
  BaseOption,
  DateFilter,
  FilterDropDown,
  Loading,
} from "../../core/components";
import { useAsyncService } from "../../core/hooks/useAsyncService";
import { listInterviews } from "../../core/services/interviews.service";

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
      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${badgeClass}`}
    >
      {estado}
    </span>
  );
}

// ─── Filter options ───────────────────────────────────────────────────────────

const CLIENT_OPTIONS: BaseOption[] = [
  { value: "banbif", label: "Banbif" },
  { value: "interbank", label: "Interbank" },
  { value: "bcp", label: "BCP" },
];

const ESTADO_OPTIONS: BaseOption[] = [
  { value: "registrado", label: "Registrado" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_proceso", label: "En Proceso" },
  { value: "finalizado", label: "Finalizado" },
  { value: "cancelado", label: "Cancelado" },
];

// ─── Page component ───────────────────────────────────────────────────────────

export default function InterviewsPage() {
  const navigate = useNavigate();

  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<string[]>([]);
  const [selectedEstado, setSelectedEstado] = useState<string[]>([]);
  const [buscar, setBuscar] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { execute, loading, result } = useAsyncService(listInterviews);

  useEffect(() => {
    execute({
      nPag: 1,
      busqueda: null,
      idCliente: null,
      idEstado: null,
      fecha: null,
    });
  }, []);

  const response = result?.data;
  const interviews = response?.items || [];
  const totalPages = response?.totalPages ?? TOTAL_PAGES;

  const filtered = interviews.filter((item) => {
    const fullName = item.talento;
    const matchesBuscar =
      !buscar ||
      fullName.toLowerCase().includes(buscar.toLowerCase()) ||
      item.tituloRq.toLowerCase().includes(buscar.toLowerCase()) ||
      item.id.toString().includes(buscar);

    const matchesCliente =
      selectedCliente.length === 0 ||
      selectedCliente.includes(item.cliente.toLowerCase());

    const matchesEstado =
      selectedEstado.length === 0 ||
      selectedEstado.includes(item.estado.toLowerCase().replace(" ", "_"));

    return matchesBuscar && matchesCliente && matchesEstado;
  });

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
                name="cliente"
                label="Cliente"
                options={CLIENT_OPTIONS}
                optionsType="radio"
                optionsPanelSize="w-48"
                inputPosition="right"
                isOpen={openDropdown === 0}
                onToggle={() => setOpenDropdown(openDropdown === 0 ? null : 0)}
                selectedValues={selectedCliente}
                onChange={setSelectedCliente}
              />
              <FilterDropDown
                name="estado"
                label="Estado"
                options={ESTADO_OPTIONS}
                optionsType="radio"
                optionsPanelSize="w-44"
                inputPosition="right"
                isOpen={openDropdown === 1}
                onToggle={() => setOpenDropdown(openDropdown === 1 ? null : 1)}
                selectedValues={selectedEstado}
                onChange={setSelectedEstado}
              />
              <DateFilter label="Fecha" onDateSelected={() => {}} />

              <button type="button" className="btn btn-primary p-3 h-10">
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      No hay entrevistas disponibles.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
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
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className={`btn ${currentPage >= totalPages ? "btn-disabled" : "btn-primary"}`}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    </Dashboard>
  );
}
