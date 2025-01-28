import { createContext, ReactNode, useContext, useState } from "react";

interface ModalContextType {
    openModal: (id: string) => void;
    closeModal: (id: string) => void;
    isModalOpen: (id: string) => boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [openModals, setOpenModals] = useState<Record<string, boolean>>({});

    const openModal = (id: string) => {
        setOpenModals((prev) => ({ ...prev, [id]: true }));
    };

    const closeModal = (id: string) => {
        setOpenModals((prev) => ({ ...prev, [id]: false }));
    };

    const isModalOpen = (id: string) => !!openModals[id];

    return (
        <ModalContext.Provider value={{ openModal, closeModal, isModalOpen }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = (): ModalContextType => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};