import { Skeleton } from "@/core/components/ui/shadcn/skeleton";

export const SkeletonCard = () => {
    return (
        <div className="flex items-center px-3 py-2 rounded-lg">
            <div className="w-full min-w-0 space-y-1">
                {/* Nombre y apellidos (skeleton) */}
                <Skeleton className="h-4 rounded w-56 max-w-full" />

                {/* Puesto (skeleton) */}
                <Skeleton className="h-3 rounded w-40 max-w-full" />

                {/* Estrellas y ubicación (skeleton) */}
                <div className="flex items-center gap-2">
                    <div className="flex gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton key={index} className="h-3.5 w-3.5 rounded-full" />
                        ))}
                    </div>
                    <Skeleton className="h-3 rounded w-24" />
                </div>

                {/* Montos (skeleton) */}
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <Skeleton className="h-3 rounded w-32" />
                    <Skeleton className="h-3 rounded w-32" />
                </div>
            </div>
        </div>
    );
};
