import { useCallback, useEffect, useRef, useState } from "react";
import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  ClipboardList,
  Eye,
  FilterX,
  Plus,
  Search,
  TriangleAlert,
  UserPlus,
} from "lucide-react";
import {
  ReqListParams,
  RequerimientosResponse,
  RequirementItem,
} from "../../core/models";
import { useParams } from "../../core/context/ParamsContext";
import {
  BaseOption,
  DateFilter,
  FilterDropDown,
  Loading,
  Pagination,
} from "../../core/components";
import { useApi } from "../../core/hooks/useApi";
import {
  handleError,
  handleResponse,
} from "../../core/utilities/errorHandler";
import { ClientListResponse } from "../../core/models/response/ClientsResponse";
import {
  getClients,
  getRequirements,
} from "../../core/services/apiService";
import { enqueueSnackbar } from "notistack";
import { format } from "date-fns";
import { Dashboard } from "./Dashboard";
import { useNavigate } from "react-router-dom";
import {
  ESTADO_ASIGNADO,
  ESTADO_ATENDIDO,
  ESTADO_CANCELADO,
  ESTADO_EN_PRODUCCION,
  ESTADO_EN_SELECCION,
  ESTADO_PERDIDO,
  ESTADO_REGISTRADO,
  ESTADO_RQ,
  ESTADO_TERMINADO,
} from "../../core/utilities/constants";
import { useModal } from "../../core/context/ModalContext";
import {
  MODAL_CREATE_RQ,
  MODAL_DETAILS_RQ,
} from "../../core/utilities/modalsIds";
import { ModalRQDetails } from "../../core/components/modals/RQdetails";
import { ModalRQCreate } from "../../core/components/modals/RQcreate";

interface SearchProps {
  nPag: number | null;
  idCliente: number | null;
  buscar: string | null;
  estado: number | null;
  fechaSolicitud: string | null;
}

/** El RQ está "cerrado" para asignación una vez asignado o atendido. */
const isAsignacionBloqueada = (req: RequirementItem): boolean =>
  req.idEstado === ESTADO_ASIGNADO || req.idEstado === ESTADO_ATENDIDO;

/**
 * Mismo lenguaje visual que el badge de estado de Entrevistas.
 *
 * Los ocho estados del maestro 24 agrupados por lo que significan:
 * azul = el RQ avanza y está cerrado en su ciclo, morado = está en curso,
 * rojo = terminó mal, verde = recién entra, gris = ya no pide acción.
 */
const ESTADO_BADGE: Record<number, string> = {
  [ESTADO_REGISTRADO]: "bg-green-100 text-green-700",
  [ESTADO_ASIGNADO]: "bg-blue-100 text-blue-700",
  [ESTADO_TERMINADO]: "bg-blue-100 text-blue-700",
  [ESTADO_EN_SELECCION]: "bg-purple-100 text-purple-700",
  [ESTADO_EN_PRODUCCION]: "bg-purple-100 text-purple-700",
  [ESTADO_PERDIDO]: "bg-red-100 text-red-600",
  [ESTADO_CANCELADO]: "bg-red-100 text-red-600",
  [ESTADO_ATENDIDO]: "bg-gray-100 text-gray-600",
};

