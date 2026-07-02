import { useState, useRef, useEffect } from "react";
import { OutsideClickHandler } from "./OutsideClickHandler";

export interface SearchableOption {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Seleccione una opción",
  className = "",
  disabled = false,
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  // Filtrar y ordenar opciones alfabéticamente
  const filteredOptions = options
    .filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      a.label.localeCompare(b.label, undefined, {
        sensitivity: "base",
      })
    );

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    setSearchTerm("");
  };

  const handleOptionClick = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  // Focus en el input cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full h-10 px-4 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5] text-left bg-white flex items-center justify-between ${
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "cursor-pointer"
        } ${className}`}
      >
        <span
          className={
            selectedOption ? "text-gray-900" : "text-gray-500"
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <OutsideClickHandler onOutsideClick={() => setIsOpen(false)}>
          <div className="absolute z-[50] w-full min-w-[300px] mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-hidden">
            {/* Search input */}
            <div className="p-3 border-b border-gray-200">
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options list */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleOptionClick(option.value)}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      option.value === value
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-900"
                    }`}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center">
                  No se encontraron opciones
                </div>
              )}
            </div>
          </div>
        </OutsideClickHandler>
      )}
    </div>
  );
};
