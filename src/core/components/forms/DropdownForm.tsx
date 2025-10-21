import { all } from "axios";
import { useMemo } from "react";
import {
  Control,
  Controller,
  FieldError,
  UseFormClearErrors,
} from "react-hook-form";

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
}

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
}: Props) => {
  const safeDefault = useMemo(() => {
    // Si allowEmpty es true, no forzar un valor por defecto
    if (allowEmpty) return undefined;

    if (!options || options.length === 0) return 0;
    const found = options.find((opt) => opt.value === defaultValue);
    return found ? found.value : options[0].value;
  }, [options, defaultValue, allowEmpty]);

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
            render={({ field }) => (
              <select
                id={name}
                {...field}
                value={field.value ?? (allowEmpty ? "" : safeDefault)}
                onChange={(e) => {
                  const value =
                    e.target.value === ""
                      ? undefined
                      : Number(e.target.value);
                  field.onChange(value);
                  if (clearErrors) {
                    clearErrors(name);
                    clearErrorsFrom?.forEach((path) => {
                      clearErrors(path);
                    });
                  }
                }}
                disabled={disabled}
                className="input w-full h-12 disabled:text-gray-400"
              >
                <option disabled value="">
                  {allowEmptyMessage || "Elige una opción"}
                </option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
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
