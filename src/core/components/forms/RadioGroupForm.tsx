import { useId } from "react";
import { Control, Controller, FieldError } from "react-hook-form";
import { cn } from "@/core/lib/utils";
import { Label } from "@/core/components/ui/shadcn/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/core/components/ui/shadcn/radio-group";

interface Option {
  label: string;
  value: string;
}

interface Props {
  name: string;
  control: Control<any>;
  options: Option[];
  label?: string;
  labelClassName?: string;
  className?: string;
  defaultValue?: string;
  error?: FieldError;
  /**
   * "horizontal": etiqueta a la izquierda, como InputForm/DropdownForm, para
   * que en un mismo formulario todas las etiquetas vayan igual.
   */
  orientation?: "vertical" | "horizontal";
}

/**
 * Opciones excluyentes (Sí/No…) ligadas a react-hook-form, sobre el RadioGroup
 * de shadcn. Sustituye al modo `group` de CheckboxForm, que pintaba casillas
 * pero se comportaba como un radio: ahora se anuncia como radiogroup, con su
 * etiqueta, y se recorre con las flechas.
 */
const RadioGroupForm = ({
  name,
  control,
  options,
  label,
  labelClassName,
  className,
  defaultValue,
  error,
  orientation = "vertical",
}: Props) => {
  const labelId = useId();
  const horizontal = orientation === "horizontal";

  return (
    <div className={cn(horizontal && "flex flex-wrap items-center gap-4")}>
      {label && (
        <span
          id={labelId}
          className={cn(horizontal && "min-w-[11rem]", labelClassName)}
        >
          {label}
        </span>
      )}
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <RadioGroup
            aria-labelledby={label ? labelId : undefined}
            value={field.value ?? ""}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            className={cn("flex gap-8", className)}
          >
            {options.map((opt) => {
              const id = `${name}-${opt.value}`;
              return (
                <div key={opt.value} className="flex items-center">
                  <RadioGroupItem id={id} value={opt.value} />
                  <Label htmlFor={id} className="input-label">
                    {opt.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        )}
      />
      {error && (
        <p className={cn("mt-1 text-xs text-red-600 dark:text-red-400", horizontal && "basis-full")}>
          {error.message}
        </p>
      )}
    </div>
  );
};

export default RadioGroupForm;
