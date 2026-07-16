import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Clock,
  Globe,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Angry,
  Trash2,
} from "lucide-react";
import { Dashboard } from "./Dashboard";
import { Pagination } from "../../core/components";
import { useModal } from "../../core/context/ModalContext";
import { useFetchClients } from "../../core/hooks/useFetchClients";
import { useBlacklist } from "../../core/hooks/blacklist/useBlacklist";
import { getTalent } from "../../core/services/apiService";
import { BlacklistItem } from "../../core/models";
import {
  ModalBlacklistRestriction,
  MODAL_BLACKLIST_RESTRICTION,
} from "../../core/components/modals/ModalBlacklistRestriction";
import {
  ModalRemoveRestriction,
  MODAL_REMOVE_RESTRICTION,
} from "../../core/components/modals/ModalRemoveRestriction";
import {
  ModalRemoveGlobalRestriction,
  MODAL_REMOVE_GLOBAL_RESTRICTION,
} from "../../core/components/modals/ModalRemoveGlobalRestriction";

/** "2026-07-14 16:25:23.0" | "2026-07-14..." → "14/07/2026". */
const formatFecha = (raw?: string): string => {
  if (!raw) return "";
  const datePart = raw.split(" ")[0].split("T")[0];
  const [y, m, d] = datePart.split("-");
  return y && m && d ? `${d}/${m}/${y}` : datePart;
};

/**
 * Debe coincidir con el tamaño de página que el SP lee de PARAMETROS
 * (ID_MAESTRO = 11, NUM3 = 2), el mismo que usa el listado de talentos.
 */
const ITEMS_PER_PAGE = 5;

interface TalentGroup {
  idTalento: number;
  nombreTalento: string;
  restrictions: BlacklistItem[];
  isGlobal: boolean;
  lastUser: string;
  lastDate: string;
}

