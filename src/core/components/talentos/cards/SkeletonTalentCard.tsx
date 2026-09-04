export const SkeletonCard = () => {
    return (
        <div className="flex items-center px-3 py-2 rounded-lg animate-pulse">
            <div className="w-full min-w-0 space-y-1">
                {/* Nombre y apellidos (skeleton) */}
                <div className="h-4 bg-gray-300 rounded w-56 max-w-full dark:bg-slate-600"></div>

                {/* Puesto (skeleton) */}
                <div className="h-3 bg-gray-300 rounded w-40 max-w-full dark:bg-slate-600"></div>

                {/* Estrellas y ubicación (skeleton) */}
                <div className="flex items-center gap-2">
                    <div className="flex gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="h-3.5 w-3.5 bg-gray-300 rounded-full dark:bg-slate-600"></div>
                        ))}
                    </div>
                    <div className="h-3 bg-gray-300 rounded w-24 dark:bg-slate-600"></div>
                </div>

                {/* Montos (skeleton) */}
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <div className="h-3 bg-gray-300 rounded w-32 dark:bg-slate-600"></div>
                    <div className="h-3 bg-gray-300 rounded w-32 dark:bg-slate-600"></div>
                </div>
            </div>
        </div>
    );
};
