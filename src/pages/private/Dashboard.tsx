import { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

export const Dashboard = ({ children }: Props) => {

    return (
        <>
            <nav className="flex flex-row px-4 lg:px-36 justify-between items-center h-[85px] py-3 shadow-lg">
                {/* Logo */}
                <div >
                    <img src="/assets/fractal-logo.png" alt="Logo Fractal" className="h-12" />
                </div>
                {/* User info */}
                <div className="flex gap-4">
                    <span className="rounded-[100%] text-center py-2 bg-zinc-200 text-2xl font-normal h-12 w-12">A</span>
                    <div className="flex flex-col">
                        <p className="text-base font-semibold">Adrian Dedworth</p>
                        <p className="text-sm text-[#71717A] font-light">Reclutador</p>
                    </div>
                </div>
            </nav>
            {children}
        </>
    );
}