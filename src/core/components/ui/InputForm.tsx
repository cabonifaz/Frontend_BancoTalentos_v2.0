import { Control, Controller, FieldError } from "react-hook-form";
import { useState } from "react";

interface Props {
  name: string;
  control: Control<any>;
  label: string;
  type?: string;
  error?: FieldError;
}

export const InputForm = ({
  name,
  control,
  label,
  type = "text",
  error,
}: Props) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const isPasswordType = type === "password";
  const inputType = isPasswordType
    ? passwordVisible
      ? "text"
      : "password"
    : type;

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block mb-1 font-medium">
        {label}
      </label>
      <div className="relative">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id={name}
              type={inputType}
              onChange={(e) =>
                type === "number"
                  ? field.onChange(Number(e.target.value))
                  : field.onChange(e.target.value)
              }
              className="input w-full pr-10"
            />
          )}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-500 hover:text-gray-700"
          >
            {passwordVisible ? (
              <img
                src="/assets/ic_show_pass.svg"
                alt="Mostrar contraseña"
                className="w-full h-full"
              />
            ) : (
              <img
                src="/assets/ic_hide_pass.svg"
                alt="Ocultar contraseña"
                className="w-full h-full"
              />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
};
