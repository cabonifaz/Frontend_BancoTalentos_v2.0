import {
  FieldErrors,
  FieldValues,
  Control,
  UseFormSetValue,
} from "react-hook-form";

export interface DynamicSectionProps<F extends FieldValues> {
  control: Control<F>;
  errors: FieldErrors<F>;
  setValue?: UseFormSetValue<F>;
  shouldShowEmptyForm?: boolean;
  shouldAddElements?: boolean;
  /**
   * Presentación de cada elemento:
   * - "plain" (por defecto): separador horizontal con la "X" centrada.
   * - "card": cada elemento dentro de su propia tarjeta con la "X" en la esquina
   *   superior derecha (usado en el modal "Actualizar con CV").
   */
  itemVariant?: "plain" | "card";
}
