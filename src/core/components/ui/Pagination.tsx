import { useCallback, useEffect, useState } from "react";

interface Props {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPaginate: (page: number) => void;
}

export const Pagination = ({ totalItems, itemsPerPage, currentPage, onPaginate }: Props) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const [pageRange, setPageRange] = useState([1, 2, 3, 4]);

    const handlePageChange = (page: number) => {
        if (page === currentPage) return;

        onPaginate(page);

        const isOutsideRange = page > pageRange[3] || page < pageRange[0];
        if (isOutsideRange) {
            updatePageRange(page);
        }
    };

    const updatePageRange = useCallback((page: number) => {
        const newRangeStart = page > pageRange[3] ? page - 3 : page;
        setPageRange([
            newRangeStart,
            newRangeStart + 1,
            newRangeStart + 2,
            newRangeStart + 3
        ]);
    }, [pageRange]);

    useEffect(() => {
        updatePageRange(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const handleNext = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleFirst = () => {
        if (currentPage !== 1) {
            setPageRange([1, 2, 3, 4]);
            onPaginate(1);
        }
    };

    const handleLast = () => {
        if (currentPage !== totalPages) {
            setPageRange([
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ]);
            onPaginate(totalPages);
        }
    };

    return (
        <div className="flex items-center justify-center *:py-2 *:px-4 *:border">
            <button
                type="button"
                onClick={handleFirst}
                disabled={currentPage === 1}
                className={currentPage === 1 ? '' : "hover:bg-slate-50"}>
                <img src="/assets/ic_first_page.svg" alt="first page icon" className="h-6 w-6" />
            </button>

            <button
                type="button"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={currentPage === 1 ? '' : "hover:bg-slate-50"}>
                <img src="/assets/ic_previous_page.svg" alt="previous page icon" className="h-6 w-6" />
            </button>

            {pageRange.map(
                (page) =>
                    page <= totalPages && (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={page === currentPage ? "border-2 border-[#4f46e5] bg-[#b8b6e483] cursor-default" : "hover:bg-slate-50"}>
                            {page}
                        </button>
                    )
            )}

            <button
                type="button"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={currentPage === totalPages ? '' : "hover:bg-slate-50"}>
                <img src="/assets/ic_next_page.svg" alt="next page icon" className="h-6 w-6" />
            </button>

            <button
                type="button"
                onClick={handleLast}
                disabled={currentPage === totalPages}
                className={currentPage === totalPages ? '' : "hover:bg-slate-50"}>
                <img src="/assets/ic_last_page.svg" alt="last page icon" className="h-6 w-6" />
            </button>
        </div>
    );
}