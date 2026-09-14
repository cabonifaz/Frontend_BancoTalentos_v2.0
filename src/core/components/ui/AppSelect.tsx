import { forwardRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/shadcn/select";

export interface AppSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface AppSelectProps {
  value: string | number | null | undefined;
  /** Recibe el valor como string, igual que `e.target.value` de un <select>. "" = sin valor. */
  onChange: (value: string) => void;
  options: AppSelectOption[];
  /** Texto cuando no hay valor. */
  placeholder?: string;
  /**
   * Opción elegible que vuelve a "sin valor", como un `<option value="">`.
   * Por defecto usa el texto del placeholder; `false` la omite.
   */
  emptyOption?: string | false;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  id?: string;
  name?: string;
  onBlur?: () => void;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
}

// Radix Select no admite items con value "": la opción vacía usa un centinela.
const EMPTY = "__empty__";

/**
 * Sustituto de un <select> nativo sobre el Select de shadcn (Radix): navegable
 * con teclado, con búsqueda por tecleo y con el aspecto de .input. Mantiene la
 * semántica de strings de `e.target.value`, así que migrar un <select> es
 * cambiar la etiqueta y el onChange (`(e) => f(e.target.value)` → `f`).
 * Diferencia con el nativo: un valor que no está entre las opciones muestra el
 * placeholder en lugar de la primera opción.
 */
export const AppSelect = forwardRef<HTMLButtonElement, AppSelectProps>(
  (
    {
      value,
      onChange,
      options,
      placeholder = "Seleccione…",
      emptyOption,
      disabled,
      className,
      contentClassName,
      id,
      name,
      onBlur,
      ...aria
    },
    ref
  ) => {
    const current = value === null || value === undefined ? "" : String(value);
    const isKnown =
      current !== "" && options.some((o) => String(o.value) === current);
    const emptyLabel = emptyOption === false ? null : emptyOption ?? placeholder;

    return (
      <Select
        name={name}
        value={isKnown ? current : ""}
        onValueChange={(v) => {
          // Radix emite "" cuando el valor deja de estar entre las opciones
          // (p. ej. al recargarlas). No es una elección del usuario.
          if (v === "") return;
          onChange(v === EMPTY ? "" : v);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          ref={ref}
          id={id}
          onBlur={onBlur}
          className={className}
          {...aria}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className={contentClassName}>
          {emptyLabel !== null && (
            <SelectItem value={EMPTY}>{emptyLabel}</SelectItem>
          )}
          {options.map((o) => (
            <SelectItem
              key={String(o.value)}
              value={String(o.value)}
              disabled={o.disabled}
            >
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);
AppSelect.displayName = "AppSelect";
