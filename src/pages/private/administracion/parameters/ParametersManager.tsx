import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { useApi } from "@/core/hooks/useApi";
import { Loading } from "@/core/components/ui/Loading";
import { Pagination } from "@/core/components";
import { deleteParam, getParamMasters, getParamsByMaster } from "@/core/services/administration.service";
import {
  handleError,
  handleResponse,
} from "@/core/utilities/errorHandler";
import {
  BaseResponse,
  ParamItem,
  ParamItemListParams,
  ParamItemListResponse,
  ParamMaster,
  ParamMasterListParams,
  ParamMasterListResponse,
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
import { Hint } from "@/core/components/ui/Hint";
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
            <Hint label="Crear un parámetro (usa un ID de maestro nuevo para crear un maestro)">
              <Button
                onClick={() => setModal({ mode: "create", initial: null })}
                className="mx-1 flex-shrink-0"
              >
                <Plus size={16} /> Nuevo parámetro
              </Button>
            </Hint>
          </header>

          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
              />
              <Input
                className="!pl-10"
                aria-label="Buscar maestros"
                placeholder="Buscar por ID o descripción…"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canSearch && searchMasters()}
              />
            </div>
            <Button onClick={searchMasters} disabled={!canSearch} className="mx-1">
              Buscar
            </Button>
            <Hint label="Recargar">
              <button
                type="button"
                onClick={searchMasters}
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
                  <TableHead className="px-4 py-2.5 font-medium">Maestro</TableHead>
                  <TableHead className="px-4 py-2.5 font-medium">Descripción</TableHead>
                  <TableHead className="px-4 py-2.5 font-medium text-right">Total</TableHead>
                  <TableHead className="px-4 py-2.5 font-medium text-right">Activos</TableHead>
                  <TableHead className="px-4 py-2.5 font-medium text-right">Inactivos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {masters.map((m) => (
                  <TableRow
                    key={m.idMaestro}
                    onClick={() => openMaster(m)}
                    className="border-t border-gray-100 hover:bg-[#009688]/5 cursor-pointer transition-colors dark:border-slate-700"
                  >
                    <TableCell className="px-4 py-2.5 font-medium text-gray-700 dark:text-slate-200">{m.idMaestro}</TableCell>
                    <TableCell className="px-4 py-2.5 text-gray-600 dark:text-slate-300">{cell(m.descripcion)}</TableCell>
                    <TableCell className="px-4 py-2.5 text-right text-gray-600 dark:text-slate-300">{m.totalRegistros}</TableCell>
                    <TableCell className="px-4 py-2.5 text-right text-emerald-600">{m.registrosActivos}</TableCell>
                    <TableCell className="px-4 py-2.5 text-right text-gray-400 dark:text-slate-500">{m.registrosInactivos}</TableCell>
                  </TableRow>
                ))}
                {!loadingMasters && masters.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="px-4 py-10 text-center text-gray-400 dark:text-slate-500">
                      No se encontraron maestros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <>
          <header className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Hint label="Volver a maestros">
                <button
                  type="button"
                  onClick={backToMasters}
                  aria-label="Volver a maestros"
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <ArrowLeft size={18} />
                </button>
              </Hint>
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
            <Button
              onClick={() => setModal({ mode: "create", initial: null })}
              className="mx-1 flex-shrink-0"
            >
              <Plus size={16} /> Nuevo parámetro
            </Button>
          </header>

          <div className="flex-1 min-h-0 overflow-auto border border-gray-100 rounded-lg dark:border-slate-700">
            <Table className="w-full text-sm whitespace-nowrap">
              <TableHeader className="bg-gray-50 text-gray-500 sticky top-0 dark:bg-slate-800 dark:text-slate-400">
                <TableRow className="text-left">
                  <TableHead className="px-3 py-2.5 font-medium">ID</TableHead>
                  <TableHead className="px-3 py-2.5 font-medium">Descripción</TableHead>
                  <TableHead className="px-3 py-2.5 font-medium">Sub</TableHead>
                  <TableHead className="px-3 py-2.5 font-medium">NUM1</TableHead>
                  <TableHead className="px-3 py-2.5 font-medium">NUM2</TableHead>
                  <TableHead className="px-3 py-2.5 font-medium">NUM3</TableHead>
                  <TableHead className="px-3 py-2.5 font-medium">STRING1</TableHead>
                  <TableHead className="px-3 py-2.5 font-medium">STRING2</TableHead>
                  <TableHead className="px-3 py-2.5 font-medium">STRING3</TableHead>
                  <TableHead className="px-3 py-2.5 font-medium">DATE1</TableHead>
                  <TableHead className="px-3 py-2.5 font-medium">DATE2</TableHead>
                  <TableHead className="px-3 py-2.5 font-medium">DATE3</TableHead>
                  <TableHead className="px-3 py-2.5 font-medium">Estado</TableHead>
                  <TableHead className="px-3 py-2.5 font-medium text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => (
                  <TableRow
                    key={p.idParametro}
                    className={`border-t border-gray-100 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700 ${
                      p.idEstadoRegistro !== 1 ? "text-gray-400 dark:text-slate-500" : "text-gray-600 dark:text-slate-300"
                    }`}
                  >
                    <TableCell className="px-3 py-2.5 font-medium">{p.idParametro}</TableCell>
                    <TableCell className="px-3 py-2.5">{cell(p.descripcion)}</TableCell>
                    <TableCell className="px-3 py-2.5">{cell(p.idSubMaestro)}</TableCell>
                    <TableCell className="px-3 py-2.5">{cell(p.num1)}</TableCell>
                    <TableCell className="px-3 py-2.5">{cell(p.num2)}</TableCell>
                    <TableCell className="px-3 py-2.5">{cell(p.num3)}</TableCell>
                    <TableCell className="px-3 py-2.5">{cell(p.string1)}</TableCell>
                    <TableCell className="px-3 py-2.5">{cell(p.string2)}</TableCell>
                    <TableCell className="px-3 py-2.5">{cell(p.string3)}</TableCell>
                    <TableCell className="px-3 py-2.5">{cell(p.date1)}</TableCell>
                    <TableCell className="px-3 py-2.5">{cell(p.date2)}</TableCell>
                    <TableCell className="px-3 py-2.5">{cell(p.date3)}</TableCell>
                    <TableCell className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.idEstadoRegistro === 1
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                            : "bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-500"
                        }`}
                      >
                        {p.idEstadoRegistro === 1 ? "Activo" : "Inactivo"}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <Hint label="Editar">
                          <button
                            type="button"
                            onClick={() => setModal({ mode: "edit", initial: p })}
                            aria-label="Editar"
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors dark:text-slate-400 dark:hover:bg-slate-700"
                          >
                            <Pencil size={15} />
                          </button>
                        </Hint>
                        {p.idEstadoRegistro === 1 && (
                          <Hint label="Eliminar">
                            <button
                              type="button"
                              onClick={() => setToDelete(p)}
                              aria-label="Eliminar"
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors dark:hover:bg-red-500/10"
                            >
                              <Trash2 size={15} />
                            </button>
                          </Hint>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!loadingItems && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={14} className="px-4 py-10 text-center text-gray-400 dark:text-slate-500">
                      Este maestro no tiene parámetros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
        <Dialog open onOpenChange={(open) => { if (!open) setToDelete(null); }}>
          <DialogContent
            overlayClassName="bg-black/40"
            aria-describedby="param-delete-desc"
            className="flex w-[calc(100%-2rem)] max-w-sm flex-col items-center gap-3 rounded-xl border border-gray-200 p-6 text-center shadow-2xl dark:border-slate-700"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 dark:bg-red-500/10">
              <Trash2 size={22} />
            </div>
            <DialogTitle asChild>
              <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100">Eliminar parámetro</h3>
            </DialogTitle>
            <DialogDescription id="param-delete-desc" className="text-gray-500 dark:text-slate-400">
              ¿Dar de baja el parámetro <span className="font-medium">#{toDelete.idParametro}</span>{" "}
              del maestro {toDelete.idMaestro}? Se marcará como inactivo.
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

export default ParametersManager;
