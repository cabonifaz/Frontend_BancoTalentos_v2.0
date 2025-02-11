export const SkeletonCard = () => {
    return (
        <div className="flex items-center justify-around md:justify-start p-2 hover:bg-[#f4f4f5] rounded-xl cursor-pointer animate-pulse">
            {/* Imagen de perfil (skeleton) */}
            <div className="mx-2 lg:ms-4 lg:me-8 w-1/4 md:w-fit">
                <div className="w-32 h-32 md:w-16 md:h-16 rounded-full bg-gray-300"></div>
            </div>

            {/* Contenido (skeleton) */}
            <div className="w-3/4 md:w-full space-y-2">
                {/* Nombre y apellidos (skeleton) */}
                <div className="h-4 bg-gray-300 rounded w-64"></div>

                {/* Puesto (skeleton) */}
                <div className="h-4 bg-gray-300 rounded w-48"></div>

                {/* Estrellas (skeleton) */}
                <div className="flex gap-2 my-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="h-4 w-4 bg-gray-300 rounded-full"></div>
                    ))}
                </div>

                {/* Ubicación (skeleton) */}
                <div className="flex items-center gap-2 my-1 lg:h-5">
                    <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                </div>

                {/* Montos (skeleton) */}
                <div className="text-sm text-[#71717A]">
                    <div className="flex flex-row md:flex-col xl:flex-row gap-2 md:gap-0 xl:gap-2 flex-wrap">
                        <div className="h-4 bg-gray-300 rounded w-48"></div>
                        <div className="h-4 bg-gray-300 rounded w-48"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};