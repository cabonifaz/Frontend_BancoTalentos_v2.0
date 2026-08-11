import { useCallback, useEffect, useState } from "react";
import {
  ExternalLink,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { useApi } from "../../../../core/hooks/useApi";
import { Loading } from "../../../../core/components/ui/Loading";
import { Pagination } from "../../../../core/components";
import {
  deleteClient,
  getClientsAdmin,
  reactivateClient,
} from "../../../../core/services/apiService";
import {
  handleError,
  handleResponse,
} from "../../../../core/utilities/errorHandler";
import {
  BaseResponse,
  ClientAdmin,
  ClientAdminListParams,
  ClientAdminListResponse,
} from "../../../../core/models";
import { ClientFormModal } from "./ClientFormModal";

const cell = (v: unknown) =>
  v === null || v === undefined || v === "" ? (
    <span className="text-gray-300">—</span>
  ) : (
    String(v)
  );

/** null = todos, 1 = activos, 0 = inactivos. */
type EstadoFilter = "" | "1" | "0";

// Debe coincidir con el tamaño de página configurado en BD (PARAMETROS maestro 11).
const ITEMS_PER_PAGE = 5;

export const ClientsManager = () => {
  const [filtro, setFiltro] = useState("");
  const [appliedFiltro, setAppliedFiltro] = useState("");
  const [estado, setEstado] = useState<EstadoFilter>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState<ClientAdmin[]>([]);
  const [total, setTotal] = useState(0);

  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    initial: ClientAdmin | null;
  } | null>(null);
  const [toDelete, setToDelete] = useState<ClientAdmin | null>(null);

  const { loading: loadingList, fetch: fetchList } = useApi<
    ClientAdminListResponse,
    ClientAdminListParams
  >(getClientsAdmin, {
    onError: (e) => handleError(e, enqueueSnackbar),
    onSuccess: (r) => {
      setClients(r.data.registros ?? []);
      setTotal(r.data.total ?? 0);
    },
  });

  const { loading: deleting, fetch: doDelete } = useApi<BaseResponse, number>(
    deleteClient,
    { onError: (e) => handleError(e, enqueueSnackbar) },
  );

  const { loading: reactivating, fetch: doReactivate } = useApi<
    BaseResponse,
    number
  >(reactivateClient, { onError: (e) => handleError(e, enqueueSnackbar) });

  const load = useCallback(
    () =>
      fetchList({
        filtro: appliedFiltro.trim() || undefined,
        idEstado: estado === "" ? undefined : Number(estado),
        pagina: currentPage,
      }),
    [fetchList, appliedFiltro, estado, currentPage],
  );

  useEffect(() => {
    load();
  }, [load]);

  const reactivate = async (client: ClientAdmin) => {
    const response = await doReactivate(client.idCliente);
    handleResponse({ response, showSuccessMessage: true, enqueueSnackbar });
    if ((response.data.result?.idMensaje ?? response.data.idMensaje) === 2) load();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const response = await doDelete(toDelete.idCliente);
    handleResponse({ response, showSuccessMessage: true, enqueueSnackbar });
    setToDelete(null);
    if ((response.data.result?.idMensaje ?? response.data.idMensaje) === 2) {
      // Si la página queda vacía tras la baja, retrocede una.
      if (clients.length === 1 && currentPage > 1) setCurrentPage((p) => p - 1);
      else load();
    }
  };

  const loading = loadingList || deleting || reactivating;
  const canSearch = filtro.trim() !== "";
  const search = () => {
    setCurrentPage(1);
    setAppliedFiltro(filtro);
  };
  const changeEstado = (value: EstadoFilter) => {
    setCurrentPage(1);
    setEstado(value);
  };

  return (
    <div className="relative h-full flex flex-col p-6">
      {loading && <Loading opacity="opacity-60" />}

      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Clientes</h2>
          <p className="text-sm text-gray-500">Administra los clientes del sistema.</p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "create", initial: null })}
          className="btn btn-primary flex items-center gap-2 flex-shrink-0"
        >
          <Plus size={16} /> Nuevo cliente
        </button>
      </header>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="input w-full !pl-10"
            placeholder="Buscar por RUC o razón social…"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSearch && search()}
          />
        </div>
        <select
          className="input"
          value={estado}
          onChange={(e) => changeEstado(e.target.value as EstadoFilter)}
        >
          <option value="">Todos</option>
          <option value="1">Activos</option>
          <option value="0">Inactivos</option>
        </select>
        <button
          type="button"
          onClick={search}
          disabled={!canSearch}
          className={`btn ${canSearch ? "btn-primary" : "btn-disabled"}`}
        >
          Buscar
        </button>
        <button
          type="button"
          onClick={load}
          title="Recargar"
          className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto border border-gray-100 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 sticky top-0">
            <tr className="text-left">
              <th className="px-4 py-2.5 font-medium">RUC</th>
              <th className="px-4 py-2.5 font-medium">Razón social</th>
              <th className="px-4 py-2.5 font-medium">Dirección</th>
              <th className="px-4 py-2.5 font-medium">Ubicación</th>
              <th className="px-4 py-2.5 font-medium">Estado</th>
              <th className="px-4 py-2.5 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr
                key={c.idCliente}
                className={`border-t border-gray-100 hover:bg-gray-50 ${
                  c.idEstadoRegistro !== 1 ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <td className="px-4 py-2.5 font-medium">{cell(c.ruc)}</td>
                <td className="px-4 py-2.5">{cell(c.razonSocial)}</td>
                <td className="px-4 py-2.5 max-w-xs truncate" title={c.direccion ?? ""}>
                  {cell(c.direccion)}
                </td>
                <td className="px-4 py-2.5">
                  {c.ubicacion ? (
                    <a
                      href={c.ubicacion}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#00796B] hover:underline"
                    >
                      Ver <ExternalLink size={13} />
                    </a>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.idEstadoRegistro === 1
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {c.idEstadoRegistro === 1 ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setModal({ mode: "edit", initial: c })}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={15} />
                    </button>
                    {c.idEstadoRegistro === 1 ? (
                      <button
                        type="button"
                        onClick={() => setToDelete(c)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => reactivate(c)}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Reactivar"
                      >
                        <RotateCcw size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loadingList && clients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  No se encontraron clientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > ITEMS_PER_PAGE && (
        <div className="mt-3">
          <Pagination
            totalItems={total}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={currentPage}
            onPaginate={setCurrentPage}
          />
        </div>
      )}

      {modal && (
        <ClientFormModal
          mode={modal.mode}
          initial={modal.initial}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      {toDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setToDelete(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm p-6 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <Trash2 size={22} />
            </div>
            <h3 className="text-base font-semibold text-gray-800">Eliminar cliente</h3>
            <p className="text-sm text-gray-500">
              ¿Dar de baja a <span className="font-medium">{toDelete.razonSocial}</span>? Se
              marcará como inactivo.
            </p>
            <div className="flex gap-2 w-full mt-2">
              <button
                type="button"
                onClick={() => setToDelete(null)}
                className="flex-1 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="btn btn-primary flex-1 !bg-red-500 hover:!bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsManager;
