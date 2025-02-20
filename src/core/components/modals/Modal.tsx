import { ReactNode } from "react"
import { createPortal } from "react-dom";
import { useModal } from "../../context/ModalContext";

interface Props {
    id: string;
    title: string;
    showButtonOptions?: boolean;
    cancellationLabel?: string;
    confirmationLabel?: string;
    width?: 'small';
    onConfirm?: () => void;
    children: ReactNode;
}

export const Modal = ({ id, title, showButtonOptions = true, cancellationLabel = "Cancelar", confirmationLabel = "Aceptar", width, onConfirm, children }: Props) => {
    const { isModalOpen, closeModal } = useModal();
    const divWidth = width === 'small' ? `w-[50vw] md:w-[30vw] lg:w-[20vw]` : "w-[80vw] lg:w-[50vw]";
    const modalRoot = document.getElementById("modal");

    const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    }

    if (!modalRoot || !isModalOpen(id)) {
        return null;
    }

    return createPortal(
        <div className="absolute top-0 left-0 bg-[#00000048] w-full h-screen flex flex-col items-center justify-center z-20" onClick={() => closeModal(id)}>
            <div className={`bg-white rounded-lg p-6 flex flex-col ${divWidth}`} onClick={handleContentClick}>
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-base text-[#52525B]">{title}</h2>
                    <button className="flex items-center hover:bg-gray-100 rounded-full" onClick={() => closeModal(id)}>
                        <img src="/assets/ic_close_x.svg" alt="icon close" className="w-6 h-6" />
                    </button>
                </div>
                {children}
                <div className={`mt-6 gap-4 *:px-4 *:py-3 ${showButtonOptions ? "flex" : "hidden"}`}>
                    <button
                        type="button"
                        onClick={() => closeModal(id)}
                        className="flex border border-[#64748B] text-[#64748B] items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-gray-50">
                        <img src="/assets/ic_close_x.svg" alt="icon cancel" className="w-4 h-4" />
                        <p className="mx-auto">{cancellationLabel}</p>
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex bg-[#009695] text-white items-center rounded-lg h-12 w-1/2 font-semibold hover:bg-[#007d7c]">
                        <img src="/assets/ic_check.svg" alt="icon check" className="w-5 h-5 invert-[1]" />
                        <p className="mx-auto">{confirmationLabel}</p>
                    </button>
                </div>
            </div>
        </div>,
        modalRoot
    );
}