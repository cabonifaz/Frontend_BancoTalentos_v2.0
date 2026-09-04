import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { AlertTriangle } from "lucide-react";
import { Modal } from "../modals/Modal";
import { Loading } from "../ui/Loading";
import { useModal } from "../../context/ModalContext";
import { useBlacklist } from "../../hooks/lista-negra/useBlacklist";
import { BlacklistItem } from "../../models";

export const MODAL_REMOVE_RESTRICTION = "modalRemoveRestriction";

interface Props {
  /** Restricción de un cliente concreto (idCliente > 0). */
  restriction: BlacklistItem | null;
  talentName?: string;
  onDone: () => void;
}

/**
 * Confirmación para quitar la restricción de un cliente concreto: es una baja
 * lógica directa. Las restricciones globales no pasan por aquí, van por
 * ModalRemoveGlobalRestriction.
 *
 * El motivo que se pide es el de la baja (por qué se levanta) y es el que queda
 * en el historial; no se reutiliza el motivo con el que se creó la restricción.
 */
export const ModalRemoveRestriction = ({
  restriction,
  talentName,
  onDone,
}: Props) => {
  const { closeModal, isModalOpen } = useModal();
  const { removeRestriction, saving } = useBlacklist();

  const [motivo, setMotivo] = useState("");

  const isOpen = isModalOpen(MODAL_REMOVE_RESTRICTION);

  // El componente queda montado entre aperturas: limpia el motivo anterior.
  useEffect(() => {
    if (isOpen) setMotivo("");
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!restriction) return;
    if (!motivo.trim()) {
      enqueueSnackbar({
        message: "Ingrese el motivo de la eliminación",
        variant: "warning",
      });
      return;
    }

    const ok = await removeRestriction({
      idListaNegra: restriction.idListaNegra,
      motivo: motivo.trim(),
    });
    if (ok) {
      closeModal(MODAL_REMOVE_RESTRICTION);
      onDone();
    }
  };

  return (
    <Modal
      id={MODAL_REMOVE_RESTRICTION}
      title="Quitar restricción"
      confirmationLabel="Quitar"
      onConfirm={handleConfirm}
    >
      {saving && <Loading opacity="opacity-60" />}
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex gap-2 rounded-lg border border-red-300 bg-red-50 p-3 dark:bg-red-500/10">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 dark:text-red-400" />
          <p className="text-sm text-red-800 dark:text-red-300">
            {talentName ? (
              <>
                <span className="font-semibold">{talentName}</span> dejará de
                estar restringido para{" "}
                <span className="font-semibold">{restriction?.cliente}</span>.
              </>
            ) : (
              <>
                El talento dejará de estar restringido para{" "}
                <span className="font-semibold">{restriction?.cliente}</span>.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
            Motivo de la eliminación
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Describa por qué se levanta la restricción"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none dark:border-slate-600"
          />
        </div>
      </div>
    </Modal>
  );
};