const EstadoBadge = ({
  idEstado,
  estado,
}: {
  idEstado: number;
  estado: string;
}) => (
  <span
    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${
      ESTADO_BADGE[idEstado] || "bg-gray-100 text-gray-700"
    }`}
  >
    {estado}
  </span>
);

export const Requirements = () => {
  const navigate = useNavigate();
  const RequerimientoRef = useRef<HTMLInputElement>(null);
  const hasFetchedClients = useRef(false);
  const hasFetchedReqs = useRef(false);

  const [openDropdown, setOpenDropdown] = useState<number | null>(
    null
  );
  const [selectedEstado, setSelectedEstado] = useState<number | null>(
    null
  );
  const [selectedCliente, setSelectedCliente] = useState<
    number | null
  >(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    null
  );
  const [selectedRQ, setSelectedRQ] =
    useState<RequirementItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasSearchText, setHasSearchText] = useState(false);

  const { paramsByMaestro, loading: loadingParams } = useParams();

  const { openModal, closeModal, isModalOpen } = useModal();
  const rqState = paramsByMaestro[ESTADO_RQ] || [];

  const {
    loading: loadingClientes,
    data: clientesResponse,
    fetch: fetchClients,
  } = useApi<ClientListResponse, null>(getClients, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) =>
      handleResponse({
        response: response,
        showSuccessMessage: false,
        enqueueSnackbar: enqueueSnackbar,
      }),
  });

  const {
    loading: loadingReqs,
    data: ReqsResponse,
    fetch: fetchRequerimientos,
  } = useApi<RequerimientosResponse, ReqListParams>(getRequirements, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) =>
      handleResponse({
        response: response,
        showSuccessMessage: false,
        enqueueSnackbar: enqueueSnackbar,
      }),
  });

  const paramOptions: BaseOption[] =
    paramsByMaestro[24]?.map((param) => ({
      value: param.num1.toString(),
      label: param.string1,
    })) || [];

  const clientOptions: BaseOption[] =
    clientesResponse?.clientes
      .filter((client) => client.total > 0)
      .map((client) => ({
        value: client.idCliente.toString(),
        label: client.razonSocial,
      })) || [];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const search = ({
    nPag,
    idCliente,
    buscar,
    estado,
    fechaSolicitud,
  }: SearchProps) => {
    fetchRequerimientos({
      nPag: nPag || 1,
      idCliente: idCliente,
      buscar: buscar,
      estado: estado,
      fechaSolicitud: fechaSolicitud,
    });
  };

  const handleEstadoChangeFilter = (selectedValues: string[]) => {
    const newValue = selectedValues[0]
      ? Number(selectedValues[0])
      : null;
    setSelectedEstado(newValue);
    setCurrentPage(1);
    executeSearch({
      nPag: 1,
      estado: newValue,
      fechaSolicitud: selectedDate ? selectedDate : null,
    });
  };

  const handleClienteChangeFilter = (selectedValues: string[]) => {
    const newValue = selectedValues[0]
      ? Number(selectedValues[0])
      : null;
    setSelectedCliente(newValue);
    setCurrentPage(1);
    executeSearch({
      nPag: 1,
      estado: selectedEstado,
      fechaSolicitud: selectedDate ? selectedDate : null,
      idCliente: newValue,
    });
  };

  const handleDateSelected = (date: Date | null) => {
    let searchDate = null;
    if (date !== null) {
      searchDate = format(new Date(date), "yyyy/MM/dd");
    }

    setSelectedDate(searchDate);
    setCurrentPage(1);
    executeSearch({
      nPag: 1,
      estado: selectedEstado,
      fechaSolicitud: date ? searchDate : null,
    });
  };

  const executeSearch = useCallback(
    (
      overrides: {
        nPag?: number | null;
        estado?: number | null;
        fechaSolicitud?: string | null;
        idCliente?: number | null;
      } = {}
    ) => {
      if (!loadingReqs) {
        search({
          nPag: overrides.nPag || 1,
          idCliente:
            overrides.idCliente !== undefined
              ? overrides.idCliente
              : selectedCliente,
          buscar: RequerimientoRef.current?.value || null,
          estado:
            overrides.estado !== undefined
              ? overrides.estado
              : selectedEstado,
          fechaSolicitud:
            overrides.fechaSolicitud !== undefined
              ? overrides.fechaSolicitud
              : selectedDate
              ? selectedDate
              : null,
        });
      }
    },
    [
      loadingReqs,
      search,
      selectedCliente,
      selectedDate,
      selectedEstado,
    ]
  );

  useEffect(() => {
    if (!hasFetchedClients.current && !loadingClientes) {
      fetchClients(null);
      hasFetchedClients.current = true;
    }

    if (!hasFetchedReqs.current && !loadingReqs) {
      executeSearch();
      hasFetchedReqs.current = true;
    }
  }, [fetchClients, executeSearch, loadingClientes, loadingReqs]);

  const handleSearch = () => {
    setCurrentPage(1);
    executeSearch({ nPag: 1 });
  };

  const openDetallesRQModal = (req: RequirementItem) => {
    setSelectedRQ(req);
    openModal(MODAL_DETAILS_RQ);
  };

  const updateRQData = () => {
    executeSearch();
    fetchClients(null);
  };

  const handleAsignarClick = (idRequerimiento: number) => {
    navigate("/dashboard/tableAsignarTalento", {
      state: { idRequerimiento },
    });
  };

  const getAlertIcon = (idAlerta: number) => {
    const className = "w-5 h-5 cursor-pointer min-w-5 min-h-5";
    switch (idAlerta) {
      case 1:
        return <CircleCheck className={className} color="#22c55e" />; // Alerta baja
      case 2:
        return <TriangleAlert className={className} color="#f59e0b" />; // Alerta media
      case 3:
        return <CircleAlert className={className} color="#ef4444" />; // Alerta alta
      default:
        return <CircleCheck className={className} color="#22c55e" />;
    }
  };

  /**
   * Texto del tooltip de la columna Alerta. Sin alerta no hay vencimiento que
   * mostrar, así que se dice explícitamente en vez de dejar la celda muda.
   */
  const getAlertLabel = (req: RequirementItem) =>
    req?.idAlerta !== null && req.idAlerta > 0
      ? `Vence: ${req.fechaVencimiento}`
      : "Sin alerta de vencimiento";

  const handlePaginate = (page: number) => {
    setCurrentPage(page);
    executeSearch({ nPag: page });
  };

  // El input de búsqueda es no controlado (ref), así que un ref no dispara
  // re-render: se acompaña de este flag para que "Limpiar filtros" aparezca
  // y desaparezca al escribir.
  const hasActiveFilters =
    hasSearchText ||
    selectedCliente !== null ||
    selectedEstado !== null ||
    selectedDate !== null;

  const handleClearFilters = () => {
    if (RequerimientoRef.current) RequerimientoRef.current.value = "";
    setHasSearchText(false);
    setSelectedCliente(null);
    setSelectedEstado(null);
    setSelectedDate(null);
    setOpenDropdown(null);
    setCurrentPage(1);
    // Los overrides van explícitos: el estado de React todavía no se ha aplicado
    // cuando executeSearch lee sus dependencias.
    executeSearch({
      nPag: 1,
      estado: null,
      fechaSolicitud: null,
      idCliente: null,
    });
  };

  const shouldShowPagination =
    (ReqsResponse?.totalElementos || 0) > 0 &&
    (ReqsResponse?.totalPaginas || 0) > 1;

  return (
    <>
      {(loadingClientes || loadingParams || loadingReqs) && (
        <Loading opacity="opacity-60" />
      )}

      {/**Modal Details V3 */}
      {isModalOpen(MODAL_DETAILS_RQ) && (
        <ModalRQDetails
          rqId={selectedRQ?.idRequerimiento || 0}
          rqStates={rqState}
          onClose={() => closeModal(MODAL_DETAILS_RQ)}
          clients={clientesResponse?.clientes || []}
          handleAssingPost={handleAsignarClick}
          updateRQData={updateRQData}
        />
      )}

      {isModalOpen(MODAL_CREATE_RQ) && (
        <ModalRQCreate
          rqStates={rqState}
          clients={clientesResponse?.clientes || []}
          onClose={() => closeModal(MODAL_CREATE_RQ)}
          updateRQData={updateRQData}
        />
      )}

      <Dashboard>
        <div className="flex h-full flex-col overflow-x-hidden gap-4">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl font-semibold">Requerimientos</h2>
              {(ReqsResponse?.totalElementos || 0) > 0 && (
                <span className="text-sm text-gray-500">
                  {ReqsResponse?.totalElementos} registro
                  {ReqsResponse?.totalElementos === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <button
              type="button"
              className="btn btn-blue mx-0 flex h-10 items-center gap-2"
              onClick={() => openModal(MODAL_CREATE_RQ)}
            >
              <Plus size={18} strokeWidth={2} />
              Nuevo RQ
            </button>
          </div>
          {/* filters */}
          <div className="shrink-0 rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4">
              {/* Búsqueda + acción principal, alineadas por la base */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="requerimiento"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Búsqueda por título o código de requerimiento
                  </label>
                  <div className="relative">
                    <Search
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      name="requerimiento"
                      id="requerimiento"
                      ref={RequerimientoRef}
                      onChange={(e) =>
                        setHasSearchText(e.target.value.trim() !== "")
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Ej: Analista de datos / RQ-0123"
                      className="input h-10 w-full py-0 pl-10"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="btn btn-primary mx-0 flex h-10 shrink-0 items-center justify-center gap-2 sm:w-32"
                >
                  <Search size={18} strokeWidth={2} />
                  Buscar
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
                <FilterDropDown
                  name="cliente"
                  label="Cliente"
                  options={clientOptions}
                  optionsType="radio"
                  optionsPanelSize="w-80"
                  inputPosition="right"
                  isOpen={openDropdown === 0}
                  onToggle={() =>
                    setOpenDropdown(openDropdown === 0 ? null : 0)
                  }
                  selectedValues={
                    selectedCliente
                      ? [selectedCliente.toString()]
                      : []
                  }
                  onChange={handleClienteChangeFilter}
                />
                <FilterDropDown
                  name="estado"
                  label="Estado"
                  options={paramOptions}
                  optionsType="radio"
                  optionsPanelSize="w-36"
                  inputPosition="right"
                  isOpen={openDropdown === 1}
                  onToggle={() =>
                    setOpenDropdown(openDropdown === 1 ? null : 1)
                  }
                  selectedValues={
                    selectedEstado ? [selectedEstado.toString()] : []
                  }
                  onChange={handleEstadoChangeFilter}
                />
                <DateFilter
                  label="Fecha"
                  onDateSelected={handleDateSelected}
                />

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
              <table className="table table-fixed min-w-[1220px]">
                <colgroup>
                  <col className="w-16" />
                  <col className="w-[16%]" />
                  <col className="w-[27%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[9%]" />
                  <col className="w-32" />
                  <col className="w-20" />
                  <col className="w-44" />
                </colgroup>
                <thead>
                  {/* La cabecera se fija en los th (no en el thead): con
                      border-collapse es lo único que sostiene el sticky. */}
                  <tr className="table-header uppercase [&>th]:sticky [&>th]:top-0 [&>th]:z-10 [&>th]:bg-gray-50">
                    <th className="table-header-cell text-center">ID</th>
                    <th className="table-header-cell text-center">Cliente</th>
                    <th className="table-header-cell">Título</th>
                    <th className="table-header-cell text-center">
                      Requerimiento
                    </th>
                    <th className="table-header-cell text-center">
                      Fecha Solicitud
                    </th>
                    <th className="table-header-cell text-center">Estado</th>
                    <th className="table-header-cell text-center">
                      Confirmados / Vacantes
                    </th>
                    <th className="table-header-cell text-center">Alerta</th>
                    <th className="table-header-cell text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(ReqsResponse?.requerimientos || []).length <=
                  0 ? (
                    <tr>
                      <td colSpan={9} className="table-empty">
                        <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
                          <ClipboardList size={32} strokeWidth={1.5} />
                          <p className="text-sm">
                            No hay requerimientos disponibles.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    ReqsResponse?.requerimientos?.map((req) => (
                      <tr
                        key={req.idRequerimiento}
                        className="table-row"
                      >
                        <td className="table-cell text-center text-gray-500 tabular-nums">
                          {req.idRequerimiento}
                        </td>
                        <td
                          className="table-cell truncate text-center"
                          title={req.cliente}
                        >
                          {req.cliente}
                        </td>
                        <td
                          className="table-cell truncate"
                          title={req.titulo || ""}
                        >
                          <span className="font-medium text-gray-900">
                            {req.titulo || ""}
                          </span>
                        </td>
                        <td
                          className="table-cell truncate text-center"
                          title={req.codigoRQ}
                        >
                          {req.codigoRQ}
                        </td>
                        <td className="table-cell text-center tabular-nums">
                          {req.fechaSolicitud}
                        </td>
                        <td className="table-cell text-center">
                          <EstadoBadge
                            idEstado={req.idEstado}
                            estado={req.estado}
                          />
                        </td>
                        <td className="table-cell text-center">
                          <div className="min-w-full flex justify-center">
                            <div className="w-fit relative group">
                              <p className=" px-2 py-1 rounded-lg bg-slate-100 w-fit">
                                {req.vacantesCubiertas} /{" "}
                                {req.vacantes}
                              </p>
                              <div className="absolute invisible group-hover:visible z-10 right-full top-1/2 transform -translate-y-1/2 mr-2 px-2 py-1 text-xs bg-[#484848] text-white rounded whitespace-nowrap">
                                {req?.lstPerfiles?.map(
                                  (perfil, index) => (
                                    <p
                                      className="text-start"
                                      key={index}
                                    >
                                      {perfil.vacantesCubiertas} /{" "}
                                      {perfil.vacantesTotales}{" "}
                                      {perfil.perfil}
                                    </p>
                                  )
                                )}
                                <div className="absolute top-1/2 left-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-[#484848]"></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell text-center">
                          <div className="relative inline-block group">
                            {req?.idAlerta !== null && req?.idAlerta > 0 ? (
                              getAlertIcon(req.idAlerta)
                            ) : (
                              // Estado neutro: la columna siempre dice algo, así
                              // que un RQ sin alerta se lee como "revisado y sin
                              // vencimiento", no como un dato que falta.
                              <CircleDashed
                                className="w-5 h-5 cursor-pointer min-w-5 min-h-5"
                                color="#a1a1aa"
                              />
                            )}
                            <div className="absolute invisible group-hover:visible z-10 right-full top-1/2 transform -translate-y-1/2 mr-2 px-2 py-1 text-xs bg-[#484848] text-white rounded whitespace-nowrap">
                              {getAlertLabel(req)}
                              <div className="absolute top-1/2 left-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-[#484848]"></div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          {/* mx-0 anula el margen que trae .btn: aquí separa el gap */}
                          <div className="flex items-center justify-center gap-2">
                            {(() => {
                              const bloqueado = isAsignacionBloqueada(req);
                              return (
                                <div className="relative group">
                                  <button
                                    onClick={() =>
                                      handleAsignarClick(
                                        req.idRequerimiento
                                      )
                                    }
                                    disabled={bloqueado}
                                    title="Asignar talento"
                                    className={`btn btn-actions mx-0 flex h-8 items-center gap-1.5 px-2.5 ${
                                      bloqueado
                                        ? "btn-disabled"
                                        : "btn-blue"
                                    }`}
                                  >
                                    <UserPlus size={14} strokeWidth={2} />
                                    Asignar
                                  </button>
                                  {bloqueado && (
                                    <div className="absolute invisible group-hover:visible z-10 left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs bg-[#484848] text-white rounded whitespace-nowrap">
                                      {req.idEstado === ESTADO_ATENDIDO
                                        ? "Requerimiento atendido"
                                        : "Requerimiento asignado — talentos completos"}
                                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#484848]"></div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                            <button
                              onClick={() => openDetallesRQModal(req)}
                              title="Ver detalles"
                              className="btn btn-actions btn-primary mx-0 flex h-8 items-center gap-1.5 px-2.5"
                            >
                              <Eye size={14} strokeWidth={2} />
                              Detalles
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination — mismo componente que Lista Negra */}
          {shouldShowPagination && (
            <div className="shrink-0">
              <Pagination
                totalPages={ReqsResponse?.totalPaginas || 0}
                currentPage={currentPage}
                onPaginate={handlePaginate}
              />
            </div>
          )}
        </div>
      </Dashboard>
    </>
  );
};
