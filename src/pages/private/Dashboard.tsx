import { ReactNode, useState } from "react";
import { OutsideClickHandler } from "../../core/components";
import { Utils } from "../../core/utilities/utils";
import { Navigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

interface Props {
    children: ReactNode;
}

export const Dashboard = ({ children }: Props) => {
    const [redirect, setRedirect] = useState(false);
    const [isUserOptionsVisible, setUserOptionsVisibility] = useState(false);
    const toggleUserOptionsVisibility = () => setUserOptionsVisibility((prev) => !prev);

    const logout = () => {
        Utils.removeToken();
        setRedirect(true);
        enqueueSnackbar("Sesión cerrada", { variant: 'success' });
    }

    if (redirect) return <Navigate to={"/login"} replace />

    return (
        <>
            <nav className="flex flex-row px-4 lg:px-36 justify-between items-center h-[85px] py-3 shadow-lg">
                {/* Logo */}
                <div >
                    <img src="/assets/fractal-logo.png" alt="Logo Fractal" className="h-12" />
                </div>
                {/* User info */}
                <div className="relative">
                    <div className="flex gap-4 cursor-pointer" onClick={toggleUserOptionsVisibility}>
                        <span className="rounded-[100%] text-center py-2 bg-zinc-200 text-2xl font-normal h-12 w-12">A</span>
                        <div className="flex flex-col">
                            <p className="text-base font-semibold">Adrian Dedworth</p>
                            <p className="text-sm text-[#71717A] font-light">Reclutador</p>
                        </div>
                    </div>
                    {isUserOptionsVisible && (
                        <OutsideClickHandler onOutsideClick={toggleUserOptionsVisibility}>
                            <div className="p-2 w-full rounded-lg shadow-sm absolute top-14 left-5 border-[0.5px] border-gray-50 bg-white flex z-10">
                                <button type="button" onClick={logout} className="flex justify-center py-2 gap-4 w-full rounded-lg hover:bg-gray-100">
                                    <img src="/assets/ic_logout.svg" alt="icon logout" className="w-5 h-5" />
                                    <p>Cerrar sesión</p>
                                </button>
                            </div>
                        </OutsideClickHandler>
                    )}
                </div>
            </nav>
            {children}
        </>
    );
}