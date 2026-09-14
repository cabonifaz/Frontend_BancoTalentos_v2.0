import { useId } from "react";
import { Control, Controller, FieldError } from "react-hook-form";
import { Checkbox } from "@/core/components/ui/shadcn/checkbox";
import { Label } from "@/core/components/ui/shadcn/label";

interface CheckboxFormProps {
    name: string;
    control: Control<any>;
    label: string;
    defaultChecked?: boolean;
    error?: FieldError;
}

/**
 * Casilla booleana ligada a react-hook-form, sobre el Checkbox de shadcn.
 * Para opciones excluyentes (Sí/No) usa RadioGroupForm: el antiguo modo
 * `group` de este componente era un radio disfrazado de casilla.
 */
const CheckboxForm = ({ name, control, label, defaultChecked, error }: CheckboxFormProps) => {
    const id = useId();

    return (
        <div className="flex items-center">
            <Controller
                name={name}
                control={control}
                defaultValue={defaultChecked}
                render={({ field }) => (
                    <>
                        <Checkbox
                            id={id}
                            checked={!!field.value}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                            onBlur={field.onBlur}
                        />
                        <Label htmlFor={id} className="input-label">
                            {label}
                        </Label>
                    </>
                )}
            />
            {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error.message}</p>}
        </div>
    );
};

export default CheckboxForm;
