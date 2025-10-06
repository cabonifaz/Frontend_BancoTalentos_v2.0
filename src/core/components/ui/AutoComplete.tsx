import { useEffect, useState } from "react";

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
  const [filtered, setFiltered] = useState<Option[]>(options);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setFiltered(
      options.filter((opt) =>
        opt.label.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  useEffect(() => {
    setFiltered(options);
    setQuery("");
  }, [options]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        disabled={disabled}
        onChange={handleChange}
        placeholder={placeholder ?? "Buscar habilidad..."}
        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
      />
      {query.length > 0 && (
        <ul className="absolute bg-white border rounded-lg mt-1 w-full max-h-40 overflow-y-auto shadow-md z-10">
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <li
                key={opt.id}
                className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                onClick={() => {
                  onSelect(opt);
                  setQuery("");
                }}
              >
                {opt.label}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500">
              No se encontraron resultados
            </li>
          )}
        </ul>
      )}
    </div>
  );
};
