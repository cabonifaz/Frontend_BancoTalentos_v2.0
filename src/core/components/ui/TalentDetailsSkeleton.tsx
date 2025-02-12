export const TalentDetailsSkeleton = () => {
    return (
        <div className="flex flex-col px-8 md:pt-8 overflow-y-scroll overflow-x-hidden h-full lg:h-[calc(100vh-205px)]">
            {/* Back Button (Mobile) - Skeleton */}
            <div className="w-fit px-4 py-2 rounded-xl bg-[#e4e4e7] flex gap-4 md:hidden justify-end items-center my-4">
                <div className="h-6 w-6 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
            </div>

            {/* Talent Main Info - Skeleton */}
            <div className="flex flex-col sm:flex-row items-center w-full justify-between">
                {/* Profile Picture and Name */}
                <div className="flex gap-10 sm:h-28">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-gray-300 animate-pulse"></div>
                        <div className="absolute bottom-4 -right-2 h-9 w-9 bg-white shadow-lg rounded-full p-2 hover:bg-zinc-50">
                            <div className="h-6 w-6 bg-gray-300 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="h-6 w-48 bg-gray-300 rounded animate-pulse"></div>
                        <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                        <div className="h-4 w-40 bg-gray-300 rounded animate-pulse"></div>
                        <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                </div>

                {/* CV and Contact Buttons */}
                <div className="flex flex-row sm:flex-col xl:flex-row gap-24 sm:gap-2 xl:gap-10 justify-self-end sm:h-28 my-4 sm:my-0">
                    <div className="h-10 w-36 bg-gray-300 rounded-lg animate-pulse"></div>
                    <div className="flex flex-col gap-4">
                        <div className="h-10 w-36 bg-gray-300 rounded-lg animate-pulse"></div>
                        <div className="flex gap-4 justify-center items-end">
                            <div className="h-6 w-6 bg-gray-300 rounded-full animate-pulse"></div>
                            <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
                            <div className="h-6 w-6 bg-gray-300 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* File Upload - Skeleton */}
            <div className="flex flex-col sm:flex-row items-center w-full justify-between gap-4 my-8">
                <div className="h-4 w-48 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-32 w-full sm:w-96 bg-gray-300 rounded-lg animate-pulse"></div>
            </div>

            {/* Skills - Skeleton */}
            <div className="flex flex-col sm:flex-row w-full gap-8 my-8">
                {/* Technical Skills */}
                <div className="flex flex-col gap-4 sm:w-1/2">
                    <div className="h-6 w-48 bg-gray-300 rounded animate-pulse"></div>
                    <div className="flex flex-wrap gap-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-8 w-20 bg-gray-300 rounded-full animate-pulse"></div>
                        ))}
                    </div>
                </div>
                {/* Soft Skills */}
                <div className="flex flex-col gap-4 sm:w-1/2">
                    <div className="h-6 w-48 bg-gray-300 rounded animate-pulse"></div>
                    <div className="flex flex-wrap gap-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-8 w-20 bg-gray-300 rounded-full animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Description - Skeleton */}
            <div className="flex flex-col gap-4 my-8">
                <div className="h-6 w-48 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-20 w-full bg-gray-300 rounded animate-pulse"></div>
            </div>

            {/* Availability - Skeleton */}
            <div className="flex flex-col gap-4 my-8">
                <div className="h-6 w-48 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 w-64 bg-gray-300 rounded animate-pulse"></div>
            </div>

            {/* Experience - Skeleton */}
            <div className="flex flex-col gap-4 my-8">
                <div className="h-6 w-48 bg-gray-300 rounded animate-pulse"></div>
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-20 w-full bg-gray-300 rounded-lg animate-pulse"></div>
                ))}
            </div>

            {/* Education - Skeleton */}
            <div className="flex flex-col gap-4 my-8">
                <div className="h-6 w-48 bg-gray-300 rounded animate-pulse"></div>
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-20 w-full bg-gray-300 rounded-lg animate-pulse"></div>
                ))}
            </div>

            {/* Languages - Skeleton */}
            <div className="flex flex-col gap-4 my-8">
                <div className="h-6 w-48 bg-gray-300 rounded animate-pulse"></div>
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-12 w-full bg-gray-300 rounded-lg animate-pulse"></div>
                ))}
            </div>

            {/* Feedback - Skeleton */}
            <div className="flex flex-col gap-4 my-8">
                <div className="h-6 w-48 bg-gray-300 rounded animate-pulse"></div>
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-20 w-full bg-gray-300 rounded-lg animate-pulse"></div>
                ))}
                <div className="h-10 w-48 bg-gray-300 rounded-lg animate-pulse"></div>
            </div>
        </div>
    );
};