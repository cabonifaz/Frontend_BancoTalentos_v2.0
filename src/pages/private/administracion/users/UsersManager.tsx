import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, RefreshCw, RotateCcw, Search, UserX } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { useApi } from "@/core/hooks/useApi";
import { Loading } from "@/core/components/ui/Loading";
import { Pagination } from "@/core/components";
import { deleteUserAdmin, getUsersAdmin, reactivateUserAdmin } from "@/core/services/administration.service";
import {
  handleError,
  handleResponse,
} from "@/core/utilities/errorHandler";
import { Utils } from "@/core/utilities/utils";
import {
  BaseResponse,
  UserAdmin,
  UserAdminListParams,
  UserAdminListResponse,
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
import { UserFormModal } from "./UserFormModal";

const cell = (v: unknown) =>
  v === null || v === undefined || v === "" ? (
    <span className="text-gray-300 dark:text-slate-600">—</span>
  ) : (
    String(v)
  );

type EstadoFilter = "" | "1" | "0";

const ESTADO_OPTIONS = [
  { value: "1", label: "Activos" },
  { value: "0", label: "Inactivos" },
];

// Debe coincidir con el tamaño de página configurado en BD (PARAMETROS maestro 11).
const ITEMS_PER_PAGE = 5;

export const UsersManager = () => {
  const [filtro, setFiltro] = useState("");
  const [appliedFiltro, setAppliedFiltro] = useState("");
  const [estado, setEstado] = useState<EstadoFilter>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [total, setTotal] = useState(0);

  // initial null = alta; con valor = edición.
  const [modal, setModal] = useState<{ initial: UserAdmin | null } | null>(null);
  const [toDeactivate, setToDeactivate] = useState<UserAdmin | null>(null);

  // Usuario logueado: no puede editarse ni desactivarse a sí mismo.
  const currentUserId = Utils.decodeJwt(localStorage.getItem("token") || "")?.id_usuario;

  const { loading: loadingList, fetch: fetchList } = useApi<
    UserAdminListResponse,
    UserAdminListParams
  >(getUsersAdmin, {
    onError: (e) => handleError(e, enqueueSnackbar),
    onSuccess: (r) => {
      setUsers(r.data.registros ?? []);
      setTotal(r.data.total ?? 0);
    },
  });

  const { loading: deactivating, fetch: doDeactivate } = useApi<BaseResponse, number>(
    deleteUserAdmin,
    { onError: (e) => handleError(e, enqueueSnackbar) },
  );

  const { loading: reactivating, fetch: doReactivate } = useApi<BaseResponse, number>(
    reactivateUserAdmin,
    { onError: (e) => handleError(e, enqueueSnackbar) },
  );

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

  const confirmDeactivate = async () => {
    if (!toDeactivate) return;
    const response = await doDeactivate(toDeactivate.idUsuario);
    handleResponse({ response, showSuccessMessage: true, enqueueSnackbar });
    setToDeactivate(null);
    if ((response.data.result?.idMensaje ?? response.data.idMensaje) === 2) {
      // Al filtrar "Activos", si la página queda vacía tras desactivar, retrocede una.
      if (estado === "1" && users.length === 1 && currentPage > 1)
        setCurrentPage((p) => p - 1);
      else load();
    }
  };

  const reactivate = async (user: UserAdmin) => {
    const response = await doReactivate(user.idUsuario);
    handleResponse({ response, showSuccessMessage: true, enqueueSnackbar });
    if ((response.data.result?.idMensaje ?? response.data.idMensaje) === 2) load();
  };

  const loading = loadingList || deactivating || reactivating;
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
          <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Usuarios</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Administra los usuarios: datos, rol, estado y firma.
          </p>
        </div>
        <Button
          onClick={() => setModal({ initial: null })}
          className="mx-1 flex-shrink-0"
        >
          <Plus size={16} /> Nuevo usuario
        </Button>
      </header>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <Input
            className="!pl-10"
            aria-label="Buscar usuarios"
            placeholder="Buscar por usuario, nombre o email…"
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
              <TableHead className="px-4 py-2.5 font-medium">Nombre</TableHead>
              <TableHead className="px-4 py-2.5 font-medium">Usuario</TableHead>
              <TableHead className="px-4 py-2.5 font-medium">Email</TableHead>
              <TableHead className="px-4 py-2.5 font-medium">Cargo</TableHead>
              <TableHead className="px-4 py-2.5 font-medium">Rol</TableHead>
              <TableHead className="px-4 py-2.5 font-medium">Estado</TableHead>
              <TableHead className="px-4 py-2.5 font-medium text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const isSelf = u.idUsuario === currentUserId;
              return (
                <TableRow
                  key={u.idUsuario}
                  className={`border-t border-gray-100 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700 ${
                    u.idEstadoRegistro !== 1 ? "text-gray-400 dark:text-slate-500" : "text-gray-600 dark:text-slate-300"
                  }`}
                >
                  <TableCell className="px-4 py-2.5 font-medium">
                    {`${u.nombres ?? ""} ${u.apellidos ?? ""}`.trim() || cell(null)}
                  </TableCell>
                  <TableCell className="px-4 py-2.5">@{u.usuario}</TableCell>
                  <TableCell className="px-4 py-2.5">{cell(u.email)}</TableCell>
                  <TableCell className="px-4 py-2.5">{cell(u.cargo)}</TableCell>
                  <TableCell className="px-4 py-2.5">{cell(u.rol)}</TableCell>
                  <TableCell className="px-4 py-2.5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.idEstadoRegistro === 1
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                          : "bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-500"
                      }`}
                    >
                      {u.idEstadoRegistro === 1 ? "Activo" : "Inactivo"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2.5">
                    {/* Los tooltips van sobre un <span>: cuando el botón está
                        deshabilitado (el propio usuario) el tooltip explica por
                        qué, y un botón disabled no recibe esos eventos. */}
                    <div className="flex items-center justify-end gap-1">
                      <Hint label={isSelf ? "No puedes editarte a ti mismo" : "Editar"}>
                        <span className="inline-flex">
                          <button
                            type="button"
                            onClick={() => setModal({ initial: u })}
                            disabled={isSelf}
                            aria-label="Editar"
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-slate-700"
                          >
                            <Pencil size={15} />
                          </button>
                        </span>
                      </Hint>
                      {u.idEstadoRegistro === 1 ? (
                        <Hint label={isSelf ? "No puedes desactivarte a ti mismo" : "Desactivar"}>
                          <span className="inline-flex">
                            <button
                              type="button"
                              onClick={() => setToDeactivate(u)}
                              disabled={isSelf}
                              aria-label="Desactivar"
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:hover:bg-red-500/10"
                            >
                              <UserX size={15} />
                            </button>
                          </span>
                        </Hint>
                      ) : (
                        <Hint label="Reactivar">
                          <button
                            type="button"
                            onClick={() => reactivate(u)}
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
              );
            })}
            {!loadingList && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="px-4 py-10 text-center text-gray-400 dark:text-slate-500">
                  No se encontraron usuarios.
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
        <UserFormModal
          initial={modal.initial}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      {toDeactivate && (
        <Dialog open onOpenChange={(open) => { if (!open) setToDeactivate(null); }}>
          <DialogContent
            overlayClassName="bg-black/40"
            aria-describedby="user-deactivate-desc"
            className="flex w-[calc(100%-2rem)] max-w-sm flex-col items-center gap-3 rounded-xl border border-gray-200 p-6 text-center shadow-2xl dark:border-slate-700"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 dark:bg-red-500/10">
              <UserX size={22} />
            </div>
            <DialogTitle asChild>
              <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100">Desactivar usuario</h3>
            </DialogTitle>
            <DialogDescription id="user-deactivate-desc" className="text-gray-500 dark:text-slate-400">
              ¿Desactivar a{" "}
              <span className="font-medium">
                {`${toDeactivate.nombres} ${toDeactivate.apellidos}`.trim()}
              </span>
              ? No podrá iniciar sesión hasta reactivarlo.
            </DialogDescription>
            <div className="flex gap-2 w-full mt-2">
              <button
                type="button"
                onClick={() => setToDeactivate(null)}
                className="flex-1 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <Button
                variant="destructive"
                onClick={confirmDeactivate}
                disabled={deactivating}
                className="mx-1 flex-1"
              >
                Desactivar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UsersManager;
