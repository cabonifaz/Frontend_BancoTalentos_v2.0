import { Controller, Control, FieldValues, Path } from "react-hook-form";

interface NumberInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  error?: string;
}

export const NumberInput = <T extends FieldValues>({
  control,
  name,
  error,
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
            : ((value as string) ?? "");

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
            <input
              type="text"
              {...fieldProps}
              value={stringValue}
              onChange={handleChange}
              inputMode="decimal" // teclado numérico en móviles
              className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </>
        );
      }}
    />
  );
};
