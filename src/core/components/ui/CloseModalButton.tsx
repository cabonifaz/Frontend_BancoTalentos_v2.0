import { X } from "lucide-react";

interface ModalProps {
  onClick: () => void;
}

export const CloseModalButton = ({ onClick }: ModalProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus:outline-none"
    >
      <X className="w-6 h-6" />
    </button>
  );
};
