import { useMemo } from "react";
import { Pencil } from "lucide-react";
import { SearchableSelect } from "../ui/SearchableSelect";

/** Valor centinela para la opción "escribir una ubicación personalizada". */
const CUSTOM_LOCATION = "__CUSTOM_LOCATION__";

interface Props {
  /** Ubicaciones únicas derivadas de los clientes de los RQ seleccionados. */
  options: string[];
  /**
   * Etiquetas legibles por ubicación (`url -> "Ubicación (Cliente)"`). La lista
   * guarda el enlace de Google Maps como valor, pero muestra esta etiqueta.
   */
  optionLabels?: Record<string, string>;
  /** Valor actual de la ubicación. */
  value: string;
  /** Indica si el valor actual es una entrada manual (no viene de la lista). */
  isCustom: boolean;
  /** Notifica el nuevo valor y si corresponde a una entrada personalizada. */
  onChange: (value: string, isCustom: boolean) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * Selector de ubicación para entrevistas PRESENCIALES.
 *
 * Comportamiento primario: seleccionar una de las ubicaciones de los clientes.
 * Además ofrece una opción "Otra ubicación" que habilita un campo de texto libre.
 * El valor personalizado se almacena en el mismo campo `ubicacion`.
 */
export const InterviewLocationField = ({
  options,
  optionLabels,
  value,
  isCustom,
  onChange,
  error,
  disabled,
}: Props) => {
  const selectOptions = useMemo(
    () => [
      ...options.map((loc) => ({
        value: loc,
        label: optionLabels?.[loc] ?? loc,
      })),
      { value: CUSTOM_LOCATION, label: "＋ Otra ubicación (escribir manualmente)" },
    ],
    [options, optionLabels],
  );

  if (isCustom) {
    return (
      <div className="flex flex-col gap-1">
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value, true)}
          placeholder="Escribe la ubicación (ej. Sede San Isidro)"
          className={`input w-full ${error ? "border-red-500" : ""}`}
        />
        {options.length > 0 && (
          <button
            type="button"
            onClick={() => onChange("", false)}
            className="text-xs text-[var(--color-primary)] hover:underline self-start"
          >
            Elegir de la lista de ubicaciones
          </button>
        )}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <SearchableSelect
        options={selectOptions}
        value={value}
        disabled={disabled}
        onChange={(v) => {
          if (v === CUSTOM_LOCATION) onChange("", true);
          else onChange(String(v), false);
        }}
        placeholder={
          options.length > 0
            ? "Selecciona una ubicación"
            : "Sin ubicaciones disponibles — usa \"Otra ubicación\""
        }
        className={error ? "border-red-500" : ""}
      />
      {options.length === 0 && (
        <span className="text-xs text-gray-400 flex items-center gap-1 dark:text-slate-500">
          <Pencil className="w-3 h-3" />
          Los clientes de los RQ no tienen ubicación; puedes escribir una.
        </span>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
