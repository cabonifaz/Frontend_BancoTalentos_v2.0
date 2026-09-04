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

/**
 * Flechas de salto (primera/anterior/siguiente/última). Botón fantasma: sin caja
 * propia, el fondo solo aparece al pasar por encima.
 */
const ARROW_CLASS =
    "h-[34px] w-[34px] rounded-lg inline-flex items-center justify-center transition-colors " +
    "text-gray-500 dark:text-slate-400 " +
    "enabled:hover:bg-gray-100 dark:enabled:hover:bg-slate-700 " +
    "enabled:hover:text-gray-700 dark:enabled:hover:text-slate-200 " +
    "disabled:opacity-30 disabled:cursor-not-allowed " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue)]";

/**
 * Número de página. Es texto, no una caja: la página actual se marca con un
 * subrayado de 2px, la misma gramática que `.tab-active` en App.css.
 */
const PAGE_CLASS =
    "h-[34px] min-w-[32px] px-2.5 inline-flex items-center justify-center " +
    "text-sm tabular-nums border-b-2 transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue)] focus-visible:rounded-sm";

const PAGE_CURRENT_CLASS =
    "font-semibold cursor-default " +
    "text-[var(--color-blue)] border-[var(--color-blue)] " +
    "dark:text-[var(--color-blue-soft)] dark:border-[var(--color-blue-soft)]";

const PAGE_IDLE_CLASS =
    "font-medium border-transparent " +
    "text-gray-500 hover:text-gray-700 " +
    "dark:text-slate-400 dark:hover:text-slate-200";

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

    const isFirstPage = currentPage <= 1;
    const isLastPage = currentPage >= totalPages;

    return (
        <nav className="flex items-center justify-center gap-2" aria-label="Paginación">
            <button
                type="button"
                onClick={handleFirst}
                disabled={isFirstPage}
                title="Primera página"
                aria-label="Primera página"
                className={ARROW_CLASS}>
                <ChevronsLeft className="h-4 w-4" strokeWidth={2} />
            </button>

            <button
                type="button"
                onClick={handlePrevious}
                disabled={isFirstPage}
                title="Página anterior"
                aria-label="Página anterior"
                className={ARROW_CLASS}>
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            </button>

            {/* Los números se apoyan en una regla de 1px: es lo que hace que el
                subrayado de la página actual se lea como una pestaña activa. */}
            <div className="flex flex-col">
                <div className="flex items-end gap-0.5">
                    {pageRange.map(
                        (page) =>
                            // El >= 1 evita que "Última" pinte páginas 0 o negativas
                            // cuando hay menos de 4 páginas en total.
                            page >= 1 && page <= totalPages && (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => handlePageChange(page)}
                                    aria-current={page === currentPage ? "page" : undefined}
                                    className={`${PAGE_CLASS} ${page === currentPage ? PAGE_CURRENT_CLASS : PAGE_IDLE_CLASS}`}>
                                    {page}
                                </button>
                            )
                    )}
                </div>
                <span className="-mt-px h-px bg-gray-200 dark:bg-slate-700" aria-hidden="true" />
            </div>

            <button
                type="button"
                onClick={handleNext}
                disabled={isLastPage}
                title="Página siguiente"
                aria-label="Página siguiente"
                className={ARROW_CLASS}>
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </button>

            <button
                type="button"
                onClick={handleLast}
                disabled={isLastPage}
                title="Última página"
                aria-label="Última página"
                className={ARROW_CLASS}>
                <ChevronsRight className="h-4 w-4" strokeWidth={2} />
            </button>
        </nav>
    );
}
