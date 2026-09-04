import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";

export interface ComboOption {
  /** Valor que se guarda al seleccionar (dirección de texto o URL de ubicación). */
  value: string;
  /** Texto principal mostrado en la sugerencia. */
  label: string;
  /** Texto secundario (p. ej. el cliente) mostrado al lado: `label - sub`. */
  sub?: string;
}

interface Props {
  /** Opciones derivadas de los clientes de los RQ seleccionados. */
  options: ComboOption[];
  /** Valor actual (texto libre o valor de una opción). */
  value: string;
  /** Notifica el nuevo valor. */
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
  placeholder?: string;
  /** Encabezado del grupo de sugerencias. */
  groupLabel?: string;
  /** Ayuda mostrada cuando no hay opciones de cliente. */
  emptyHint?: string;
}

/**
 * Combobox genérico para entrevistas PRESENCIALES: input de texto libre con un
 * desplegable de sugerencias derivadas de los clientes de los RQ.
 *
 * No es de solo lectura: el usuario puede elegir una sugerencia, escribir un
 * valor distinto o editar el seleccionado. Cada sugerencia puede mostrar un
 * texto secundario (el cliente) al lado: `valor - Cliente`.
 */
export const InterviewComboField = ({
  options,
  value,
  onChange,
  error,
  disabled,
  maxLength,
  placeholder = "Seleccionar o escribir...",
  groupLabel = "Opciones de clientes",
  emptyHint,
}: Props) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sugerencias filtradas por lo que el usuario escribe (contra valor y cliente).
  // Con el campo vacío se muestran todas.
  const filtered = useMemo(() => {
    const q = (value || "").trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.value.toLowerCase().includes(q) ||
        o.label.toLowerCase().includes(q) ||
        (o.sub || "").toLowerCase().includes(q),
    );
  }, [options, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex flex-col gap-1" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          disabled={disabled}
          maxLength={maxLength}
          onChange={(e) => {
            onChange(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={`input w-full pr-9 ${error ? "border-red-500" : ""}`}
          autoComplete="off"
        />
        {options.length > 0 && (
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => setOpen((o) => !o)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
            aria-label="Mostrar opciones de clientes"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        )}

        {open && filtered.length > 0 && (
          <div className="absolute z-20 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto dark:bg-slate-800 dark:border-slate-700">
            <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              {groupLabel}
            </p>
            {filtered.map((opt, i) => (
              <button
                key={`${opt.value}-${i}`}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-start gap-2 border-t border-gray-100 first:border-none transition-colors dark:hover:bg-slate-700 dark:border-slate-700"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <MapPin className="w-4 h-4 text-[var(--color-blue)] shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 dark:text-slate-200">
                  {opt.label}
                  {opt.sub ? (
                    <span className="text-gray-400 dark:text-slate-500"> - {opt.sub}</span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {options.length === 0 && emptyHint && (
        <span className="text-xs text-gray-400 dark:text-slate-500">{emptyHint}</span>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
