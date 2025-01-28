export const LoadingOverlay = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4">
                <img src="/assets/fractal-logo.png" alt="Loading" />
                <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    );
};
