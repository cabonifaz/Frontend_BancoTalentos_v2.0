import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { useApi } from "@/core/hooks/useApi";
import { Loading } from "@/core/components/ui/Loading";
import { Pagination } from "@/core/components";
import { deleteTariff, getTariffs } from "@/core/services/administration.service";
import { getClients } from "@/core/services/clients.service";
import {
  handleError,
  handleResponse,
} from "@/core/utilities/errorHandler";
import {
  BaseResponse,
  Client,
  Tariff,
  TariffListParams,
  TariffListResponse,
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
import { TariffFormModal } from "./TariffFormModal";

// Debe coincidir con el tamaño de página configurado en BD (PARAMETROS maestro 11).
const ITEMS_PER_PAGE = 5;

interface ClientOption {
  value: number;
  label: string;
}

const cell = (v: unknown) =>
  v === null || v === undefined || v === "" ? (
    <span className="text-gray-300 dark:text-slate-600">—</span>
  ) : (
    String(v)
  );

const money = (v: number | null) =>
  v === null || v === undefined
    ? "—"
    : v.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const TariffsManager = () => {
  const [filtro, setFiltro] = useState("");
  const [appliedFiltro, setAppliedFiltro] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [total, setTotal] = useState(0);

  // Clientes: se cargan UNA vez al abrir la sección y se reutilizan en el modal.
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);

  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    initial: Tariff | null;
  } | null>(null);
  const [toDelete, setToDelete] = useState<Tariff | null>(null);

  const { loading: loadingList, fetch: fetchList } = useApi<
    TariffListResponse,
    TariffListParams
  >(getTariffs, {
    onError: (e) => handleError(e, enqueueSnackbar),
    onSuccess: (r) => {
      setTariffs(r.data.registros ?? []);
      setTotal(r.data.total ?? 0);
    },
  });

  const { loading: deleting, fetch: doDelete } = useApi<BaseResponse, number>(
    deleteTariff,
    { onError: (e) => handleError(e, enqueueSnackbar) },
  );

  const load = useCallback(
    () => fetchList({ filtro: appliedFiltro.trim() || undefined, pagina: currentPage }),
    [fetchList, appliedFiltro, currentPage],
  );

  useEffect(() => {
    load();
  }, [load]);

  // Carga de clientes una sola vez al montar la sección.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getClients();
        setClientOptions(
          (data.clientes ?? [])
            .map((c: Client) => ({ value: c.idCliente, label: c.razonSocial }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        );
      } catch (e) {
        handleError(e as Error, enqueueSnackbar);
      }
    })();
  }, []);

  const canSearch = filtro.trim() !== "";
  const search = () => {
    setCurrentPage(1);
    setAppliedFiltro(filtro);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const response = await doDelete(toDelete.idTarifario);
    handleResponse({ response, showSuccessMessage: true, enqueueSnackbar });
    setToDelete(null);
    if ((response.data.result?.idMensaje ?? response.data.idMensaje) === 2) {
      // Si la página queda vacía, retrocede una.
      if (tariffs.length === 1 && currentPage > 1) setCurrentPage((p) => p - 1);
      else load();
    }
  };

  const loading = loadingList || deleting;

  return (
    <div className="relative h-full flex flex-col p-6">
      {loading && <Loading opacity="opacity-60" />}

      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Tarifario</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Una tarifa por cliente y perfil.
          </p>
        </div>
        <Button
          onClick={() => setModal({ mode: "create", initial: null })}
          className="mx-1 flex-shrink-0"
        >
          <Plus size={16} /> Nueva tarifa
        </Button>
      </header>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <Input
            className="!pl-10"
            aria-label="Buscar tarifas"
            placeholder="Buscar por cliente o perfil…"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSearch && search()}
          />
        </div>
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
              <TableHead className="px-4 py-2.5 font-medium">Cliente</TableHead>
              <TableHead className="px-4 py-2.5 font-medium">Perfil</TableHead>
              <TableHead className="px-4 py-2.5 font-medium text-right">Tarifa</TableHead>
              <TableHead className="px-4 py-2.5 font-medium">Moneda</TableHead>
              <TableHead className="px-4 py-2.5 font-medium">Tipo de tarifa</TableHead>
              <TableHead className="px-4 py-2.5 font-medium text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tariffs.map((t) => (
              <TableRow key={t.idTarifario} className="border-t border-gray-100 hover:bg-gray-50 text-gray-600 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-300">
                <TableCell className="px-4 py-2.5 font-medium">{cell(t.razonSocial)}</TableCell>
                <TableCell className="px-4 py-2.5">{cell(t.perfil)}</TableCell>
                <TableCell className="px-4 py-2.5 text-right">{money(t.tarifa)}</TableCell>
                <TableCell className="px-4 py-2.5">{cell(t.moneda)}</TableCell>
                <TableCell className="px-4 py-2.5">{cell(t.tipoTarifa)}</TableCell>
                <TableCell className="px-4 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <Hint label="Editar">
                      <button
                        type="button"
                        onClick={() => setModal({ mode: "edit", initial: t })}
                        aria-label="Editar"
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors dark:text-slate-400 dark:hover:bg-slate-700"
                      >
                        <Pencil size={15} />
                      </button>
                    </Hint>
                    <Hint label="Eliminar">
                      <button
                        type="button"
                        onClick={() => setToDelete(t)}
                        aria-label="Eliminar"
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors dark:hover:bg-red-500/10"
                      >
                        <Trash2 size={15} />
                      </button>
                    </Hint>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!loadingList && tariffs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-10 text-center text-gray-400 dark:text-slate-500">
                  No se encontraron tarifas.
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
        <TariffFormModal
          mode={modal.mode}
          initial={modal.initial}
          clients={clientOptions}
          existing={tariffs}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      {toDelete && (
        <Dialog open onOpenChange={(open) => { if (!open) setToDelete(null); }}>
          <DialogContent
            overlayClassName="bg-black/40"
            aria-describedby="tariff-delete-desc"
            className="flex w-[calc(100%-2rem)] max-w-sm flex-col items-center gap-3 rounded-xl border border-gray-200 p-6 text-center shadow-2xl dark:border-slate-700"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 dark:bg-red-500/10">
              <Trash2 size={22} />
            </div>
            <DialogTitle asChild>
              <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100">Eliminar tarifa</h3>
            </DialogTitle>
            <DialogDescription id="tariff-delete-desc" className="text-gray-500 dark:text-slate-400">
              ¿Eliminar la tarifa de{" "}
              <span className="font-medium">{toDelete.razonSocial}</span> ·{" "}
              <span className="font-medium">{toDelete.perfil}</span>? No se puede reactivar.
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

export default TariffsManager;
