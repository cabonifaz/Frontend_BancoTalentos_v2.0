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
import { useApi } from "@/core/hooks/useApi";
import { Loading } from "@/core/components/ui/Loading";
import { Pagination } from "@/core/components";
import { deleteClient, getClientsAdmin, reactivateClient } from "@/core/services/administration.service";
import {
  handleError,
  handleResponse,
} from "@/core/utilities/errorHandler";
import {
  BaseResponse,
  ClientAdmin,
  ClientAdminListParams,
  ClientAdminListResponse,
} from "@/core/models";
import { Button } from "@/core/components/ui/shadcn/button";
import { Input } from "@/core/components/ui/shadcn/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/core/components/ui/shadcn/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/shadcn/table";
import { AppSelect } from "@/core/components/ui/AppSelect";
import { Hint } from "@/core/components/ui/Hint";
import { ClientFormModal } from "./ClientFormModal";

const cell = (v: unknown) =>
  v === null || v === undefined || v === "" ? (
    <span className="text-gray-300 dark:text-slate-600">—</span>
  ) : (
    String(v)
  );

/** null = todos, 1 = activos, 0 = inactivos. */
type EstadoFilter = "" | "1" | "0";

const ESTADO_OPTIONS = [
  { value: "1", label: "Activos" },
  { value: "0", label: "Inactivos" },
];

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
          <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Clientes</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Administra los clientes del sistema.</p>
        </div>
        <Button
          onClick={() => setModal({ mode: "create", initial: null })}
          className="mx-1 flex-shrink-0"
        >
          <Plus size={16} /> Nuevo cliente
        </Button>
      </header>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
          />
          <Input
            className="!pl-10"
            aria-label="Buscar clientes"
            placeholder="Buscar por RUC o razón social…"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSearch && search()}
          />
        </div>
        <AppSelect
          aria-label="Estado"
          className="h-auto w-auto min-w-[9rem] p-3"
          value={estado}
          onChange={(v) => changeEstado(v as EstadoFilter)}
          options={ESTADO_OPTIONS}
          placeholder="Todos"
        />
        <Button onClick={search} disabled={!canSearch} className="mx-1">
          Buscar
        </Button>
        <Hint label="Recargar">
          <button
            type="button"
            onClick={load}
            aria-label="Recargar"
            className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <RefreshCw size={16} />
          </button>
        </Hint>
      </div>

      <div className="flex-1 min-h-0 overflow-auto border border-gray-100 rounded-lg dark:border-slate-700">
        <Table className="w-full text-sm">
          <TableHeader className="bg-gray-50 text-gray-500 sticky top-0 dark:bg-slate-800 dark:text-slate-400">
            <TableRow className="text-left">
              <TableHead className="px-4 py-2.5 font-medium">RUC</TableHead>
              <TableHead className="px-4 py-2.5 font-medium">Razón social</TableHead>
              <TableHead className="px-4 py-2.5 font-medium">Dirección</TableHead>
              <TableHead className="px-4 py-2.5 font-medium">Ubicación</TableHead>
              <TableHead className="px-4 py-2.5 font-medium">Estado</TableHead>
              <TableHead className="px-4 py-2.5 font-medium text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((c) => (
              <TableRow
                key={c.idCliente}
                className={`border-t border-gray-100 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700 ${
                  c.idEstadoRegistro !== 1 ? "text-gray-400 dark:text-slate-500" : "text-gray-600 dark:text-slate-300"
                }`}
              >
                <TableCell className="px-4 py-2.5 font-medium">{cell(c.ruc)}</TableCell>
                <TableCell className="px-4 py-2.5">{cell(c.razonSocial)}</TableCell>
                <Hint label={c.direccion ?? ""}>
                  <TableCell className="px-4 py-2.5 max-w-xs truncate">
                    {cell(c.direccion)}
                  </TableCell>
                </Hint>
                <TableCell className="px-4 py-2.5">
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
                    <span className="text-gray-300 dark:text-slate-600">—</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-2.5">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.idEstadoRegistro === 1
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                        : "bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-500"
                    }`}
                  >
                    {c.idEstadoRegistro === 1 ? "Activo" : "Inactivo"}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <Hint label="Editar">
                      <button
                        type="button"
                        onClick={() => setModal({ mode: "edit", initial: c })}
                        aria-label="Editar"
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors dark:text-slate-400 dark:hover:bg-slate-700"
                      >
                        <Pencil size={15} />
                      </button>
                    </Hint>
                    {c.idEstadoRegistro === 1 ? (
                      <Hint label="Eliminar">
                        <button
                          type="button"
                          onClick={() => setToDelete(c)}
                          aria-label="Eliminar"
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors dark:hover:bg-red-500/10"
                        >
                          <Trash2 size={15} />
                        </button>
                      </Hint>
                    ) : (
                      <Hint label="Reactivar">
                        <button
                          type="button"
                          onClick={() => reactivate(c)}
                          aria-label="Reactivar"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors dark:hover:bg-emerald-500/10"
                        >
                          <RotateCcw size={15} />
                        </button>
                      </Hint>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!loadingList && clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-10 text-center text-gray-400 dark:text-slate-500">
                  No se encontraron clientes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
        <Dialog open onOpenChange={(open) => { if (!open) setToDelete(null); }}>
          <DialogContent
            overlayClassName="bg-black/40"
            aria-describedby="client-delete-desc"
            className="flex w-[calc(100%-2rem)] max-w-sm flex-col items-center gap-3 rounded-xl border border-gray-200 p-6 text-center shadow-2xl dark:border-slate-700"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 dark:bg-red-500/10">
              <Trash2 size={22} />
            </div>
            <DialogTitle asChild>
              <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100">Eliminar cliente</h3>
            </DialogTitle>
            <DialogDescription id="client-delete-desc" className="text-gray-500 dark:text-slate-400">
              ¿Dar de baja a <span className="font-medium">{toDelete.razonSocial}</span>? Se
              marcará como inactivo.
            </DialogDescription>
            <div className="flex gap-2 w-full mt-2">
              <button
                type="button"
                onClick={() => setToDelete(null)}
                className="flex-1 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleting}
                className="mx-1 flex-1"
              >
                Eliminar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClientsManager;
