import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, Check } from "lucide-react";
import { useModal } from "../../context/ModalContext";

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
  const modalRoot = document.getElementById("modal");

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  if (!modalRoot || !isModalOpen(id)) {
    return null;
  }

  const onModalClose = (id: string) => {
    if (busy) return;
    onClose?.();
    closeModal(id);
  };

  return createPortal(
    <div className="fixed inset-0 bg-[#00000048] dark:bg-black/70 w-full h-screen flex flex-col items-center justify-center z-[60]">
      <div
        className={`bg-white rounded-lg p-6 flex flex-col dark:bg-slate-800 ${divWidth}`}
        onClick={handleContentClick}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base text-[#52525B] dark:text-slate-300">{title}</h2>
          <button
            className="flex items-center hover:bg-gray-100 rounded-full disabled:opacity-40 disabled:cursor-not-allowed dark:hover:bg-slate-700"
            onClick={onModalClose.bind(null, id)}
            disabled={busy}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {children}
        <div
          className={`mt-6 gap-4 *:px-4 *:py-3 ${showButtonOptions ? "flex" : "hidden"}`}
        >
          <button
            type="button"
            onClick={onModalClose.bind(null, id)}
            disabled={busy}
            className="flex items-center w-1/2 font-semibold btn btn-outline-gray disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
            <p className="mx-auto">{cancellationLabel}</p>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex items-center w-1/2 font-semibold btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-5 h-5" />
            <p className="mx-auto">{confirmationLabel}</p>
          </button>
        </div>
      </div>
    </div>,
    modalRoot,
  );
};
