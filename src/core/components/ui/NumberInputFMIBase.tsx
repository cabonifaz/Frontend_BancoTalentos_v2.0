import { useState, useEffect } from "react";
import {
  UseFormRegister,
  Path,
  Control,
  useController,
  PathValue,
} from "react-hook-form";

type NumberType = "int" | "float";

interface NumberInputProps<T extends Record<string, any>> {
  register: UseFormRegister<T>;
  key?: string | number;
  name: Path<T>;
  control: Control<T>;
  type?: NumberType;
  className?: string;
  disabled?: boolean;
  defaultValue?: number;
  onChange?: (value: string) => void;
  decimalPlaces?: number;
}

export const NumberInputFMIBase = <T extends Record<string, any>>({
  key,
  name,
  control,
  type = "int",
  className = "h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]",
  disabled = false,
  defaultValue = 0,
  onChange,
  decimalPlaces = 2,
}: NumberInputProps<T>) => {
  const { field } = useController({
    name,
    control,
    defaultValue: defaultValue as unknown as PathValue<T, Path<T>>,
  });

  const [inputValue, setInputValue] = useState(() => {
    const initialValue = field.value;

    if (
      initialValue === undefined ||
      initialValue === null ||
      initialValue === ""
    ) {
      return String(defaultValue);
    }

    return String(initialValue);
  });

  useEffect(() => {
    if (field.value !== undefined && field.value !== null) {
      const newValue = String(field.value);

      if (newValue !== inputValue) {
        setInputValue(newValue);
      }
    }
  }, [field.value, inputValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    if (type === "int") {
      newValue = newValue.replace(/\D/g, "");
    } else {
      newValue = newValue.replace(/[^0-9.]/g, "");

      const parts = newValue.split(".");
      if (parts.length > 2) {
        // Elimina puntos extra
        newValue = parts[0] + "." + parts.slice(1).join("");
      } else if (parts.length === 2) {
        const [integerPart, decimalPart] = parts;
        const trimmedDecimal = decimalPart.slice(0, decimalPlaces);
        newValue = integerPart + "." + trimmedDecimal;
      }
    }

    setInputValue(newValue);
    field.onChange(newValue as unknown as PathValue<T, Path<T>>);

    if (onChange) {
      onChange(newValue);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (value === "") {
      value = "0";
      setInputValue(value);
      field.onChange(0 as unknown as PathValue<T, Path<T>>);
    }

    field.onBlur();
  };

  return (
    <input
      key={key}
      type="text"
      ref={field.ref}
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      className={className}
    />
  );
};
