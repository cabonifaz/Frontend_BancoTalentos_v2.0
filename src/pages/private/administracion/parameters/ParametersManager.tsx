import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { useApi } from "../../../../core/hooks/useApi";
import { Loading } from "../../../../core/components/ui/Loading";
import { Pagination } from "../../../../core/components";
import { deleteParam, getParamMasters, getParamsByMaster } from "../../../../core/services/administration.service";
import {
  handleError,
  handleResponse,
} from "../../../../core/utilities/errorHandler";
import {
  BaseResponse,
  ParamItem,
  ParamItemListParams,
  ParamItemListResponse,
  ParamMaster,
  ParamMasterListParams,
  ParamMasterListResponse,
} from "../../../../core/models";
import { ParamFormModal } from "./ParamFormModal";

type View = "masters" | "detail";

// Debe coincidir con el tamaño de página configurado en BD (PARAMETROS maestro 11).
const ITEMS_PER_PAGE = 5;

const cell = (v: unknown) =>
  v === null || v === undefined || v === "" ? (
    <span className="text-gray-300 dark:text-slate-600">—</span>
  ) : (
    String(v)
  );

export const ParametersManager = () => {
  const [view, setView] = useState<View>("masters");
  const [filtro, setFiltro] = useState("");
  const [selected, setSelected] = useState<ParamMaster | null>(null);

  const [masters, setMasters] = useState<ParamMaster[]>([]);
  const [items, setItems] = useState<ParamItem[]>([]);

  // Paginación del detalle (parámetros del maestro seleccionado).
  const [detailPage, setDetailPage] = useState(1);
  const [detailTotal, setDetailTotal] = useState(0);

  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    initial: ParamItem | null;
  } | null>(null);
  const [toDelete, setToDelete] = useState<ParamItem | null>(null);

  const { loading: loadingMasters, fetch: fetchMasters } = useApi<
    ParamMasterListResponse,
    ParamMasterListParams
  >(getParamMasters, {
    onError: (e) => handleError(e, enqueueSnackbar),
    onSuccess: (r) => setMasters(r.data.registros ?? []),
  });

  const { loading: loadingItems, fetch: fetchItems } = useApi<
    ParamItemListResponse,
    ParamItemListParams
  >(getParamsByMaster, {
    onError: (e) => handleError(e, enqueueSnackbar),
    onSuccess: (r) => {
      setItems(r.data.registros ?? []);
      setDetailTotal(r.data.total ?? 0);
    },
  });

  const { loading: deleting, fetch: doDelete } = useApi<BaseResponse, number>(
    deleteParam,
    { onError: (e) => handleError(e, enqueueSnackbar) },
  );

  useEffect(() => {
    fetchMasters({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSearch = filtro.trim() !== "";
  const searchMasters = () => fetchMasters({ filtro: filtro.trim() || undefined });

  // Carga la página actual del detalle. Se dispara al abrir un maestro y al paginar.
  const loadItems = useCallback(() => {
    if (selected) fetchItems({ idMaestro: selected.idMaestro, pagina: detailPage });
  }, [fetchItems, selected, detailPage]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const openMaster = (master: ParamMaster) => {
    setSelected(master);
    setDetailPage(1);
    setView("detail");
    // La carga la dispara el efecto de loadItems al cambiar el maestro/página.
  };

  const backToMasters = () => {
    setView("masters");
    setSelected(null);
    setItems([]);
    setDetailPage(1);
    setDetailTotal(0);
    fetchMasters({ filtro: filtro.trim() || undefined });
  };

  /** Tras guardar, refresca la vista activa: detalle o lista de maestros. */
  const handleSaved = () => {
    if (view === "detail" && selected) loadItems();
    else fetchMasters({ filtro: filtro.trim() || undefined });
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const response = await doDelete(toDelete.idParametro);
    handleResponse({ response, showSuccessMessage: true, enqueueSnackbar });
    setToDelete(null);
    if ((response.data.result?.idMensaje ?? response.data.idMensaje) === 2) {
      // Si la página queda vacía tras la baja, retrocede una.
      if (items.length === 1 && detailPage > 1) setDetailPage((p) => p - 1);
      else loadItems();
    }
  };

  const loading = loadingMasters || loadingItems || deleting;

  return (
    <div className="relative h-full flex flex-col p-6">
      {loading && <Loading opacity="opacity-60" />}

      {view === "masters" ? (
        <>
          <header className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Parámetros</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Selecciona un maestro para ver y editar sus parámetros.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModal({ mode: "create", initial: null })}
              className="btn btn-primary flex items-center gap-2 flex-shrink-0"
              title="Crear un parámetro (usa un ID de maestro nuevo para crear un maestro)"
            >
              <Plus size={16} /> Nuevo parámetro
            </button>
          </header>

          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
              />
              <input
                className="input w-full !pl-10"
                placeholder="Buscar por ID o descripción…"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canSearch && searchMasters()}
              />
            </div>
            <button
              type="button"
              onClick={searchMasters}
              disabled={!canSearch}
              className={`btn ${canSearch ? "btn-primary" : "btn-disabled"}`}
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={searchMasters}
              title="Recargar"
              className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-auto border border-gray-100 rounded-lg dark:border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 sticky top-0 dark:bg-slate-800 dark:text-slate-400">
                <tr className="text-left">
                  <th className="px-4 py-2.5 font-medium">Maestro</th>
                  <th className="px-4 py-2.5 font-medium">Descripción</th>
                  <th className="px-4 py-2.5 font-medium text-right">Total</th>
                  <th className="px-4 py-2.5 font-medium text-right">Activos</th>
                  <th className="px-4 py-2.5 font-medium text-right">Inactivos</th>
                </tr>
              </thead>
              <tbody>
                {masters.map((m) => (
                  <tr
                    key={m.idMaestro}
                    onClick={() => openMaster(m)}
                    className="border-t border-gray-100 hover:bg-[#009688]/5 cursor-pointer transition-colors dark:border-slate-700"
                  >
                    <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-slate-200">{m.idMaestro}</td>
                    <td className="px-4 py-2.5 text-gray-600 dark:text-slate-300">{cell(m.descripcion)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-600 dark:text-slate-300">{m.totalRegistros}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-600">{m.registrosActivos}</td>
                    <td className="px-4 py-2.5 text-right text-gray-400 dark:text-slate-500">{m.registrosInactivos}</td>
                  </tr>
                ))}
                {!loadingMasters && masters.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400 dark:text-slate-500">
                      No se encontraron maestros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <header className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={backToMasters}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                title="Volver a maestros"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-800 truncate dark:text-slate-100">
                  Maestro {selected?.idMaestro}
                  {selected?.descripcion ? ` · ${selected.descripcion}` : ""}
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {selected?.totalRegistros ?? items.length} parámetros ·{" "}
                  {selected?.registrosActivos ?? 0} activos
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setModal({ mode: "create", initial: null })}
              className="btn btn-primary flex items-center gap-2 flex-shrink-0"
            >
              <Plus size={16} /> Nuevo parámetro
            </button>
          </header>

          <div className="flex-1 min-h-0 overflow-auto border border-gray-100 rounded-lg dark:border-slate-700">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 sticky top-0 dark:bg-slate-800 dark:text-slate-400">
                <tr className="text-left">
                  <th className="px-3 py-2.5 font-medium">ID</th>
                  <th className="px-3 py-2.5 font-medium">Descripción</th>
                  <th className="px-3 py-2.5 font-medium">Sub</th>
                  <th className="px-3 py-2.5 font-medium">NUM1</th>
                  <th className="px-3 py-2.5 font-medium">NUM2</th>
                  <th className="px-3 py-2.5 font-medium">NUM3</th>
                  <th className="px-3 py-2.5 font-medium">STRING1</th>
                  <th className="px-3 py-2.5 font-medium">STRING2</th>
                  <th className="px-3 py-2.5 font-medium">STRING3</th>
                  <th className="px-3 py-2.5 font-medium">DATE1</th>
                  <th className="px-3 py-2.5 font-medium">DATE2</th>
                  <th className="px-3 py-2.5 font-medium">DATE3</th>
                  <th className="px-3 py-2.5 font-medium">Estado</th>
                  <th className="px-3 py-2.5 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr
                    key={p.idParametro}
                    className={`border-t border-gray-100 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700 ${
                      p.idEstadoRegistro !== 1 ? "text-gray-400 dark:text-slate-500" : "text-gray-600 dark:text-slate-300"
                    }`}
                  >
                    <td className="px-3 py-2.5 font-medium">{p.idParametro}</td>
                    <td className="px-3 py-2.5">{cell(p.descripcion)}</td>
                    <td className="px-3 py-2.5">{cell(p.idSubMaestro)}</td>
                    <td className="px-3 py-2.5">{cell(p.num1)}</td>
                    <td className="px-3 py-2.5">{cell(p.num2)}</td>
                    <td className="px-3 py-2.5">{cell(p.num3)}</td>
                    <td className="px-3 py-2.5">{cell(p.string1)}</td>
                    <td className="px-3 py-2.5">{cell(p.string2)}</td>
                    <td className="px-3 py-2.5">{cell(p.string3)}</td>
                    <td className="px-3 py-2.5">{cell(p.date1)}</td>
                    <td className="px-3 py-2.5">{cell(p.date2)}</td>
                    <td className="px-3 py-2.5">{cell(p.date3)}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.idEstadoRegistro === 1
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                            : "bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-500"
                        }`}
                      >
                        {p.idEstadoRegistro === 1 ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setModal({ mode: "edit", initial: p })}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors dark:text-slate-400 dark:hover:bg-slate-700"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        {p.idEstadoRegistro === 1 && (
                          <button
                            type="button"
                            onClick={() => setToDelete(p)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors dark:hover:bg-red-500/10"
                            title="Eliminar"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loadingItems && items.length === 0 && (
                  <tr>
                    <td colSpan={14} className="px-4 py-10 text-center text-gray-400 dark:text-slate-500">
                      Este maestro no tiene parámetros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {detailTotal > ITEMS_PER_PAGE && (
            <div className="mt-3">
              <Pagination
                totalItems={detailTotal}
                itemsPerPage={ITEMS_PER_PAGE}
                currentPage={detailPage}
                onPaginate={setDetailPage}
              />
            </div>
          )}
        </>
      )}

      {modal && (
        <ParamFormModal
          mode={modal.mode}
          initial={modal.initial}
          defaultMaestro={view === "detail" ? selected?.idMaestro : undefined}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {toDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setToDelete(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm p-6 text-center flex flex-col items-center gap-3 dark:bg-slate-800 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 dark:bg-red-500/10">
              <Trash2 size={22} />
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100">Eliminar parámetro</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              ¿Dar de baja el parámetro <span className="font-medium">#{toDelete.idParametro}</span>{" "}
              del maestro {toDelete.idMaestro}? Se marcará como inactivo.
            </p>
            <div className="flex gap-2 w-full mt-2">
              <button
                type="button"
                onClick={() => setToDelete(null)}
                className="flex-1 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
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

export default ParametersManager;
