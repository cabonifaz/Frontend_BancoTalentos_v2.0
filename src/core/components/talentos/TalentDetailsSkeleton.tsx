import { Skeleton } from "@/core/components/ui/shadcn/skeleton";

export const TalentDetailsSkeleton = () => {
    return (
        <div className="flex flex-col px-8 pt-4 overflow-y-scroll overflow-x-hidden h-full">
            {/* Back Button (Mobile) - Skeleton */}
            <div className="w-fit px-4 py-2 rounded-xl bg-[#e4e4e7] flex gap-4 md:hidden justify-end items-center my-4 dark:bg-slate-700">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-16 rounded" />
            </div>

            {/* Talent Main Info - Skeleton */}
            <div className="flex flex-col sm:flex-row items-center w-full justify-between">
                {/* Profile Picture and Name */}
                <div className="flex gap-10 sm:h-28">
                    <div className="relative">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="absolute bottom-4 -right-2 h-9 w-9 bg-white shadow-lg rounded-full p-2 hover:bg-zinc-50 dark:bg-slate-800 dark:hover:bg-slate-700">
                            <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-6 w-48 rounded" />
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-4 w-40 rounded" />
                        <Skeleton className="h-4 w-24 rounded" />
                    </div>
                </div>

                {/* CV and Contact Buttons */}
                <div className="flex flex-row sm:flex-col xl:flex-row gap-24 sm:gap-2 xl:gap-10 justify-self-end sm:h-28 my-4 sm:my-0">
                    <Skeleton className="h-10 w-36 rounded-lg" />
                    <div className="flex flex-col gap-4">
                        <Skeleton className="h-10 w-36 rounded-lg" />
                        <div className="flex gap-4 justify-center items-end">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>

            {/* File Upload - Skeleton */}
            <div className="flex flex-col sm:flex-row items-center w-full justify-between gap-4 my-8">
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-32 w-full sm:w-96 rounded-lg" />
            </div>

            {/* Skills - Skeleton */}
            <div className="flex flex-col sm:flex-row w-full gap-8 my-8">
                {/* Technical Skills */}
                <div className="flex flex-col gap-4 sm:w-1/2">
                    <Skeleton className="h-6 w-48 rounded" />
                    <div className="flex flex-wrap gap-2">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-8 w-20 rounded-full" />
                        ))}
                    </div>
                </div>
                {/* Soft Skills */}
                <div className="flex flex-col gap-4 sm:w-1/2">
                    <Skeleton className="h-6 w-48 rounded" />
                    <div className="flex flex-wrap gap-2">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-8 w-20 rounded-full" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Description - Skeleton */}
            <div className="flex flex-col gap-4 my-8">
                <Skeleton className="h-6 w-48 rounded" />
                <Skeleton className="h-20 w-full rounded" />
            </div>

            {/* Availability - Skeleton */}
            <div className="flex flex-col gap-4 my-8">
                <Skeleton className="h-6 w-48 rounded" />
                <Skeleton className="h-4 w-64 rounded" />
            </div>

            {/* Experience - Skeleton */}
            <div className="flex flex-col gap-4 my-8">
                <Skeleton className="h-6 w-48 rounded" />
                {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
            </div>

            {/* Education - Skeleton */}
            <div className="flex flex-col gap-4 my-8">
                <Skeleton className="h-6 w-48 rounded" />
                {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
            </div>

            {/* Languages - Skeleton */}
            <div className="flex flex-col gap-4 my-8">
                <Skeleton className="h-6 w-48 rounded" />
                {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
            </div>

            {/* Feedback - Skeleton */}
            <div className="flex flex-col gap-4 my-8">
                <Skeleton className="h-6 w-48 rounded" />
                {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
                <Skeleton className="h-10 w-48 rounded-lg" />
            </div>
        </div>
    );
};
