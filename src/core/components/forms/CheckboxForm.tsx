import { Control, Controller, FieldError } from "react-hook-form";

interface CheckboxFormProps {
    name: string;
    control: Control<any>;
    label: string;
    value?: string;
    defaultChecked?: boolean;
    error?: FieldError;
    group?: string; // Añadido para agrupar checkboxes
}

const CheckboxForm = ({ name, control, label, value, defaultChecked, error, group }: CheckboxFormProps) => {
    return (
        <div className="flex items-center">
            <Controller
                name={name}
                control={control}
                defaultValue={defaultChecked ? value : undefined}
                render={({ field }) => {
                    // Para checkboxes buttons (grupos)
                    if (group) {
                        return (
                            <>
                                <input
                                    type="checkbox"
                                    id={`${group}-${value}`}
                                    className="input-checkbox"
                                    value={value}
                                    checked={field.value === value}
                                    onChange={() => field.onChange(value)}
                                    onBlur={field.onBlur}
                                />
                                <label htmlFor={`${group}-${value}`} className="input-label">
                                    {label}
                                </label>
                            </>
                        );
                    }
                    // Para checkboxes normales
                    return (
                        <>
                            <input
                                type="checkbox"
                                id={`${name}-${value || label}`}
                                className="input-checkbox"
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                                onBlur={field.onBlur}
                            />
                            <label htmlFor={`${name}-${value || label}`} className="input-label">
                                {label}
                            </label>
                        </>
                    );
                }}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
        </div>
    );
};

export default CheckboxForm;