export const Blacklist = () => {
  const { openModal } = useModal();
  const { clientes } = useFetchClients();
  const {
    items,
    total,
    history,
    totalHistory,
    loadingList,
    loadingHistory,
    loadingMoreHistory,
    historyFailed,
    fetchBlacklist,
    fetchHistory,
  } = useBlacklist();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const historySentinelRef = useRef<HTMLDivElement>(null);
  const [clientFilter, setClientFilter] = useState<number | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  // Última página del historial ya traída: el scroll infinito pide la siguiente.
  const [historyPage, setHistoryPage] = useState(1);
  // Filtros ya confirmados con "Buscar": son los que se reenvían al paginar.
  const [appliedFilters, setAppliedFilters] = useState<{
    nombre?: string;
    idCliente?: number;
  }>({});
  const [selectedTalentId, setSelectedTalentId] = useState<number | null>(null);
  const [contact, setContact] = useState<{ email: string; celular: string } | null>(
    null
  );
  const [historyOpen, setHistoryOpen] = useState(false);
  const [detailVisible, setDetailVisible] = useState(true);

  // Estado del modal agregar/editar restricción. `pickTalent` distingue el alta
  // desde el módulo (hay que buscar el talento) del alta sobre el ya seleccionado.
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [pickTalent, setPickTalent] = useState(false);
  const [editingRestriction, setEditingRestriction] =
    useState<BlacklistItem | null>(null);
  const [removingRestriction, setRemovingRestriction] =
    useState<BlacklistItem | null>(null);

  useEffect(() => {
    fetchBlacklist({ ...appliedFilters, pagina: currentPage });
  }, [fetchBlacklist, appliedFilters, currentPage]);

  // Agrupa las restricciones activas por talento (una fila por talento+cliente).
  const groups = useMemo<TalentGroup[]>(() => {
    const map = new Map<number, TalentGroup>();
    for (const it of items) {
      let group = map.get(it.idTalento);
      if (!group) {
        group = {
          idTalento: it.idTalento,
          nombreTalento: it.nombreTalento,
          restrictions: [],
          isGlobal: false,
          lastUser: it.usucre,
          lastDate: it.fchcre,
        };
        map.set(it.idTalento, group);
      }
      group.restrictions.push(it);
      if (it.idCliente === 0) group.isGlobal = true;
      if (it.fchcre > group.lastDate) {
        group.lastDate = it.fchcre;
        group.lastUser = it.usucre;
      }
    }
    return Array.from(map.values());
  }, [items]);

  const selectedGroup = useMemo(
    () => groups.find((g) => g.idTalento === selectedTalentId) || null,
    [groups, selectedTalentId]
  );

  // Carga el contacto (correo/celular) del talento seleccionado.
  useEffect(() => {
    let active = true;
    setContact(null);
    setHistoryOpen(false);
    setHistoryPage(1);
    if (selectedTalentId == null) return;
    getTalent(selectedTalentId)
      .then(({ data }) => {
        if (active && data.result?.idMensaje === 2) {
          setContact({ email: data.email, celular: data.celular });
        }
      })
      .catch(() => {
        /* contacto opcional: se ignora el error */
      });
    return () => {
      active = false;
    };
  }, [selectedTalentId]);

  const handleSelect = (idTalento: number) => {
    setSelectedTalentId(idTalento);
    if (window.innerWidth <= 678) setDetailVisible(true);
  };

  // Una búsqueda nueva siempre vuelve a la primera página.
  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedFilters({
      nombre: searchInputRef.current?.value.trim() || undefined,
      idCliente: clientFilter === "" ? undefined : Number(clientFilter),
    });
  };

  /**
   * El historial se refresca siempre que esté abierto, para que nunca muestre
   * datos previos al cambio. Vuelve a la primera página: el scroll infinito
   * reconstruye el resto conforme el usuario baje.
   */
  const reloadHistoryIfOpen = () => {
    if (!historyOpen || selectedTalentId == null) return;
    setHistoryPage(1);
    fetchHistory(selectedTalentId, 1);
  };

  /**
   * Tras guardar: un alta reordena el listado (ordena por última restricción)
   * y manda al talento a la primera página.
   */
  const refreshAfterSave = () => {
    if (modalMode === "add" && currentPage !== 1) {
      setCurrentPage(1); // el efecto se encarga de recargar
    } else {
      fetchBlacklist({ ...appliedFilters, pagina: currentPage });
    }
    reloadHistoryIfOpen();
  };

  /** Quitar no reordena el listado, así que se recarga la página actual. */
  const refreshAfterRemove = () => {
    fetchBlacklist({ ...appliedFilters, pagina: currentPage });
    reloadHistoryIfOpen();
  };

  /** Alta desde el módulo: el talento se busca dentro del modal. */
  const openRegisterTalent = () => {
    setModalMode("add");
    setEditingRestriction(null);
    setPickTalent(true);
    openModal(MODAL_BLACKLIST_RESTRICTION);
  };

  const openAddRestriction = () => {
    setModalMode("add");
    setEditingRestriction(null);
    setPickTalent(false);
    openModal(MODAL_BLACKLIST_RESTRICTION);
  };

  const openEditRestriction = (restriction: BlacklistItem) => {
    setModalMode("edit");
    setEditingRestriction(restriction);
    setPickTalent(false);
    openModal(MODAL_BLACKLIST_RESTRICTION);
  };

  /**
   * Quitar una restricción global no libera al talento de golpe: abre el modal
   * que permite conservarla para los clientes que se elijan. Las restricciones
   * de un cliente concreto son una baja directa, solo con confirmación.
   */
  const openRemoveRestriction = (restriction: BlacklistItem) => {
    setRemovingRestriction(restriction);
    openModal(
      restriction.idCliente === 0
        ? MODAL_REMOVE_GLOBAL_RESTRICTION
        : MODAL_REMOVE_RESTRICTION
    );
  };

  const toggleHistory = () => {
    const next = !historyOpen;
    setHistoryOpen(next);
    if (next && selectedTalentId != null) {
      setHistoryPage(1);
      fetchHistory(selectedTalentId, 1);
    }
  };

  const handlePaginate = (page: number) => {
    setCurrentPage(page);
  };

  const hasMoreHistory = history.length < totalHistory;

  const loadMoreHistory = useCallback(() => {
    if (selectedTalentId == null) return;
    const next = historyPage + 1;
    setHistoryPage(next);
    fetchHistory(selectedTalentId, next, true);
  }, [selectedTalentId, historyPage, fetchHistory]);

  /**
   * Scroll infinito del historial: la apertura solo trae la primera página y
   * cada vez que el final de la línea de tiempo entra en pantalla se pide la
   * siguiente. El observador se rearma tras cada carga, así que si el usuario
   * sigue bajando encadena páginas; mientras carga queda desconectado para no
   * disparar la misma página dos veces.
   */
  useEffect(() => {
    if (!historyOpen || historyFailed) return;
    if (!hasMoreHistory || loadingHistory || loadingMoreHistory) return;

    const sentinel = historySentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMoreHistory();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    historyOpen,
    historyFailed,
    hasMoreHistory,
    loadingHistory,
    loadingMoreHistory,
    loadMoreHistory,
  ]);

  return (
    <div className="relative">
      <Dashboard>
        <ModalBlacklistRestriction
          mode={modalMode}
          idTalento={pickTalent ? null : selectedTalentId}
          talentName={pickTalent ? undefined : selectedGroup?.nombreTalento}
          restriction={editingRestriction}
          allowTalentSearch={pickTalent}
          onSaved={refreshAfterSave}
        />

        <ModalRemoveRestriction
          restriction={removingRestriction}
          talentName={selectedGroup?.nombreTalento}
          onDone={refreshAfterRemove}
        />

        <ModalRemoveGlobalRestriction
          restriction={removingRestriction}
          talentName={selectedGroup?.nombreTalento}
          onDone={refreshAfterRemove}
        />

        <div className="flex h-full flex-col overflow-x-hidden">
          {/* Header + filtros */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
            <div className="flex flex-col w-full sm:w-auto">
              <h1 className="text-lg font-semibold text-gray-800">
                Lista Negra
              </h1>
              <span className="text-sm text-[#71717A] hidden xl:block whitespace-nowrap">
                {`${total} talento(s) restringido(s)`}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto gap-3">
              <button
                type="button"
                onClick={openRegisterTalent}
                className="flex items-center justify-center gap-1 btn btn-outline-blue w-full sm:w-auto flex-shrink-0 whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                Agregar a lista negra
              </button>

              <select
                value={clientFilter}
                onChange={(e) =>
                  setClientFilter(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="w-full sm:w-52 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccionar..</option>
                <option value={0}>Todos los clientes</option>
                {clientes.map((c) => (
                  <option key={c.idCliente} value={c.idCliente}>
                    {c.razonSocial}
                  </option>
                ))}
              </select>

              <div className="flex items-center w-full sm:w-[320px] gap-3">
                <div className="flex relative h-10 flex-1 min-w-0">
                  <Search className="absolute top-2 left-3" size={20} />
                  <input
                    type="text"
                    ref={searchInputRef}
                    placeholder="Buscar por talento"
                    className="input-search-container"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="btn btn-primary flex-shrink-0"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>

          <div className="flex mt-4 min-h-0 flex-1 gap-4">
            {/* Panel izquierdo: talentos restringidos */}
            <div className="flex flex-col w-full md:w-[340px] xl:w-[370px] flex-shrink-0 min-h-0">
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden border rounded-lg md:border-none *:mb-2">
                {loadingList ? (
                  <p className="text-sm text-[#71717A] p-4">Cargando…</p>
                ) : groups.length === 0 ? (
                  <p className="text-sm text-[#71717A] p-4">
                    No hay talentos en la lista negra.
                  </p>
                ) : (
                  groups.map((g) => (
                    <button
                      key={g.idTalento}
                      type="button"
                      onClick={() => handleSelect(g.idTalento)}
                      className={`w-full text-left rounded-lg border p-3 transition-colors ${
                        selectedTalentId === g.idTalento
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Angry className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <p className="font-semibold text-sm text-gray-800 truncate">
                          {g.nombreTalento}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {g.isGlobal ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            <Globe className="h-3 w-3" />
                            Todos los clientes
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                            {g.restrictions.length} cliente(s)
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[#71717A]">
                        {`Últ. mod.: ${g.lastUser} · ${formatFecha(g.lastDate)}`}
                      </p>
                    </button>
                  ))
                )}
              </div>

              {/* Paginación de talentos */}
              <div className="mt-2">
                <Pagination
                  totalItems={total}
                  itemsPerPage={ITEMS_PER_PAGE}
                  currentPage={currentPage}
                  onPaginate={handlePaginate}
                />
              </div>
            </div>

            {/* Panel derecho: detalle */}
            <div
              className={`border-2 shadow-xl rounded-lg overflow-hidden flex-1 min-h-0 absolute top-0 left-0 z-[41] md:z-auto w-full bg-white md:relative md:top-auto md:left-auto ${
                !detailVisible ? "hidden md:block" : ""
              }`}
            >
              {selectedGroup ? (
                <div className="flex flex-col px-4 pt-4 overflow-y-auto overflow-x-hidden h-screen md:h-full pb-8">
                  <button
                    type="button"
                    onClick={() => setDetailVisible(false)}
                    className="w-fit px-4 py-2 rounded-xl bg-[#e4e4e7] flex gap-4 md:hidden items-center my-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <p className="text-[#2e2e2e]">Volver</p>
                  </button>

                  {/* Cabecera del talento */}
                  <div className="flex items-start justify-between gap-4 border-b pb-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Angry className="h-5 w-5 text-gray-700 flex-shrink-0" />
                        <h2 className="text-base font-semibold text-gray-800 truncate">
                          {selectedGroup.nombreTalento}
                        </h2>
                      </div>
                      <p className="text-xs text-[#71717A] mt-1">{`ID: ${selectedGroup.idTalento}`}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-[#71717A]">
                        {contact?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {contact.email}
                          </span>
                        )}
                        {contact?.celular && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {contact.celular}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openAddRestriction}
                      className="flex items-center gap-1 btn btn-outline-blue flex-shrink-0 whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar restricción
                    </button>
                  </div>

                  {/* Restricciones activas */}
                  <div className="mt-4">
                    <h3 className="text-[#52525B] font-semibold mb-3">
                      Restricciones activas
                    </h3>

                    {selectedGroup.isGlobal ? (
                      <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
                        <div className="flex items-center gap-2 text-red-700 font-semibold">
                          <Globe className="h-5 w-5" />
                          Restricción Global
                        </div>
                        {selectedGroup.restrictions
                          .filter((r) => r.idCliente === 0)
                          .map((r) => (
                            <div key={r.idListaNegra} className="mt-2">
                              <p className="text-sm text-red-800">
                                Este talento no puede postular a ningún cliente.
                              </p>
                              <p className="text-sm text-gray-700 mt-2">
                                <span className="font-medium">Motivo: </span>
                                {r.motivo}
                              </p>
                              <div className="flex items-center justify-between mt-3">
                                <p className="text-xs text-[#71717A]">
                                  {`${r.usucre} · ${formatFecha(r.fchcre)}`}
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openEditRestriction(r)}
                                    className="flex items-center gap-1 text-sm text-[var(--color-blue)] hover:underline"
                                  >
                                    <Pencil className="h-4 w-4" />
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openRemoveRestriction(r)}
                                    className="flex items-center gap-1 text-sm text-red-600 hover:underline"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Quitar
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {selectedGroup.restrictions.map((r) => (
                          <div
                            key={r.idListaNegra}
                            className="rounded-lg border border-gray-200 p-4 flex flex-col"
                          >
                            <p className="text-sm font-semibold text-gray-800">
                              {r.cliente}
                            </p>
                            <p className="text-sm text-gray-700 mt-1 flex-1">
                              <span className="font-medium">Motivo: </span>
                              {r.motivo}
                            </p>
                            <p className="text-xs text-[#71717A] mt-3">
                              {`${r.usucre} · ${formatFecha(r.fchcre)}`}
                            </p>
                            <div className="flex gap-3 justify-end mt-3">
                              <button
                                type="button"
                                onClick={() => openEditRestriction(r)}
                                className="flex items-center gap-1 text-sm text-[var(--color-blue)] hover:underline"
                              >
                                <Pencil className="h-4 w-4" />
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => openRemoveRestriction(r)}
                                className="flex items-center gap-1 text-sm text-red-600 hover:underline"
                              >
                                <Trash2 className="h-4 w-4" />
                                Quitar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Historial (colapsable) */}
                  <div className="mt-6 border-t pt-4">
                    <button
                      type="button"
                      onClick={toggleHistory}
                      className="flex items-center gap-2 text-[#52525B] font-semibold"
                    >
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          historyOpen ? "rotate-180" : ""
                        }`}
                      />
                      <Clock className="h-4 w-4" />
                      Historial
                    </button>

                    {historyOpen && (
                      <div className="mt-4 pl-2">
                        {loadingHistory ? (
                          <p className="text-sm text-[#71717A]">
                            Cargando historial…
                          </p>
                        ) : history.length === 0 ? (
                          <p className="text-sm text-[#71717A]">
                            Sin movimientos registrados.
                          </p>
                        ) : (
                          <ol className="relative border-l border-gray-200 ml-2">
                            {history.map((h) => (
                              <li
                                key={h.idHistorialListaNegra}
                                className="mb-5 ml-4"
                              >
                                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-gray-300" />
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                      h.movimiento === "CREACION"
                                        ? "bg-green-100 text-green-700"
                                        : h.movimiento === "ELIMINACION"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    {h.movimiento}
                                  </span>
                                  <span className="text-xs text-[#71717A]">
                                    {formatFecha(h.fchcre)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">
                                  <span className="font-medium">Cliente: </span>
                                  {h.cliente}
                                </p>
                                {h.motivo && (
                                  <p className="text-sm text-gray-700">
                                    <span className="font-medium">Motivo: </span>
                                    {h.motivo}
                                  </p>
                                )}
                                <p className="text-xs text-[#71717A] mt-1">
                                  {`Usuario: ${h.usucre}`}
                                </p>
                              </li>
                            ))}
                          </ol>
                        )}

                        {hasMoreHistory && (
                          <div
                            ref={historySentinelRef}
                            className="py-2 text-center text-sm text-[#71717A]"
                          >
                            {historyFailed ? (
                              <button
                                type="button"
                                onClick={loadMoreHistory}
                                className="text-[var(--color-blue)] hover:underline"
                              >
                                No se pudo cargar el resto. Reintentar
                              </button>
                            ) : (
                              "Cargando más…"
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#71717A] p-8 text-center">
                  Selecciona un talento para ver sus restricciones.
                </div>
              )}
            </div>
          </div>
        </div>
      </Dashboard>
    </div>
  );
};
