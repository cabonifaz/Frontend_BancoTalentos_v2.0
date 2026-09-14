import { Control, Controller, FieldError } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/core/components/ui/shadcn/input";
import { Label } from "@/core/components/ui/shadcn/label";

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
      <Label htmlFor={name} className="block mb-1 font-medium">
        {label}
      </Label>
      <div className="relative">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id={name}
              type={inputType}
              aria-invalid={!!error}
              onChange={(e) =>
                type === "number"
                  ? field.onChange(Number(e.target.value))
                  : field.onChange(e.target.value)
              }
              className="pr-10"
            />
          )}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            aria-label={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {passwordVisible ? (
              <Eye className="w-full h-full" aria-hidden="true" />
            ) : (
              <EyeOff className="w-full h-full" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
};
