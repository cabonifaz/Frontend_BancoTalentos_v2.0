import { useCallback, useEffect, useState } from "react";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

interface Props {
    totalItems?: number;
    itemsPerPage?: number;
    /**
     * Total de páginas ya calculado por el backend. Tiene prioridad sobre
     * totalItems/itemsPerPage, para los listados que devuelven el total de
     * páginas pero no el tamaño de página (entrevistas, requerimientos).
     */
    totalPages?: number;
    currentPage: number;
    onPaginate: (page: number) => void;
}

export const Pagination = ({ totalItems, itemsPerPage, totalPages: totalPagesProp, currentPage, onPaginate }: Props) => {
    const totalPages = totalPagesProp ?? Math.ceil((totalItems ?? 0) / (itemsPerPage || 1));
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
                <ChevronsLeft className="h-6 w-6" />
            </button>

            <button
                type="button"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={currentPage === 1 ? '' : "hover:bg-slate-50"}>
                <ChevronLeft className="h-6 w-6" />
            </button>

            {pageRange.map(
                (page) =>
                    // El >= 1 evita que "Última" pinte páginas 0 o negativas
                    // cuando hay menos de 4 páginas en total.
                    page >= 1 && page <= totalPages && (
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
                <ChevronRight className="h-6 w-6" />
            </button>

            <button
                type="button"
                onClick={handleLast}
                disabled={currentPage === totalPages}
                className={currentPage === totalPages ? '' : "hover:bg-slate-50"}>
                <ChevronsRight className="h-6 w-6" />
            </button>
        </div>
    );
}