import { ReactNode, useState } from "react";
import { OutsideClickHandler } from "../../core/components";
import { Utils } from "../../core/utilities/utils";
import { Navigate, useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

interface Props {
    children: ReactNode;
}

export const Dashboard = ({ children }: Props) => {
    const [redirect, setRedirect] = useState(false);
    const [isUserOptionsVisible, setUserOptionsVisibility] = useState(false);
    const toggleUserOptionsVisibility = () => setUserOptionsVisibility((prev) => !prev);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    if (!token) return <Navigate to={"/login"} replace />

    const fullName = Utils.decodeJwt(token).fullname;
    const firstLetter = fullName.charAt(0);
    const rol = Utils.decodeJwt(token).roles[0];

    const logout = () => {
        Utils.removeToken();
        setRedirect(true);
        enqueueSnackbar("Sesión cerrada", { variant: 'success' });
    }

    const handleRequirementsClick = () => {
        navigate("/dashboard/requerimientos");
    }

    const goHome = () => {
        navigate("/dashboard/talentos");
    }

    const handleGenerateCodeClick = () => {
        navigate("/dashboard/generarEnlaceRequerimiento");
    }

    if (redirect) return <Navigate to={"/login"} replace />

    return (
        <>
            <nav className="flex flex-row px-4 xl:px-36 justify-between items-center h-[85px] py-3 shadow-lg">
                {/* Logo */}
                <div>
                    <img src="/assets/fractal-logo-BDT.png" alt="Logo Fractal" className="h-12 cursor-pointer" onClick={goHome} />
                </div>
                {/* User info */}
                <div className="">
                    <div className="flex gap-4 cursor-pointer relative" onClick={toggleUserOptionsVisibility}>
                        <span className="rounded-[100%] text-center py-2 bg-zinc-200 text-2xl font-normal h-12 w-12">{firstLetter}</span>
                        <div className="flex-col hidden sm:flex">
                            <p className="text-base font-semibold">{fullName}</p>
                            <p className="text-sm text-[#71717A] font-light">{rol}</p>
                        </div>

                        {isUserOptionsVisible && (
                            <OutsideClickHandler onOutsideClick={toggleUserOptionsVisibility}>
                                <div className="flex flex-col py-2 ps-4 pe-10 min-w-fit rounded-lg shadow-sm absolute top-14 right-5 sm:left-2 border-[0.5px] border-gray-50 bg-white z-30">
                                    <button type="button" onClick={goHome} className="flex p-2 gap-2 items-center w-full rounded-lg hover:bg-gray-100">
                                        <img src="/assets/ic_home.svg" alt="icon req" className="w-5 h-5" />
                                        <p className="text-nowrap whitespace-nowrap">Inicio</p>
                                    </button>
                                    <button type="button" onClick={handleRequirementsClick} className="flex p-2 gap-2 items-center w-full rounded-lg hover:bg-gray-100">
                                        <img src="/assets/ic_requirements_bdt.svg" alt="icon req" className="w-5 h-5" />
                                        <p className="text-nowrap whitespace-nowrap">Requerimientos</p>
                                    </button>
                                    <button type="button" onClick={handleGenerateCodeClick} className="flex p-2 gap-2 items-center w-full rounded-lg hover:bg-gray-100 text-nowrap">
                                        <img src="/assets/ic_generate_link_bdt.svg" alt="icon req" className="w-5 h-5" />
                                        <p className="text-nowrap whitespace-nowrap">Generar enlace</p>
                                    </button>
                                    <button type="button" onClick={logout} className="flex p-2 gap-2 items-center w-full rounded-lg hover:bg-gray-100">
                                        <img src="/assets/ic_logout.svg" alt="icon logout" className="w-5 h-5" />
                                        <p className="text-nowrap whitespace-nowrap">Cerrar sesión</p>
                                    </button>
                                </div>
                            </OutsideClickHandler>
                        )}
                    </div>
                </div>
            </nav>
            {children}
        </>
    );
}