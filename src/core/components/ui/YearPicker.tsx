import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/shadcn/popover";

interface YearPickerProps {
  value?: string;
  onChange: (year: string) => void;
  disabled?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}

/**
 * Selector de año por décadas sobre el Popover de shadcn (Escape y clic fuera
 * cierran; el foco vuelve al campo). Cuadrícula propia, como MonthYearPicker.
 */
export const YearPicker = ({
  value,
  onChange,
  disabled = false,
  placeholder = "YYYY",
  min = 1950,
  max = new Date().getFullYear(),
}: YearPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [decadeStart, setDecadeStart] = useState(() => {
    const year = value ? parseInt(value) : new Date().getFullYear();
    return Math.floor(year / 10) * 10;
  });

  // Sync decade view when value changes externally
  useEffect(() => {
    if (value) {
      const year = parseInt(value);
      setDecadeStart(Math.floor(year / 10) * 10);
    }
  }, [value]);

  const years = Array.from({ length: 10 }, (_, i) => decadeStart + i).filter(
    (y) => y >= min && y <= max,
  );

  const handleSelect = (year: number) => {
    onChange(year.toString());
    setIsOpen(false);
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        if (open && !value) setDecadeStart(Math.floor(new Date().getFullYear() / 10) * 10);
        setIsOpen(open);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="h-12 w-full px-3 border-gray-300 border rounded-lg focus:outline-none focus-visible:ring-1 focus-visible:ring-ring text-left text-sm disabled:text-gray-400 disabled:bg-gray-50 bg-white dark:border-slate-600 dark:disabled:text-slate-500 dark:disabled:bg-slate-800 dark:bg-slate-800"
        >
          {value ? value : <span className="text-gray-400 dark:text-slate-500">{placeholder}</span>}
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-52 rounded-lg p-3 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            aria-label="Década anterior"
            onClick={() => setDecadeStart((d) => d - 10)}
            disabled={decadeStart <= min}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-[#3f3f46] dark:text-slate-200">
            {decadeStart}–{Math.min(decadeStart + 9, max)}
          </span>
          <button
            type="button"
            aria-label="Década siguiente"
            onClick={() => setDecadeStart((d) => d + 10)}
            disabled={decadeStart + 10 > max}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              aria-pressed={value === year.toString()}
              onClick={() => handleSelect(year)}
              className={`py-1.5 text-sm rounded-md font-medium transition-colors ${
                value === year.toString()
                  ? "bg-[#4F46E5] text-white"
                  : "hover:bg-[#f5f4ff] text-[#3f3f46] dark:hover:bg-indigo-500/10 dark:text-slate-200"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
