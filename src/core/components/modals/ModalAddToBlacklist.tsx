import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import { Modal } from "./Modal";
import { Loading } from "../ui/Loading";
import { useModal } from "../../context/ModalContext";
import { useFetchClients } from "../../hooks/useFetchClients";
import { useBlacklist } from "../../hooks/blacklist/useBlacklist";
import { Talent } from "../../models";

export const MODAL_ADD_TO_BLACKLIST = "modalAddToBlacklist";

interface Props {
  talent: Talent | null;
  /** Se llama tras restringir con éxito, para refrescar el estado de lista negra. */
  onRestricted?: () => void;
}

const selectClass =
  "w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500";

/**
 * Modal para restringir un talento (lista negra). Se abre desde el botón calavera
 * del detalle de talento. Permite elegir un cliente específico o "TODOS LOS
 * CLIENTES" (idCliente = 0) y un motivo.
 */
export const ModalAddToBlacklist = ({ talent, onRestricted }: Props) => {
  const { closeModal } = useModal();
  const { clientes } = useFetchClients();
  const { createRestriction, saving } = useBlacklist();

  // "" = sin elegir, 0 = todos los clientes, >0 = cliente específico.
  const [idCliente, setIdCliente] = useState<number | "">("");
  const [motivo, setMotivo] = useState("");

  const reset = () => {
    setIdCliente("");
    setMotivo("");
  };

  const handleConfirm = async () => {
    if (!talent) return;
    if (idCliente === "") {
      enqueueSnackbar({
        message: "Seleccione el cliente a restringir",
        variant: "warning",
      });
      return;
    }
    if (!motivo.trim()) {
      enqueueSnackbar({ message: "Ingrese el motivo", variant: "warning" });
      return;
    }

    const ok = await createRestriction({
      idTalento: talent.idTalento,
      idCliente: Number(idCliente),
      motivo: motivo.trim(),
    });

    if (ok) {
      reset();
      closeModal(MODAL_ADD_TO_BLACKLIST);
      onRestricted?.();
    }
  };

  const fullName = talent
    ? `${talent.nombres} ${talent.apellidoPaterno} ${talent.apellidoMaterno}`
    : "";

  return (
    <Modal
      id={MODAL_ADD_TO_BLACKLIST}
      title="Agregar a lista negra"
      confirmationLabel="Restringir"
      onConfirm={handleConfirm}
      onClose={reset}
    >
      {saving && <Loading opacity="opacity-60" />}
      <div className="flex flex-col gap-4 mt-2">
        {fullName && (
          <p className="text-sm text-gray-600">
            Talento: <span className="font-semibold text-gray-800">{fullName}</span>
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Cliente</label>
          <select
            value={idCliente}
            onChange={(e) =>
              setIdCliente(e.target.value === "" ? "" : Number(e.target.value))
            }
            className={selectClass}
          >
            <option value="">Elija un cliente</option>
            <option value={0}>TODOS LOS CLIENTES</option>
            {clientes.map((c) => (
              <option key={c.idCliente} value={c.idCliente}>
                {c.razonSocial}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Motivo</label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Describa el motivo de la restricción"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
      </div>
    </Modal>
  );
};
