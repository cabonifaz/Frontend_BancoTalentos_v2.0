import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/shadcn/popover";

interface MonthYearPickerProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/**
 * Selector de mes/año sobre el Popover de shadcn: el panel se cierra con
 * Escape o al hacer clic fuera y devuelve el foco al campo. La cuadrícula de
 * meses es propia: el Calendar de shadcn elige días, no meses.
 */
export const MonthYearPicker = ({
  value,
  onChange,
  disabled = false,
  placeholder = "MM/YYYY",
  min = 1950,
  max = new Date().getFullYear(),
}: MonthYearPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    if (value) return parseInt(value.substring(0, 4));
    return new Date().getFullYear();
  });

  useEffect(() => {
    if (value) setViewYear(parseInt(value.substring(0, 4)));
  }, [value]);

  const handleSelect = (monthIdx: number) => {
    const monthStr = String(monthIdx + 1).padStart(2, "0");
    onChange(`${viewYear}-${monthStr}`);
    setIsOpen(false);
  };

  const displayValue = () => {
    if (!value || !/^\d{4}-\d{2}$/.test(value)) return null;
    const [year, month] = value.split("-");
    return `${MONTHS[parseInt(month) - 1]} ${year}`;
  };

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        if (open && !value) setViewYear(currentYear);
        setIsOpen(open);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="h-12 w-full px-3 border-gray-300 border rounded-lg focus:outline-none focus-visible:ring-1 focus-visible:ring-ring text-left text-sm disabled:text-gray-400 disabled:bg-gray-50 bg-white dark:border-slate-600 dark:disabled:text-slate-500 dark:disabled:bg-slate-800 dark:bg-slate-800"
        >
          {displayValue() ?? <span className="text-gray-400 dark:text-slate-500">{placeholder}</span>}
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-52 rounded-lg p-3 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            aria-label="Año anterior"
            onClick={() => setViewYear((y) => Math.max(y - 1, min))}
            disabled={viewYear <= min}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-[#3f3f46] dark:text-slate-200">{viewYear}</span>
          <button
            type="button"
            aria-label="Año siguiente"
            onClick={() => setViewYear((y) => Math.min(y + 1, max))}
            disabled={viewYear >= max}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {MONTHS.map((name, idx) => {
            const monthStr = String(idx + 1).padStart(2, "0");
            const isSelected = value === `${viewYear}-${monthStr}`;
            const isFuture = viewYear === currentYear && idx > currentMonth;
            return (
              <button
                key={name}
                type="button"
                disabled={isFuture}
                aria-pressed={isSelected}
                onClick={() => handleSelect(idx)}
                className={`py-1.5 text-sm rounded-md font-medium transition-colors ${
                  isSelected
                    ? "bg-[#4F46E5] text-white"
                    : isFuture
                      ? "text-gray-300 cursor-not-allowed dark:text-slate-600"
                      : "hover:bg-[#f5f4ff] text-[#3f3f46] dark:hover:bg-indigo-500/10 dark:text-slate-200"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
