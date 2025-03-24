interface Props {
    opacity?: string;
}

export const Loading = ({ opacity }: Props) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className={`fixed inset-0 ${opacity ? `bg-black ${opacity}` : "bg-white"}`}></div>
            <div className={`flex flex-col items-center gap-4 z-10 ${opacity ? "bg-slate-50 rounded-lg p-4" : ""}`}>
                <img src="/assets/fractal-logo-BDT.png" alt="Loading" />
                <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );
};
