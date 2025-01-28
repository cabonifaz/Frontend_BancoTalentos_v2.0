import { ReactNode } from "react"
import { createPortal } from "react-dom";
import { useModal } from "../context/ModalContext";

interface Props {
    id: string;
    title: string;
    children: ReactNode;
}

export const Modal = ({ id, title, children }: Props) => {
    const { isModalOpen, closeModal } = useModal();
    const modalRoot = document.getElementById("modal");

    const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    }

    if (!modalRoot || !isModalOpen(id)) {
        return null;
    }

    return createPortal(
        <div className="absolute top-0 left-0 bg-[#00000048] w-full h-full flex flex-col items-center justify-center" onClick={() => closeModal(id)}>
            <div className="bg-white rounded-lg p-6 flex flex-col w-[50vw]" onClick={handleContentClick}>
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-base text-[#52525B]">{title}</h2>
                    <button className="flex items-center hover:bg-gray-100 rounded-full" onClick={() => closeModal(id)}>
                        <img src="/assets/ic_close_x.svg" alt="icon close" className="w-6 h-6" />
                    </button>
                </div>
                {children}
            </div>
        </div>,
        modalRoot
    );
}