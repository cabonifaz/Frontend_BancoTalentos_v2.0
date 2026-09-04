import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  Pencil,
  Trash2,
  UserPlus,
  UserCog,
} from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { Loading } from "../../../../core/components/ui/Loading";
import { assignClientGestor, changeClientGestor, getClientGestores, removeClientGestor, swapClientGestores } from "../../../../core/services/administration.service";
import { getClients } from "../../../../core/services/clients.service";
import {
  handleError,
  handleResponse,
} from "../../../../core/utilities/errorHandler";
import { Client, ClientGestor, UserAdmin } from "../../../../core/models";
import { UserSearchSelect } from "./UserSearchSelect";

const PRIORIDADES = [1, 2] as const;

const wasSuccess = (response: { data: { result?: { idMensaje?: number }; idMensaje?: number } }) =>
  (response.data.result?.idMensaje ?? response.data.idMensaje) === 2;

export const ManagersManager = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<number | "">("");
  const [gestores, setGestores] = useState<ClientGestor[]>([]);

  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingGestores, setLoadingGestores] = useState(false);
  const [saving, setSaving] = useState(false);

  // Slot con combo abierto: { prioridad } para asignar, o el gestor a cambiar.
  const [assignPrioridad, setAssignPrioridad] = useState<number | null>(null);
  const [changing, setChanging] = useState<ClientGestor | null>(null);
  const [toRemove, setToRemove] = useState<ClientGestor | null>(null);

  useEffect(() => {
    (async () => {
      setLoadingClients(true);
      try {
        const { data } = await getClients();
        setClients(data.clientes ?? []);
      } catch (e) {
        handleError(e as Error, enqueueSnackbar);
      } finally {
        setLoadingClients(false);
      }
    })();
  }, []);

  const loadGestores = async (id: number) => {
    setLoadingGestores(true);
    try {
      const { data } = await getClientGestores(id);
      setGestores(data.registros ?? []);
    } catch (e) {
      handleError(e as Error, enqueueSnackbar);
    } finally {
      setLoadingGestores(false);
    }
  };

  const onSelectClient = (value: string) => {
    setAssignPrioridad(null);
    setChanging(null);
    if (value === "") {
      setClientId("");
      setGestores([]);
      return;
    }
    const id = Number(value);
    setClientId(id);
    loadGestores(id);
  };

  const slotFor = (prioridad: number) =>
    gestores.find((g) => g.prioridad === prioridad);

  const otherSlotUserId = (prioridad: number) =>
    gestores.find((g) => g.prioridad !== prioridad)?.idUsuario;

  const bothFilled = gestores.length === 2;

  const doAssign = async (prioridad: number, user: UserAdmin) => {
    if (clientId === "") return;
    setSaving(true);
    try {
      const response = await assignClientGestor({
        idCliente: clientId,
        idUsuario: user.idUsuario,
        prioridad,
      });
      handleResponse({ response, showSuccessMessage: true, enqueueSnackbar });
      if (wasSuccess(response)) {
        setAssignPrioridad(null);
        await loadGestores(clientId);
      }
    } catch (e) {
      handleError(e as Error, enqueueSnackbar);
    } finally {
      setSaving(false);
    }
  };

  const doChange = async (gestor: ClientGestor, user: UserAdmin) => {
    if (clientId === "") return;
    setSaving(true);
    try {
      const response = await changeClientGestor({
        idClienteGestor: gestor.idClienteGestor,
        idUsuario: user.idUsuario,
      });
      handleResponse({ response, showSuccessMessage: true, enqueueSnackbar });
      if (wasSuccess(response)) {
        setChanging(null);
        await loadGestores(clientId);
      }
    } catch (e) {
      handleError(e as Error, enqueueSnackbar);
    } finally {
      setSaving(false);
    }
  };

  const confirmRemove = async () => {
    if (!toRemove || clientId === "") return;
    setSaving(true);
    try {
      const response = await removeClientGestor(toRemove.idClienteGestor);
      handleResponse({ response, showSuccessMessage: true, enqueueSnackbar });
      setToRemove(null);
      if (wasSuccess(response)) await loadGestores(clientId);
    } catch (e) {
      handleError(e as Error, enqueueSnackbar);
    } finally {
      setSaving(false);
    }
  };

  const doSwap = async () => {
    if (clientId === "") return;
    setSaving(true);
    try {
      const response = await swapClientGestores(clientId);
      handleResponse({ response, showSuccessMessage: true, enqueueSnackbar });
      if (wasSuccess(response)) await loadGestores(clientId);
    } catch (e) {
      handleError(e as Error, enqueueSnackbar);
    } finally {
      setSaving(false);
    }
  };

  const loading = loadingClients || loadingGestores || saving;

  return (
    <div className="relative h-full flex flex-col p-6">
      {loading && <Loading opacity="opacity-60" />}

      <header className="mb-5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Gestores por cliente</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Cada cliente puede tener hasta dos gestores, uno por prioridad.
        </p>
      </header>

      <div className="mb-6 max-w-md">
        <label className="input-label">Cliente</label>
        <select
          className="input w-full mt-1"
          value={clientId === "" ? "" : String(clientId)}
          onChange={(e) => onSelectClient(e.target.value)}
        >
          <option value="">Seleccione un cliente…</option>
          {clients.map((c) => (
            <option key={c.idCliente} value={c.idCliente}>
              {c.razonSocial}
            </option>
          ))}
        </select>
      </div>

      {clientId === "" ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 gap-2 dark:text-slate-500">
          <UserCog size={30} strokeWidth={1.75} />
          <p className="text-sm">Selecciona un cliente para gestionar sus gestores.</p>
        </div>
      ) : (
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
          {PRIORIDADES.map((prioridad, idx) => {
            const gestor = slotFor(prioridad);
            const isChangingHere = changing?.prioridad === prioridad;
            const isAssigningHere = assignPrioridad === prioridad;

            return (
              <div key={prioridad} className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 rounded-xl border border-gray-200 p-4 dark:border-slate-700">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#00796B]">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#009688]/10 text-[11px]">
                        {prioridad}
                      </span>
                      Prioridad {prioridad}
                    </span>
                  </div>

                  {/* Combo abierto (asignar o cambiar) */}
                  {isAssigningHere || isChangingHere ? (
                    <UserSearchSelect
                      excludeIds={
                        [otherSlotUserId(prioridad), gestor?.idUsuario].filter(
                          (v): v is number => typeof v === "number",
                        )
                      }
                      onSelect={(user) =>
                        isChangingHere && gestor
                          ? doChange(gestor, user)
                          : doAssign(prioridad, user)
                      }
                      onCancel={() => {
                        setAssignPrioridad(null);
                        setChanging(null);
                      }}
                    />
                  ) : gestor ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-800 dark:text-slate-100">
                          {`${gestor.nombres ?? ""} ${gestor.apellidos ?? ""}`.trim() ||
                            `@${gestor.usuario}`}
                        </p>
                        <p className="truncate text-xs text-gray-400 dark:text-slate-500">@{gestor.usuario}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAssignPrioridad(null);
                            setChanging(gestor);
                          }}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors dark:text-slate-400 dark:hover:bg-slate-700"
                          title="Cambiar gestor"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setToRemove(gestor)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors dark:hover:bg-red-500/10"
                          title="Quitar gestor"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setChanging(null);
                        setAssignPrioridad(prioridad);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-4 text-sm text-gray-500 hover:border-[#009688] hover:text-[#00796B] transition-colors dark:border-slate-600 dark:text-slate-400"
                    >
                      <UserPlus size={16} /> Asignar gestor
                    </button>
                  )}
                </div>

                {/* Botón de intercambio entre los dos slots */}
                {idx === 0 && (
                  <button
                    type="button"
                    onClick={doSwap}
                    disabled={!bothFilled}
                    title={
                      bothFilled
                        ? "Intercambiar prioridades"
                        : "Se necesitan dos gestores para intercambiar"
                    }
                    className="mx-auto flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                  >
                    <ArrowLeftRight size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {toRemove && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setToRemove(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm p-6 text-center flex flex-col items-center gap-3 dark:bg-slate-800 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 dark:bg-red-500/10">
              <Trash2 size={22} />
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100">Quitar gestor</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              ¿Quitar a{" "}
              <span className="font-medium">
                {`${toRemove.nombres} ${toRemove.apellidos}`.trim() || `@${toRemove.usuario}`}
              </span>{" "}
              de la prioridad {toRemove.prioridad}?
            </p>
            <div className="flex gap-2 w-full mt-2">
              <button
                type="button"
                onClick={() => setToRemove(null)}
                className="flex-1 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                disabled={saving}
                className="btn btn-primary flex-1 !bg-red-500 hover:!bg-red-600"
              >
                Quitar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagersManager;
