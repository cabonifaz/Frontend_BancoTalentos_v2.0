import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, RefreshCw, RotateCcw, Search, UserX } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { useApi } from "../../../../core/hooks/useApi";
import { Loading } from "../../../../core/components/ui/Loading";
import { Pagination } from "../../../../core/components";
import {
  deleteUserAdmin,
  getUsersAdmin,
  reactivateUserAdmin,
} from "../../../../core/services/apiService";
import {
  handleError,
  handleResponse,
} from "../../../../core/utilities/errorHandler";
import { Utils } from "../../../../core/utilities/utils";
import {
  BaseResponse,
  UserAdmin,
  UserAdminListParams,
  UserAdminListResponse,
} from "../../../../core/models";
import { UserFormModal } from "./UserFormModal";

const cell = (v: unknown) =>
  v === null || v === undefined || v === "" ? (
    <span className="text-gray-300">—</span>
  ) : (
    String(v)
  );

type EstadoFilter = "" | "1" | "0";

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
          <h2 className="text-lg font-semibold text-gray-800">Usuarios</h2>
          <p className="text-sm text-gray-500">
            Administra los usuarios: datos, rol, estado y firma.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ initial: null })}
          className="btn btn-primary flex items-center gap-2 flex-shrink-0"
        >
          <Plus size={16} /> Nuevo usuario
        </button>
      </header>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input w-full !pl-10"
            placeholder="Buscar por usuario, nombre o email…"
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
              <th className="px-4 py-2.5 font-medium">Nombre</th>
              <th className="px-4 py-2.5 font-medium">Usuario</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Cargo</th>
              <th className="px-4 py-2.5 font-medium">Rol</th>
              <th className="px-4 py-2.5 font-medium">Estado</th>
              <th className="px-4 py-2.5 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.idUsuario}
                className={`border-t border-gray-100 hover:bg-gray-50 ${
                  u.idEstadoRegistro !== 1 ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <td className="px-4 py-2.5 font-medium">
                  {`${u.nombres ?? ""} ${u.apellidos ?? ""}`.trim() || cell(null)}
                </td>
                <td className="px-4 py-2.5">@{u.usuario}</td>
                <td className="px-4 py-2.5">{cell(u.email)}</td>
                <td className="px-4 py-2.5">{cell(u.cargo)}</td>
                <td className="px-4 py-2.5">{cell(u.rol)}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.idEstadoRegistro === 1
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {u.idEstadoRegistro === 1 ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setModal({ initial: u })}
                      disabled={u.idUsuario === currentUserId}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      title={
                        u.idUsuario === currentUserId
                          ? "No puedes editarte a ti mismo"
                          : "Editar"
                      }
                    >
                      <Pencil size={15} />
                    </button>
                    {u.idEstadoRegistro === 1 ? (
                      <button
                        type="button"
                        onClick={() => setToDeactivate(u)}
                        disabled={u.idUsuario === currentUserId}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        title={
                          u.idUsuario === currentUserId
                            ? "No puedes desactivarte a ti mismo"
                            : "Desactivar"
                        }
                      >
                        <UserX size={15} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => reactivate(u)}
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
            {!loadingList && users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  No se encontraron usuarios.
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
        <UserFormModal
          initial={modal.initial}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      {toDeactivate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setToDeactivate(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm p-6 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <UserX size={22} />
            </div>
            <h3 className="text-base font-semibold text-gray-800">Desactivar usuario</h3>
            <p className="text-sm text-gray-500">
              ¿Desactivar a{" "}
              <span className="font-medium">
                {`${toDeactivate.nombres} ${toDeactivate.apellidos}`.trim()}
              </span>
              ? No podrá iniciar sesión hasta reactivarlo.
            </p>
            <div className="flex gap-2 w-full mt-2">
              <button
                type="button"
                onClick={() => setToDeactivate(null)}
                className="flex-1 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeactivate}
                disabled={deactivating}
                className="btn btn-primary flex-1 !bg-red-500 hover:!bg-red-600"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;
