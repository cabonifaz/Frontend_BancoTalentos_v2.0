import { useEffect, useState } from "react";
import { Control, Controller, FieldError } from "react-hook-form";

interface Props {
    name: string;
    control: Control<any>;
    label: string;
    type?: string;
    isPasswordField?: boolean;
    passwordVisible?: boolean;
    togglePasswordVisibility?: () => void;
    isWide?: boolean;
    orientation?: "horizontal" | "vertical";
    error?: FieldError;
    disabled?: boolean;
    word_wrap?: boolean;
    isTable?: boolean;
    required: boolean;
    regex?: RegExp;
}

const InputForm = ({
    regex,
    name,
    control,
    label,
    type,
    required,
    orientation,
    passwordVisible,
    togglePasswordVisibility,
    isPasswordField,
    error,
    disabled,
    word_wrap = false,
    isTable = false
}: Props) => {
    const [lastValidValue, setLastValidValue] = useState<string>('');

    useEffect(() => {
        const currentValue = control._formValues[name];
        if (currentValue !== undefined) {
            setLastValidValue(currentValue?.toString() || '');
        }
    }, [control._formValues, name]);

    const handleChange = (value: string, onChange: (value: any) => void) => {
        // Caso especial: permitir borrado completo
        if (value === '') {
            setLastValidValue('');
            onChange(null);
            return;
        }

        // Verificar si el valor tiene más de un punto
        const dotCount = (value.match(/\./g) || []).length;
        const hasMultipleDots = dotCount > 1;

        // Si pasa el regex y no tiene múltiples puntos
        if ((!regex || regex.test(value)) && !hasMultipleDots) {
            setLastValidValue(value);

            // Solo convertir a número si es un valor completo (no termina en punto)
            if (type === 'number' && !value.endsWith('.')) {
                const numValue = Number(value);
                onChange(isNaN(numValue) ? null : numValue);
            } else {
                onChange(value);
            }
        } else {
            // Revertir al último valor válido
            if (lastValidValue === '') {
                onChange(null);
            } else if (type === 'number') {
                const numValue = Number(lastValidValue);
                onChange(isNaN(numValue) ? null : numValue);
            } else {
                onChange(lastValidValue);
            }
        }
    };

    return (
        <div className={`flex ${orientation === "vertical" ? "flex-col" : "flex-row gap-4"}`}>
            <label className={`${word_wrap ? "w-[11rem]" : isTable ? "" : "min-w-[11rem]"}`}>
                {label}{required && <span className="text-red-400">*</span>}
            </label>
            <div className="flex-[2]">
                <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                        <div className="relative">
                            <input
                                type={type === 'number' ? 'text' : type}
                                value={field.value ?? ''}
                                onChange={(e) => handleChange(e.target.value, field.onChange)}
                                disabled={disabled}
                                onWheel={(e) => e.currentTarget.blur()}
                                className={`${type === 'number' ? "max-md:w-[50px]" : "w-full"} input`}
                                inputMode={type === 'number' ? 'decimal' : undefined}
                            />
                            {isPasswordField && (
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                                >
                                    {passwordVisible ? (
                                        <img src="/assets/see_pass.svg" alt="show pass" />
                                    ) : (
                                        <img src="/assets/not_see_pass.svg" alt="hide pass" />
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                />
                {error && <p className="text-red-400 bg-transparent text-xs mt-2">{error.message}</p>}
            </div>
        </div>
    );
};

export default InputForm;