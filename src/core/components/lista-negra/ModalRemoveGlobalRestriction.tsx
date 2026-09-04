import { useEffect, useMemo, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { AlertTriangle, Search } from "lucide-react";
import { Modal } from "../modals/Modal";
import { Loading } from "../ui/Loading";
import { useModal } from "../../context/ModalContext";
import { useBlacklist } from "../../hooks/lista-negra/useBlacklist";
import { BlacklistItem, BlacklistKeptClient } from "../../models";
import { Client } from "../../models/interfaces/Client";

export const MODAL_REMOVE_GLOBAL_RESTRICTION = "modalRemoveGlobalRestriction";

interface Props {
  /** Restricción global (idCliente = 0) que se va a levantar. */
  restriction: BlacklistItem | null;
  talentName?: string;
  /** Listado de clientes, izado al padre para no volver a pedir /fmi/client/list. */
  clientes: Client[];
  loadingClients: boolean;
  /** Se invoca cuando algo cambió en BD, para que el padre recargue. */
  onDone: () => void;
}

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200";

/**
 * Quitar una restricción global no libera al talento de golpe: se da de baja el
 * registro con idCliente = 0 y se vuelve a insertar una restricción individual
 * por cada cliente que se conserva, con su propio motivo. Los clientes llegan
 * todos marcados (que es lo que significa "global") y el usuario desmarca a los
 * que quiere liberar; si no queda ninguno, el talento sale de la lista negra.
 */
export const ModalRemoveGlobalRestriction = ({
  restriction,
  talentName,
  clientes,
  loadingClients,
  onDone,
}: Props) => {
  const { closeModal, isModalOpen } = useModal();
  const { replaceGlobalRestriction, saving } = useBlacklist();

  const [kept, setKept] = useState<Record<number, boolean>>({});
  const [motivos, setMotivos] = useState<Record<number, string>>({});
  /** Motivo de la baja del global: el que queda en el historial. */
  const [motivoEliminacion, setMotivoEliminacion] = useState("");
  const [query, setQuery] = useState("");
  /** Segunda pulsación para confirmar que el talento sale de la lista negra. */
  const [confirmWipe, setConfirmWipe] = useState(false);
  /**
   * Reintento tras un fallo parcial: la baja del global ya se hizo y solo
   * faltan estos clientes por reinsertar.
   */
  const [pendingRetry, setPendingRetry] = useState<BlacklistKeptClient[] | null>(
    null
  );

  const isOpen = isModalOpen(MODAL_REMOVE_GLOBAL_RESTRICTION);

  // Al abrir: todos los clientes conservan la restricción, con el motivo de la
  // global como punto de partida.
  useEffect(() => {
    if (!isOpen) return;
    const nextKept: Record<number, boolean> = {};
    const nextMotivos: Record<number, string> = {};
    for (const c of clientes) {
      nextKept[c.idCliente] = true;
      nextMotivos[c.idCliente] = restriction?.motivo ?? "";
    }
    setKept(nextKept);
    setMotivos(nextMotivos);
    setMotivoEliminacion("");
    setQuery("");
    setConfirmWipe(false);
    setPendingRetry(null);
  }, [isOpen, clientes, restriction]);

  /** Clientes en juego: en un reintento, solo los que fallaron. */
  const scopedClients = useMemo(
    () =>
      pendingRetry
        ? clientes.filter((c) =>
            pendingRetry.some((f) => f.idCliente === c.idCliente)
          )
        : clientes,
    [clientes, pendingRetry]
  );

  const visibleClients = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term
      ? scopedClients.filter((c) => c.razonSocial.toLowerCase().includes(term))
      : scopedClients;
  }, [scopedClients, query]);

  const keptCount = useMemo(
    () => scopedClients.filter((c) => kept[c.idCliente]).length,
    [scopedClients, kept]
  );

  const toggle = (idCliente: number) => {
    setConfirmWipe(false);
    setKept((prev) => ({ ...prev, [idCliente]: !prev[idCliente] }));
  };

  const setMotivo = (idCliente: number, value: string) => {
    setMotivos((prev) => ({ ...prev, [idCliente]: value }));
  };

  /** Marca o desmarca solo lo que está a la vista (respeta el filtro). */
  const setAllVisible = (value: boolean) => {
    setConfirmWipe(false);
    setKept((prev) => {
      const next = { ...prev };
      for (const c of visibleClients) next[c.idCliente] = value;
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!restriction) return;

    // En un reintento el global ya cayó: su motivo ya no se usa.
    if (!pendingRetry && !motivoEliminacion.trim()) {
      enqueueSnackbar({
        message: "Ingrese el motivo por el que se quita la restricción global",
        variant: "warning",
      });
      return;
    }

    const seleccionados: BlacklistKeptClient[] = scopedClients
      .filter((c) => kept[c.idCliente])
      .map((c) => ({
        idCliente: c.idCliente,
        motivo: (motivos[c.idCliente] ?? "").trim(),
      }));

    const sinMotivo = seleccionados.find((c) => !c.motivo);
    if (sinMotivo) {
      const cliente = clientes.find((c) => c.idCliente === sinMotivo.idCliente);
      enqueueSnackbar({
        message: `Ingrese el motivo para ${cliente?.razonSocial ?? "el cliente"}`,
        variant: "warning",
      });
      return;
    }

    // Quedarse sin clientes equivale a sacarlo de la lista negra: se pide una
    // segunda pulsación antes de ejecutar.
    if (seleccionados.length === 0 && !confirmWipe) {
      setConfirmWipe(true);
      return;
    }

    const result = await replaceGlobalRestriction({
      idListaNegra: restriction.idListaNegra,
      idTalento: restriction.idTalento,
      motivoEliminacion: motivoEliminacion.trim(),
      clientes: seleccionados,
      globalAlreadyRemoved: pendingRetry != null,
    });

    if (result.ok) {
      closeModal(MODAL_REMOVE_GLOBAL_RESTRICTION);
      onDone();
      return;
    }

    // La global ya cayó: el modal se queda abierto ofreciendo reintentar solo
    // los clientes que no se pudieron conservar.
    if (result.globalRemoved) {
      setPendingRetry(result.failed);
      setConfirmWipe(false);
    }
  };

  /** Al cerrar, si el global ya se dio de baja el padre debe recargar igual. */
  const handleClose = () => {
    if (pendingRetry) onDone();
  };

  const confirmLabel = pendingRetry ? "Reintentar" : "Confirmar";

  return (
    <Modal
      id={MODAL_REMOVE_GLOBAL_RESTRICTION}
      title="Quitar restricción global"
      confirmationLabel={confirmLabel}
      onConfirm={handleConfirm}
      onClose={handleClose}
    >
      {saving && <Loading opacity="opacity-60" />}
      <div className="flex flex-col gap-3 mt-2">
        {talentName && (
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Talento:{" "}
            <span className="font-semibold text-gray-800 dark:text-slate-100">{talentName}</span>
          </p>
        )}

        {pendingRetry ? (
          <div className="flex gap-2 rounded-lg border border-red-300 bg-red-50 p-3 dark:bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-300">
              Se quitó la restricción global, pero no se pudo conservar la de{" "}
              <span className="font-semibold">{pendingRetry.length}</span>{" "}
              cliente(s): ahora mismo el talento está libre para ellos. Reintenta
              para restringirlos de nuevo.
            </p>
          </div>
        ) : (
          <p className="text-sm text-[#71717A] dark:text-slate-400">
            Desmarca los clientes que dejarán de tener la restricción. Los que
            queden marcados se mantendrán restringidos de forma individual y
            puedes ajustar el motivo de cada uno.
          </p>
        )}

        {!pendingRetry && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
              Motivo por el que se quita la restricción global
            </label>
            <textarea
              value={motivoEliminacion}
              onChange={(e) => setMotivoEliminacion(e.target.value)}
              rows={2}
              maxLength={1000}
              placeholder="Describa por qué se levanta la restricción global"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none dark:border-slate-600"
            />
          </div>
        )}

        {!pendingRetry && (
          <div className="flex relative h-10">
            <Search className="absolute top-2 left-3 text-gray-400 dark:text-slate-500" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cliente"
              className={`${inputClass} pl-10`}
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-[#71717A] dark:text-slate-400">
            {`${keptCount} cliente(s) conservan la restricción`}
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAllVisible(true)}
              className="text-sm text-[var(--color-blue)] hover:underline"
            >
              Marcar todos
            </button>
            <button
              type="button"
              onClick={() => setAllVisible(false)}
              className="text-sm text-[var(--color-blue)] hover:underline"
            >
              Desmarcar todos
            </button>
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-200 dark:border-slate-700">
          {loadingClients ? (
            <p className="p-3 text-sm text-[#71717A] dark:text-slate-400">Cargando clientes…</p>
          ) : visibleClients.length === 0 ? (
            <p className="p-3 text-sm text-[#71717A] dark:text-slate-400">Sin resultados.</p>
          ) : (
            visibleClients.map((c) => (
              <div key={c.idCliente} className="p-2 border-b last:border-b-0 dark:border-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!kept[c.idCliente]}
                    onChange={() => toggle(c.idCliente)}
                    className="h-4 w-4 flex-shrink-0 accent-indigo-600"
                  />
                  <span className="text-sm text-gray-800 truncate dark:text-slate-100">
                    {c.razonSocial}
                  </span>
                </label>
                {kept[c.idCliente] && (
                  <input
                    type="text"
                    value={motivos[c.idCliente] ?? ""}
                    onChange={(e) => setMotivo(c.idCliente, e.target.value)}
                    maxLength={1000}
                    placeholder="Motivo de la restricción"
                    className={`${inputClass} mt-1 ml-6 w-[calc(100%-1.5rem)]`}
                  />
                )}
              </div>
            ))
          )}
        </div>

        {confirmWipe && (
          <div className="flex gap-2 rounded-lg border border-red-300 bg-red-50 p-3 dark:bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-300">
              No dejaste ningún cliente restringido: el talento saldrá por
              completo de la lista negra. Pulsa <b>{confirmLabel}</b> otra vez
              para continuar.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
