import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Input } from "@/core/components/ui/shadcn/input";
import { cn } from "@/core/lib/utils";

interface NumberInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  error?: string;
  isDisabled?: boolean;
  className?: string;
}

export const NumberInput = <T extends FieldValues>({
  control,
  name,
  error,
  isDisabled = false,
  className,
}: NumberInputProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, ...fieldProps } }) => {
        // mantener el valor como string para la UI
        const stringValue =
          typeof value === "number" && !Number.isNaN(value)
            ? String(value)
            : (value as string) ?? "";

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          let inputValue = e.target.value.replace(/[^0-9.]/g, "");

          // limitar a un solo "."
          const parts = inputValue.split(".");
          if (parts.length > 2) {
            inputValue = parts[0] + "." + parts.slice(1).join("");
          }

          // limitar a 2 decimales
          if (parts.length === 2) {
            parts[1] = parts[1].slice(0, 2);
            inputValue = parts.join(".");
          }

          // mandar al form:
          // - string si termina en "." o está vacío (UI lo mantiene)
          // - number si es válido
          if (inputValue === "" || inputValue.endsWith(".")) {
            onChange(inputValue); // string temporal
          } else {
            const num = Number(inputValue);
            onChange(Number.isNaN(num) ? undefined : num);
          }
        };

        return (
          <>
            <Input
              type="text"
              {...fieldProps}
              value={stringValue}
              onChange={handleChange}
              inputMode="decimal" // teclado numérico en móviles
              // w-auto: el <input> anterior no ocupaba todo el ancho.
              className={cn(
                "h-12 w-auto border-gray-300 dark:border-slate-600",
                className
              )}
              aria-invalid={!!error}
              disabled={isDisabled}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </>
        );
      }}
    />
  );
};
