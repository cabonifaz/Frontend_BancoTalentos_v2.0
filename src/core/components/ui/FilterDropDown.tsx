import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/core/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/shadcn/popover";
import { Button } from "@/core/components/ui/shadcn/button";
import { Badge } from "@/core/components/ui/shadcn/badge";
import { Checkbox } from "@/core/components/ui/shadcn/checkbox";
import { Input } from "@/core/components/ui/shadcn/input";
import { RadioGroup, RadioGroupItem } from "@/core/components/ui/shadcn/radio-group";

export interface BaseOption {
  value: string | number;
  label: string;
}

interface Props<T extends BaseOption> {
  name: string;
  label: string;
  isOpen: boolean;
  options: T[];
  sortOptions?: boolean;
  optionsPanelSize: string;
  optionsType: "radio" | "checkbox";
  inputPosition: "left" | "right";
  searchable?: boolean;
  onToggle: () => void;
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
}

// Casillas en índigo, como los checkbox nativos (accent-[#4f46e5]) de antes.
const INDIGO =
  "h-4 w-4 data-[state=checked]:border-[#4f46e5] data-[state=checked]:bg-[#4f46e5] text-[#4f46e5]";

/**
 * Filtro en píldora con panel de opciones, sobre Popover + Checkbox/RadioGroup
 * de shadcn. La API no cambia: el padre sigue controlando `isOpen`/`onToggle`
 * (así garantiza un solo filtro abierto a la vez).
 * El estado de cada casilla sale solo de `selectedValues`; el componente
 * anterior además tocaba el DOM (`input.checked = …`) y se desincronizaba.
 * En modo "radio", pulsar la opción ya elegida la deselecciona, como antes.
 */
export const FilterDropDown = <T extends BaseOption>({
  label,
  options,
  name,
  sortOptions = true,
  optionsType,
  inputPosition,
  optionsPanelSize,
  searchable = false,
  isOpen,
  onToggle,
  selectedValues,
  onChange,
}: Props<T>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const isActive = selectedValues.length > 0;

  const toggleCheckbox = (value: string) => {
    onChange(
      selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value]
    );
  };

  const handleRemoveOption = (value: string) => {
    onChange(selectedValues.filter((v) => v !== value));
  };

  const visibleOptions = [...options]
    .filter((option) =>
      searchable && searchTerm
        ? option.label.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    )
    .sort((a, b) =>
      sortOptions
        ? a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
        : 0
    );

  const rowClass = cn(
    inputPosition === "left" ? "gap-2" : "justify-between flex-row-reverse",
    "flex items-center hover:bg-[#f2f4f7] rounded-lg px-2 cursor-pointer dark:hover:bg-slate-700"
  );

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        if (open !== isOpen) onToggle();
      }}
    >
      {/* La X de limpiar va FUERA del botón que abre el panel: antes era un
          <button> dentro de otro <button>, que no es HTML válido. */}
      <div className="relative inline-flex">
        <PopoverTrigger asChild>
          <Button
            variant={isActive ? "filter-active" : "filter"}
            size="none"
            className={cn("py-2 px-4", isActive && "pr-11")}
          >
            {label}
          </Button>
        </PopoverTrigger>
        {isActive && (
          <button
            type="button"
            aria-label={`Quitar filtro ${label}`}
            onClick={() => onChange([])}
            className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <PopoverContent
        align="start"
        sideOffset={8}
        className={cn(
          optionsPanelSize,
          "max-h-[480px] overflow-y-auto rounded p-2 flex flex-col shadow-lg"
        )}
      >
        {searchable && (
          <div className="mb-2">
            <Input
              type="text"
              placeholder="Buscar opciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 rounded-md text-sm"
            />
          </div>
        )}

        {optionsType === "checkbox" ? (
          <>
            <div className="border border-gray-300 rounded-lg mb-2 p-2 dark:border-slate-600">
              <ul className="list-none flex gap-1 flex-wrap min-h-8">
                {selectedValues.map((value) => (
                  <li key={value} className="max-w-full">
                    <Badge
                      variant="outline"
                      className="max-w-full gap-1 rounded-md border-transparent bg-[#EEF2FF] p-1 text-sm font-normal text-[#312e81] dark:bg-indigo-500/10 dark:text-indigo-300"
                    >
                      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap max-w-[calc(100%-10px)]">
                        {options.find((opt) => opt.value.toString() === value)
                          ?.label || value}
                      </span>
                      <button
                        type="button"
                        aria-label="Quitar"
                        onClick={() => handleRemoveOption(value)}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
            {visibleOptions.map((option) => {
              const value = option.value.toString();
              const id = `${name}-${value}`;
              return (
                <label key={value} htmlFor={id} className={rowClass}>
                  <Checkbox
                    id={id}
                    checked={selectedValues.includes(value)}
                    onCheckedChange={() => toggleCheckbox(value)}
                    className={INDIGO}
                  />
                  <span className="flex items-center text-sm my-2">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </>
        ) : (
          <RadioGroup
            value={selectedValues[0] ?? ""}
            onValueChange={(value) => onChange([value])}
            className="gap-0"
          >
            {visibleOptions.map((option) => {
              const value = option.value.toString();
              const id = `${name}-${value}`;
              const selected = selectedValues.includes(value);
              return (
                <label
                  key={value}
                  htmlFor={id}
                  className={rowClass}
                  onClick={(e) => {
                    // Radix no deselecciona un radio ya marcado: se hace aquí.
                    if (selected) {
                      e.preventDefault();
                      onChange([]);
                    }
                  }}
                >
                  <RadioGroupItem
                    id={id}
                    value={value}
                    className="h-4 w-4 text-[#4f46e5] data-[state=checked]:border-[#4f46e5]"
                  />
                  <span className="flex items-center text-sm my-2">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </RadioGroup>
        )}
      </PopoverContent>
    </Popover>
  );
};
