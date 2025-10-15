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
      <img
        src="/assets/ic_close_x.svg"
        alt="icon close"
        className="w-6 h-6"
      />
    </button>
  );
};
