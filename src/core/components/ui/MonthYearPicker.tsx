import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthYearPickerProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

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
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!value) setViewYear(currentYear);
          setIsOpen((prev) => !prev);
        }}
        className="h-12 w-full px-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5] text-left text-sm disabled:text-gray-400 disabled:bg-gray-50 bg-white dark:border-slate-600 dark:disabled:text-slate-500 dark:disabled:bg-slate-800 dark:bg-slate-800"
      >
        {displayValue() ?? <span className="text-gray-400 dark:text-slate-500">{placeholder}</span>}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-52 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setViewYear((y) => Math.max(y - 1, min))}
              disabled={viewYear <= min}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-[#3f3f46] dark:text-slate-200">{viewYear}</span>
            <button
              type="button"
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
        </div>
      )}
    </div>
  );
};
