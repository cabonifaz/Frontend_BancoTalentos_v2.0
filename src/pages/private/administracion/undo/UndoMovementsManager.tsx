import { ReactNode, useCallback, useEffect, useState } from "react";
import { RefreshCw, Search, Undo2, User } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { Loading } from "@/core/components/ui/Loading";
import { Pagination } from "@/core/components";
import { getEmployeeDetailFMI, listEmployeesFMI } from "@/core/services/administration.service";
import { useUndoMovement } from "@/core/hooks/administracion/useUndoMovement";
import {
  EmployeeListItem,
  EmployeeUndoDetailResponse,
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

// Debe coincidir con el tamaño de página del SP (PARAMETROS maestro 11).
const ITEMS_PER_PAGE = 5;

// ID_TIPO_HISTORIAL: 1 = ingreso, 2 = movimiento.
const TIPO_INGRESO = 1;

type PendingUndo = {
  kind: "ingreso" | "movimiento" | "cese" | "equipo";
  id: number;
  title: string;
  message: ReactNode;
};

const cell = (v: unknown) =>
  v === null || v === undefined || v === "" ? (
    <span className="text-gray-300 dark:text-slate-600">—</span>
  ) : (
    String(v)
  );

export const UndoMovementsManager = () => {
  const [filtro, setFiltro] = useState("");
  const [appliedFiltro, setAppliedFiltro] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingList, setLoadingList] = useState(false);

  const [selected, setSelected] = useState<EmployeeListItem | null>(null);
  const [detail, setDetail] = useState<EmployeeUndoDetailResponse | undefined>();
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [pending, setPending] = useState<PendingUndo | null>(null);

  const {
    isLoading: undoing,
    undoIngreso,
    undoMovimiento,
    undoCese,
    deleteEquipmentRequest,
  } = useUndoMovement();

  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const { data } = await listEmployeesFMI(currentPage, appliedFiltro || undefined);
      if (data.idTipoMensaje === 2) {
        setEmployees(data.talentos ?? []);
        setTotal(data.totalElementos ?? 0);
      } else {
        setEmployees([]);
        setTotal(0);
        enqueueSnackbar(data.mensaje || "No se pudo cargar el listado", {
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Error listando empleados:", error);
      setEmployees([]);
      setTotal(0);
      enqueueSnackbar("Ha ocurrido un error al cargar los empleados", {
        variant: "error",
      });
    } finally {
      setLoadingList(false);
    }
  }, [currentPage, appliedFiltro]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const loadDetail = useCallback(async (talentId: number) => {
    setLoadingDetail(true);
    try {
      const { data } = await getEmployeeDetailFMI(talentId);
      if (data.idTipoMensaje === 2) {
        setDetail(data);
      } else {
        setDetail(undefined);
        enqueueSnackbar(data.mensaje || "No se pudo cargar el historial", {
          variant: "warning",
        });
      }
    } catch (error) {
      console.error("Error cargando historial:", error);
      setDetail(undefined);
      enqueueSnackbar("Ha ocurrido un error al cargar el historial", {
        variant: "error",
      });
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const selectEmployee = (emp: EmployeeListItem) => {
    setSelected(emp);
    loadDetail(emp.idTalento);
  };

  const canSearch = filtro.trim() !== "";
  const search = () => {
    setCurrentPage(1);
    setAppliedFiltro(filtro.trim());
  };

  // Solo el ÚLTIMO registro (mayor id) de cada tipo puede deshacerse.
  const lastMovementId = (detail?.movements ?? []).reduce(
    (max, m) => Math.max(max, m.movementId ?? 0),
    0
  );
  const lastRequestId = (detail?.equipmentRequests ?? []).reduce(
    (max, e) => Math.max(max, e.requestId ?? 0),
    0
  );
  const lastTerminationId = (detail?.terminations ?? []).reduce(
    (max, t) => Math.max(max, t.terminationId ?? 0),
    0
  );

  const confirmUndo = async () => {
    if (!pending || !selected) return;
    const talentId = selected.idTalento;
    let ok = false;
    if (pending.kind === "ingreso") ok = await undoIngreso(pending.id, talentId);
    else if (pending.kind === "movimiento")
      ok = await undoMovimiento(pending.id, talentId);
    else if (pending.kind === "cese") ok = await undoCese(pending.id, talentId);
    else if (pending.kind === "equipo")
      ok = await deleteEquipmentRequest(pending.id, talentId);
    setPending(null);
    if (ok) {
      await loadDetail(talentId);
    }
  };

  const fullName = (e: EmployeeListItem) => {
    // Primer apellido: usar apellidoPaterno y, si no llega, el primer bloque de
    // apellidos (según cómo el listado devuelva el nombre).
    const primerApellido =
      e.apellidoPaterno?.trim() ||
      e.apellidos?.trim().split(/\s+/)[0] ||
      "";
    return `${e.nombres ?? ""} ${primerApellido}`.replace(/\s+/g, " ").trim();
  };

  const busy = loadingList || loadingDetail || undoing;

  return (
    <div className="relative h-full flex flex-col p-6">
      {busy && <Loading opacity="opacity-60" />}

      <header className="mb-5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Deshacer movimientos</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Revierte el último ingreso, movimiento, cese o solicitud de equipo de un
          empleado. Solo se puede deshacer el registro más reciente de cada tipo.
        </p>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr] gap-4">
        {/* ── Lista de empleados ───────────────────────────────── */}
        <div className="flex flex-col min-h-0 border border-gray-100 rounded-lg dark:border-slate-700">
          <div className="p-3 border-b border-gray-100 flex items-center gap-2 dark:border-slate-700">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
              />
              <Input
                className="!pl-9"
                aria-label="Buscar empleado"
                placeholder="Buscar empleado…"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
              />
            </div>
            <Button onClick={search} className="mx-1">
              Buscar
            </Button>
            <Hint label="Recargar">
              <button
                type="button"
                onClick={loadList}
                aria-label="Recargar"
                className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <RefreshCw size={15} />
              </button>
            </Hint>
          </div>

          <div className="flex-1 min-h-0 overflow-auto">
            {employees.map((emp) => {
              const active = selected?.idTalento === emp.idTalento;
              return (
                <button
                  key={emp.idTalento}
                  type="button"
                  onClick={() => selectEmployee(emp)}
                  aria-pressed={active}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 flex items-center gap-3 transition-colors dark:border-slate-700 ${
                    active ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" : "hover:bg-gray-50 text-gray-700 dark:hover:bg-slate-700 dark:text-slate-200"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      active ? "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400" : "bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-500"
                    }`}
                  >
                    <User size={16} />
                  </span>
                  <span className="text-sm font-medium truncate">
                    {fullName(emp) || `Talento #${emp.idTalento}`}
                  </span>
                </button>
              );
            })}
            {!loadingList && employees.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-gray-400 dark:text-slate-500">
                No se encontraron empleados.
              </div>
            )}
          </div>

          {!appliedFiltro && total > ITEMS_PER_PAGE && (
            <div className="p-2 border-t border-gray-100 dark:border-slate-700">
              <Pagination
                totalItems={total}
                itemsPerPage={ITEMS_PER_PAGE}
                currentPage={currentPage}
                onPaginate={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* ── Historial del empleado ───────────────────────────── */}
        <div className="flex flex-col min-h-0 border border-gray-100 rounded-lg overflow-auto dark:border-slate-700">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400 p-6 dark:text-slate-500">
              Selecciona un empleado para ver su historial.
            </div>
          ) : (
            <div className="p-4 flex flex-col gap-6">
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100">
                  {detail?.names
                    ? `${detail.names} ${detail.lastname ?? ""} ${detail.surname ?? ""}`.trim()
                    : fullName(selected)}
                </h3>
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  DNI: {detail?.documentNumber || "—"}
                </p>
              </div>

              {/* Movimientos (ingreso / movimiento) */}
              <Section title="Movimientos">
                <Table className="w-full min-w-[600px] text-sm">
                  <TableHeader className="bg-gray-50 text-gray-500 dark:bg-slate-800 dark:text-slate-400">
                    <TableRow className="text-left">
                      <TableHead className="px-3 py-2 font-medium">Fecha</TableHead>
                      <TableHead className="px-3 py-2 font-medium">Tipo</TableHead>
                      <TableHead className="px-3 py-2 font-medium">Motivo</TableHead>
                      <TableHead className="px-3 py-2 font-medium">Cargo</TableHead>
                      <TableHead className="px-3 py-2 font-medium text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(detail?.movements ?? []).map((m, i) => {
                      const isIngreso = m.movementTypeId === TIPO_INGRESO;
                      const isLast =
                        (m.movementId ?? 0) === lastMovementId && lastMovementId > 0;
                      return (
                        <TableRow key={i} className="border-t border-gray-100 dark:border-slate-700">
                          <TableCell className="px-3 py-2">{cell(m.movementDate)}</TableCell>
                          <TableCell className="px-3 py-2">{cell(m.movementType)}</TableCell>
                          <TableCell className="px-3 py-2">{cell(m.reason)}</TableCell>
                          <TableCell className="px-3 py-2">{cell(m.position)}</TableCell>
                          <TableCell className="px-3 py-2 text-right">
                            {isLast && (
                              <UndoButton
                                onClick={() =>
                                  setPending({
                                    kind: isIngreso ? "ingreso" : "movimiento",
                                    id: m.movementId,
                                    title: isIngreso
                                      ? "Deshacer ingreso"
                                      : "Deshacer movimiento",
                                    message: isIngreso ? (
                                      <>
                                        ¿Deshacer el último ingreso? Se dará de{" "}
                                        <b>baja el contrato</b> y el talento volverá a{" "}
                                        <b>"confirmado sin ingresar"</b> (se reabre su cupo
                                        en el requerimiento).
                                      </>
                                    ) : (
                                      <>¿Deshacer el último movimiento? Se quitará del historial.</>
                                    ),
                                  })
                                }
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {(detail?.movements ?? []).length === 0 && (
                      <EmptyRow cols={5} />
                    )}
                  </TableBody>
                </Table>
              </Section>

              {/* Solicitudes de equipo */}
              <Section title="Solicitudes de equipo">
                <Table className="w-full min-w-[600px] text-sm">
                  <TableHeader className="bg-gray-50 text-gray-500 dark:bg-slate-800 dark:text-slate-400">
                    <TableRow className="text-left">
                      <TableHead className="px-3 py-2 font-medium">Equipo</TableHead>
                      <TableHead className="px-3 py-2 font-medium">Marca</TableHead>
                      <TableHead className="px-3 py-2 font-medium">F. Solicitud</TableHead>
                      <TableHead className="px-3 py-2 font-medium">F. Entrega</TableHead>
                      <TableHead className="px-3 py-2 font-medium text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(detail?.equipmentRequests ?? []).map((e, i) => {
                      const isLast =
                        (e.requestId ?? 0) === lastRequestId && lastRequestId > 0;
                      return (
                        <TableRow key={i} className="border-t border-gray-100 dark:border-slate-700">
                          <TableCell className="px-3 py-2">{cell(e.equipmentType)}</TableCell>
                          <TableCell className="px-3 py-2">{cell(e.brand)}</TableCell>
                          <TableCell className="px-3 py-2">{cell(e.requestDate)}</TableCell>
                          <TableCell className="px-3 py-2">{cell(e.deliveryDate)}</TableCell>
                          <TableCell className="px-3 py-2 text-right">
                            {isLast && (
                              <UndoButton
                                onClick={() =>
                                  setPending({
                                    kind: "equipo",
                                    id: e.requestId,
                                    title: "Deshacer solicitud de equipo",
                                    message: (
                                      <>
                                        ¿Deshacer la última solicitud de equipo? Se eliminará
                                        el registro.
                                      </>
                                    ),
                                  })
                                }
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {(detail?.equipmentRequests ?? []).length === 0 && (
                      <EmptyRow cols={5} />
                    )}
                  </TableBody>
                </Table>
              </Section>

              {/* Ceses */}
              <Section title="Ceses">
                <Table className="w-full min-w-[600px] text-sm">
                  <TableHeader className="bg-gray-50 text-gray-500 dark:bg-slate-800 dark:text-slate-400">
                    <TableRow className="text-left">
                      <TableHead className="px-3 py-2 font-medium">Fecha</TableHead>
                      <TableHead className="px-3 py-2 font-medium">Motivo</TableHead>
                      <TableHead className="px-3 py-2 font-medium">Cliente</TableHead>
                      <TableHead className="px-3 py-2 font-medium">Código RQ</TableHead>
                      <TableHead className="px-3 py-2 font-medium text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(detail?.terminations ?? []).map((t, i) => {
                      const isLast =
                        (t.terminationId ?? 0) === lastTerminationId &&
                        lastTerminationId > 0;
                      return (
                        <TableRow key={i} className="border-t border-gray-100 dark:border-slate-700">
                          <TableCell className="px-3 py-2">{cell(t.terminationDate)}</TableCell>
                          <TableCell className="px-3 py-2">{cell(t.terminationReason)}</TableCell>
                          <TableCell className="px-3 py-2">{cell(t.client)}</TableCell>
                          <TableCell className="px-3 py-2">{cell(t.requirementCode)}</TableCell>
                          <TableCell className="px-3 py-2 text-right">
                            {isLast && (
                              <UndoButton
                                onClick={() =>
                                  setPending({
                                    kind: "cese",
                                    id: t.terminationId ?? 0,
                                    title: "Deshacer cese",
                                    message: (
                                      <>
                                        ¿Deshacer el último cese? Se{" "}
                                        <b>reactivará el contrato</b> del talento. El correo
                                        de cese ya enviado no se revierte.
                                      </>
                                    ),
                                  })
                                }
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {(detail?.terminations ?? []).length === 0 && (
                      <EmptyRow cols={5} />
                    )}
                  </TableBody>
                </Table>
              </Section>
            </div>
          )}
        </div>
      </div>

      {/* Confirmación */}
      {pending && (
        <Dialog open onOpenChange={(open) => { if (!open) setPending(null); }}>
          <DialogContent
            overlayClassName="bg-black/40"
            aria-describedby="undo-confirm-desc"
            className="block w-[calc(100%-2rem)] max-w-md rounded-xl border border-gray-200 p-6 shadow-2xl dark:border-slate-700"
          >
            <DialogTitle asChild>
              <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-slate-100">
                {pending.title}
              </h3>
            </DialogTitle>
            <DialogDescription id="undo-confirm-desc" className="mb-6 text-gray-600 dark:text-slate-300">
              {pending.message}
            </DialogDescription>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPending(null)}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <Button
                variant="destructive"
                onClick={confirmUndo}
                disabled={undoing}
                className="mx-1"
              >
                Deshacer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div>
    <h4 className="text-sm font-semibold text-gray-600 mb-2 dark:text-slate-300">{title}</h4>
    <div className="border border-gray-100 rounded-lg overflow-x-auto dark:border-slate-700">
      {children}
    </div>
  </div>
);

const EmptyRow = ({ cols }: { cols: number }) => (
  <TableRow>
    <TableCell colSpan={cols} className="px-3 py-6 text-center text-gray-400 dark:text-slate-500">
      Sin registros.
    </TableCell>
  </TableRow>
);

// Sin tooltip: el `title` anterior repetía el texto visible del botón.
const UndoButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm dark:text-red-400 dark:hover:text-red-300"
  >
    <Undo2 size={16} /> Deshacer
  </button>
);

export default UndoMovementsManager;
