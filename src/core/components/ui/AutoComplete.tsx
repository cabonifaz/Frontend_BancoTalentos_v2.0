import { useEffect, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import {
  CommandEmpty,
  CommandItem,
  CommandList,
} from "@/core/components/ui/shadcn/command";

interface Option {
  id: number;
  label: string;
}

interface AutocompleteProps {
  disabled?: boolean;
  options: Option[];
  placeholder?: string;
  onSelect: (option: Option) => void;
  value?: string;
  onQueryChange?: (value: string) => void;
}

/**
 * Buscador con sugerencias sobre cmdk (el motor del Command de shadcn): las
 * sugerencias se recorren con flechas y se eligen con Enter, y el campo se
 * anuncia como combobox. Escape vacía la búsqueda.
 * La lista va en línea bajo el campo y no en un Popover a propósito: se usa
 * dentro de diálogos, y un Popover portalizado no haría scroll ahí dentro.
 * Mismo filtro por subcadena que antes.
 */
export const Autocomplete = ({
  disabled,
  options,
  placeholder,
  onSelect,
  value,
  onQueryChange,
}: AutocompleteProps) => {
  const [internalQuery, setInternalQuery] = useState("");
  const query = value !== undefined ? value : internalQuery;
  const setQuery = onQueryChange ?? setInternalQuery;

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setQuery("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const handleSelect = (opt: Option) => {
    onSelect(opt);
    setQuery("");
  };

  return (
    <CommandPrimitive
      shouldFilter={false}
      className="relative w-full"
      onKeyDown={(e) => {
        if (e.key === "Escape") setQuery("");
      }}
    >
      <CommandPrimitive.Input
        value={query}
        onValueChange={setQuery}
        disabled={disabled}
        placeholder={placeholder ?? "Buscar habilidad..."}
        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300 dark:border-slate-700"
      />
      {query.length > 0 && (
        <CommandList className="absolute bg-white border rounded-lg mt-1 w-full max-h-40 overflow-y-auto shadow-md z-[43] dark:bg-slate-800 dark:border-slate-700">
          <CommandEmpty className="px-3 py-2 text-gray-500 dark:text-slate-400">
            No se encontraron resultados
          </CommandEmpty>
          {filtered.map((opt) => (
            <CommandItem
              key={opt.id}
              value={String(opt.id)}
              onSelect={() => handleSelect(opt)}
              className="rounded-none px-3 py-2 text-base data-[selected=true]:bg-blue-100 data-[selected=true]:text-inherit dark:data-[selected=true]:bg-blue-500/15"
            >
              {opt.label}
            </CommandItem>
          ))}
        </CommandList>
      )}
    </CommandPrimitive>
  );
};
