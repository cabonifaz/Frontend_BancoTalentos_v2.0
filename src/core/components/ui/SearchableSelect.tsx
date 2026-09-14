import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/core/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/shadcn/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/core/components/ui/shadcn/command";

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

/**
 * Select con búsqueda sobre Popover + Command (Radix + cmdk): navegable con
 * teclado y anunciado como combobox. Conserva el comportamiento anterior:
 * filtro por subcadena (no el difuso de cmdk), opciones en orden alfabético y
 * búsqueda vacía cada vez que se abre.
 */
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

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = options
    .filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      a.label.localeCompare(b.label, undefined, {
        sensitivity: "base",
      })
    );

  const handleOpenChange = (open: boolean) => {
    if (disabled) return;
    setIsOpen(open);
    setSearchTerm("");
  };

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    // `modal`: dentro de un Dialog, sin esto la lista no hace scroll (el
    // bloqueo de scroll del diálogo se queda con la rueda del ratón).
    <Popover open={isOpen} onOpenChange={handleOpenChange} modal>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          disabled={disabled}
          className={cn(
            "w-full h-10 px-4 border-gray-300 border rounded-lg focus:outline-none focus-visible:ring-1 focus-visible:ring-ring text-left bg-white flex items-center justify-between gap-2 dark:border-slate-600 dark:bg-slate-800",
            disabled
              ? "bg-gray-100 cursor-not-allowed dark:bg-slate-700"
              : "cursor-pointer",
            className
          )}
        >
          <span
            className={cn(
              "truncate",
              selectedOption
                ? "text-gray-900 dark:text-slate-50"
                : "text-gray-500 dark:text-slate-400"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "w-5 h-5 shrink-0 text-gray-400 transition-transform duration-200 dark:text-slate-500",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[300px] p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList className="max-h-48">
            <CommandEmpty className="px-4 py-3 text-center text-gray-500 dark:text-slate-400">
              No se encontraron opciones
            </CommandEmpty>
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={String(option.value)}
                onSelect={() => handleSelect(option.value)}
                className={cn(
                  "px-4 py-3 text-base",
                  option.value === value
                    ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-500/10 dark:text-blue-300"
                    : "text-gray-900 dark:text-slate-50"
                )}
              >
                {option.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
