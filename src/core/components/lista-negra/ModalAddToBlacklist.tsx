import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import { Modal } from "@/core/components/modals/Modal";
import { Loading } from "@/core/components/ui/Loading";
import { useModal } from "@/core/context/ModalContext";
import { useFetchClients } from "@/core/hooks/useFetchClients";
import { useBlacklist } from "@/core/hooks/lista-negra/useBlacklist";
import { Talent } from "@/core/models";
import { Label } from "@/core/components/ui/shadcn/label";
import { Textarea } from "@/core/components/ui/shadcn/textarea";
import { AppSelect } from "@/core/components/ui/AppSelect";

export const MODAL_ADD_TO_BLACKLIST = "modalAddToBlacklist";

interface Props {
  talent: Talent | null;
  /** Se llama tras restringir con éxito, para refrescar el estado de lista negra. */
  onRestricted?: () => void;
}

const selectClass =
  "h-auto bg-white px-3 py-2 text-sm text-gray-700 dark:text-slate-200";

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
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Talento: <span className="font-semibold text-gray-800 dark:text-slate-100">{fullName}</span>
          </p>
        )}

        <div className="flex flex-col gap-1">
          <Label htmlFor="blacklist-add-client" className="text-sm font-medium text-gray-700 dark:text-slate-200">
            Cliente
          </Label>
          <AppSelect
            id="blacklist-add-client"
            value={idCliente}
            onChange={(v) => setIdCliente(v === "" ? "" : Number(v))}
            options={[
              { value: 0, label: "TODOS LOS CLIENTES" },
              ...clientes.map((c) => ({ value: c.idCliente, label: c.razonSocial })),
            ]}
            placeholder="Elija un cliente"
            className={selectClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="blacklist-add-motivo" className="text-sm font-medium text-gray-700 dark:text-slate-200">
            Motivo
          </Label>
          <Textarea
            id="blacklist-add-motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Describa el motivo de la restricción"
            className="px-3 py-2 text-sm resize-none"
          />
        </div>
      </div>
    </Modal>
  );
};
