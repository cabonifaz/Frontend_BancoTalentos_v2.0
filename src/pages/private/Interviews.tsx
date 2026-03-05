import { useState } from "react";
import { Dashboard } from "./Dashboard";
import { BaseOption, DateFilter, FilterDropDown } from "../../core/components";

// ─── Static mock data ────────────────────────────────────────────────────────

interface InterviewItem {
  id: number;
  talento: string;
  tituloRQ: string;
  cliente: string;
  fechaEntrevista: string;
  estado:
    | "Registrado"
    | "Pendiente"
    | "En Proceso"
    | "Finalizado"
    | "Cancelado";
}

const MOCK_INTERVIEWS: InterviewItem[] = [
  {
    id: 1024,
    talento: "Juan Pérez",
    tituloRQ: "SOL_BS_123 Java Dev",
    cliente: "Banbif",
    fechaEntrevista: "30/01/2026 10:00 AM",
    estado: "Registrado",
  },
  {
    id: 1023,
    talento: "Maria Gonzalez",
    tituloRQ: "SOL_BS_000 QA Analyst",
    cliente: "Interbank",
    fechaEntrevista: "29/01/2026 03:00 PM",
    estado: "Pendiente",
  },
  {
    id: 1022,
    talento: "Carlos Ruiz",
    tituloRQ: "SOL_BS_999 Lider Técnico",
    cliente: "Banbif",
    fechaEntrevista: "28/01/2026 11:30 AM",
    estado: "En Proceso",
  },
  {
    id: 1021,
    talento: "Ana Torres",
    tituloRQ: "RQ-006066 Fullstack",
    cliente: "BCP",
    fechaEntrevista: "26/01/2026 09:00 AM",
    estado: "Finalizado",
  },
  {
    id: 1020,
    talento: "Luis Sanchez",
    tituloRQ: "RQ-006065 Backend",
    cliente: "Banbif",
    fechaEntrevista: "25/01/2026 04:00 PM",
    estado: "Cancelado",
  },
];

const TOTAL_PAGES = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS: Record<string, string> = {
  JP: "bg-blue-400",
  MG: "bg-purple-400",
  CR: "bg-orange-400",
  AT: "bg-indigo-400",
  LS: "bg-teal-400",
};

function getAvatarColor(initials: string): string {
  return AVATAR_COLORS[initials] ?? "bg-gray-400";
}

type EstadoBadgeProps = { estado: InterviewItem["estado"] };

const BADGE_CLASSES: Record<InterviewItem["estado"], string> = {
  Registrado: "bg-green-100 text-green-700",
  Pendiente: "bg-yellow-100 text-yellow-700",
  "En Proceso": "bg-blue-100 text-blue-700",
  Finalizado: "bg-gray-100 text-gray-600",
  Cancelado: "bg-red-100 text-red-500",
};

function EstadoBadge({ estado }: EstadoBadgeProps) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${BADGE_CLASSES[estado]}`}
    >
      {estado}
    </span>
  );
}

// ─── Filter options (static for mockup) ──────────────────────────────────────

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
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<string[]>([]);
  const [selectedEstado, setSelectedEstado] = useState<string[]>([]);
  const [buscar, setBuscar] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Simple client-side filter for the mockup
  const filtered = MOCK_INTERVIEWS.filter((item) => {
    const matchesBuscar =
      !buscar ||
      item.talento.toLowerCase().includes(buscar.toLowerCase()) ||
      item.tituloRQ.toLowerCase().includes(buscar.toLowerCase()) ||
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
      <div className="p-4 mx-4 xl:mx-16">
        {/* Page header */}
        <div className="flex justify-between items-center my-4">
          <h2 className="text-2xl font-semibold">Entrevistas</h2>
          <button
            type="button"
            className="btn btn-primary p-3 h-12 flex items-center gap-2"
            onClick={() => {}}
          >
            <span className="text-lg leading-none">+</span>
            Nueva Entrevista
          </button>
        </div>

        {/* Filters panel */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col gap-4">
            {/* Search row */}
            <div className="flex flex-col gap-2 lg:flex-row lg:gap-4">
              <div className="flex-1">
                <label
                  htmlFor="buscar-entrevista"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Búsqueda por título de RQ, talento o código
                </label>
                <div className="relative">
                  {/* Search icon */}
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

            {/* Dropdown filters row */}
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

              <button
                type="button"
                className="btn btn-primary p-3 h-10"
                onClick={() => {}}
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
                  <th className="table-header-cell">Título RQ</th>
                  <th className="table-header-cell">Cliente</th>
                  <th className="table-header-cell">Fecha Entrevista</th>
                  <th className="table-header-cell">Estado</th>
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
                  filtered.map((item) => {
                    const initials = getInitials(item.talento);
                    return (
                      <tr key={item.id} className="table-row">
                        <td className="table-cell text-gray-500">{item.id}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-semibold shrink-0 ${getAvatarColor(
                                initials,
                              )}`}
                            >
                              {initials}
                            </span>
                            <span className="font-medium text-gray-900">
                              {item.talento}
                            </span>
                          </div>
                        </td>
                        <td className="table-cell">{item.tituloRQ}</td>
                        <td className="table-cell">{item.cliente}</td>
                        <td className="table-cell">{item.fechaEntrevista}</td>
                        <td className="table-cell">
                          <EstadoBadge estado={item.estado} />
                        </td>
                      </tr>
                    );
                  })
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
            Página {currentPage} de {TOTAL_PAGES}
          </span>
          <button
            className={`btn ${
              currentPage >= TOTAL_PAGES ? "btn-disabled" : "btn-primary"
            }`}
            onClick={() => setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1))}
            disabled={currentPage >= TOTAL_PAGES}
          >
            Siguiente
          </button>
        </div>
      </div>
    </Dashboard>
  );
}
