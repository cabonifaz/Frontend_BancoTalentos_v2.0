import { ReactNode } from "react";
import { X, Check } from "lucide-react";
import { useModal } from "@/core/context/ModalContext";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/core/components/ui/shadcn/dialog";
import { Button } from "@/core/components/ui/shadcn/button";

interface Props {
  id: string;
  title: string;
  showButtonOptions?: boolean;
  cancellationLabel?: string;
  confirmationLabel?: string;
  width?: "small";
  /**
   * Mientras es `true`, deshabilita confirmar / cancelar / cerrar. Evita disparar
   * varias operaciones (p. ej. subidas) en paralelo o cerrar el modal a mitad de
   * una acción en curso, dejando estado colgado.
   */
  busy?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
  children: ReactNode;
}

/**
 * Modal base de BDT sobre el Dialog de shadcn (Radix). La API no cambia y se
 * sigue abriendo por id con useModal(). Lo que aporta Radix: foco atrapado
 * dentro, cierre con Escape, bloqueo del scroll de fondo y foco devuelto al
 * elemento que lo abrió.
 * Como antes, un clic fuera NO cierra (evita perder un formulario a medias) y,
 * mientras `busy`, nada lo cierra: ni la X, ni Cancelar, ni Escape.
 */
export const Modal = ({
  id,
  title,
  showButtonOptions = true,
  cancellationLabel = "Cancelar",
  confirmationLabel = "Aceptar",
  width,
  busy = false,
  onConfirm,
  onClose,
  children,
}: Props) => {
  const { isModalOpen, closeModal } = useModal();
  const divWidth =
    width === "small"
      ? `w-[50vw] md:w-[30vw] lg:w-[20vw]`
      : "w-[80vw] lg:w-[50vw]";

  const onModalClose = () => {
    if (busy) return;
    onClose?.();
    closeModal(id);
  };

  return (
    <Dialog
      open={isModalOpen(id)}
      onOpenChange={(open) => {
        if (!open) onModalClose();
      }}
    >
      <DialogContent
        className={`flex max-w-none flex-col gap-0 ${divWidth}`}
        overlayClassName="bg-[#00000048]"
        onEscapeKeyDown={(e) => {
          if (busy) e.preventDefault();
        }}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between">
          <DialogTitle className="font-semibold text-base text-[#52525B] dark:text-slate-300">
            {title}
          </DialogTitle>
          <button
            type="button"
            aria-label="Cerrar"
            className="flex items-center hover:bg-gray-100 rounded-full disabled:opacity-40 disabled:cursor-not-allowed dark:hover:bg-slate-700"
            onClick={onModalClose}
            disabled={busy}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {children}
        <div
          className={`mt-6 gap-4 *:px-4 *:py-3 ${showButtonOptions ? "flex" : "hidden"}`}
        >
          <Button
            variant="outline"
            onClick={onModalClose}
            disabled={busy}
            className="flex w-1/2 mx-1 font-semibold disabled:opacity-40"
          >
            <X className="w-4 h-4" />
            <p className="mx-auto">{cancellationLabel}</p>
          </Button>
          <Button
            onClick={onConfirm}
            disabled={busy}
            className="flex w-1/2 mx-1 font-semibold disabled:opacity-40"
          >
            <Check className="w-5 h-5" />
            <p className="mx-auto">{confirmationLabel}</p>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
