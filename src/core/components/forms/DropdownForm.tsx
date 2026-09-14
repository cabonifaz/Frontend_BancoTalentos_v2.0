import { useMemo } from "react";
import {
  Control,
  Controller,
  FieldError,
  UseFormClearErrors,
} from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/shadcn/select";
import { cn } from "@/core/lib/utils";

interface Props {
  name: string;
  control: Control<any>;
  label?: string;
  options: { label: string; value: number }[];
  error?: FieldError;
  clearErrors?: UseFormClearErrors<any>;
  word_wrap?: boolean;
  flex?: boolean;
  required: boolean;
  disabled?: boolean;
  clearErrorsFrom?: string[];
  defaultValue?: number;
  allowEmpty?: boolean; // Nueva prop para campos opcionales
  allowEmptyMessage?: string; // Mensaje para la opción vacía
  /** Clases extra del disparador (p. ej. el aspecto de campo bloqueado). */
  triggerClassName?: string;
}

// Radix Select no admite un item con value "": la opción vacía usa un centinela.
const EMPTY = "__empty__";

const DropdownForm = ({
  name,
  control,
  label,
  options,
  error,
  word_wrap = false,
  flex = false,
  disabled = false,
  required,
  clearErrors,
  clearErrorsFrom,
  defaultValue,
  allowEmpty = false,
  allowEmptyMessage,
  triggerClassName,
}: Props) => {
  const safeDefault = useMemo(() => {
    // Si allowEmpty es true, no forzar un valor por defecto
    if (allowEmpty) return undefined;

    if (!options || options.length === 0) return 0;
    const found = options.find((opt) => opt.value === defaultValue);
    return found ? found.value : options[0].value;
  }, [options, defaultValue, allowEmpty]);

  const emptyLabel = allowEmptyMessage || "Elige una opción";

  return (
    <>
      <div
        className={`${
          flex ? "flex-1" : "flex flex-1 gap-4 items-center"
        }`}
      >
        {label && (
          <label
            htmlFor={name}
            className={`text-nowrap ${
              word_wrap ? "w-[11rem]" : "min-w-[11rem]"
            }`}
          >
            {label}
            {required && <span className="text-red-400">*</span>}
          </label>
        )}
        <div className={`${label ? "flex-[2]" : "basis-80"} `}>
          <Controller
            name={name}
            control={control}
            render={({ field }) => {
              // Igual que el <select> anterior: sin valor, muestra safeDefault
              // (o la opción vacía si allowEmpty). Un valor que no está entre
              // las opciones muestra el placeholder, como hacía el nativo.
              const shown = field.value ?? (allowEmpty ? undefined : safeDefault);
              const isKnown = options.some((opt) => opt.value === shown);
              return (
                <Select
                  name={field.name}
                  value={isKnown ? String(shown) : ""}
                  onValueChange={(v) => {
                    // Radix emite "" cuando el valor deja de estar entre las
                    // opciones (p. ej. al recargarlas). No es una elección.
                    if (v === "") return;
                    field.onChange(v === EMPTY ? undefined : Number(v));
                    if (clearErrors) {
                      clearErrors(name);
                      clearErrorsFrom?.forEach((path) => {
                        clearErrors(path);
                      });
                    }
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger
                    id={name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    className={cn(
                      "w-full h-12 p-3 disabled:text-gray-400 dark:disabled:text-slate-500",
                      triggerClassName
                    )}
                  >
                    <SelectValue placeholder={emptyLabel} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY}>{emptyLabel}</SelectItem>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }}
          />
          {error && (
            <p className="text-red-400 bg-transparent text-xs mt-2">
              {error.message}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default DropdownForm;
