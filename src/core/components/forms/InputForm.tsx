import { useEffect, useId, useState } from "react";
import { Control, Controller, FieldError } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/core/components/ui/shadcn/input";
import { Label } from "@/core/components/ui/shadcn/label";
import { DatePicker } from "@/core/components/ui/DatePicker";

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
    // La etiqueta no estaba asociada al campo: un lector de pantalla leía el
    // input sin nombre y hacer clic en la etiqueta no lo enfocaba.
    const inputId = useId();
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
        // items-center: la etiqueta queda centrada con el campo, igual que en
        // DropdownForm (antes quedaba arriba y desalineada con sus vecinas).
        <div className={`flex ${orientation === "vertical" ? "flex-col" : "flex-row items-center gap-4"}`}>
            <Label
                htmlFor={inputId}
                className={`${word_wrap ? "w-[11rem]" : isTable ? "" : "min-w-[11rem]"}`}
            >
                {label}{required && <span className="text-red-400">*</span>}
            </Label>
            <div className="flex-[2]">
                <Controller
                    name={name}
                    control={control}
                    render={({ field }) => type === 'date' ? (
                        // Fecha: DatePicker de shadcn. Mismo contrato que el
                        // <input type="date">: "yyyy-MM-dd", y null al vaciarla.
                        <DatePicker
                            ref={field.ref}
                            id={inputId}
                            value={field.value ?? ''}
                            onChange={(value) => field.onChange(value === '' ? null : value)}
                            onBlur={field.onBlur}
                            disabled={disabled}
                            aria-invalid={!!error}
                        />
                    ) : (
                        <div className="relative">
                            <Input
                                id={inputId}
                                type={type === 'number' ? 'text' : type}
                                value={field.value ?? ''}
                                onChange={(e) => handleChange(e.target.value, field.onChange)}
                                disabled={disabled}
                                onWheel={(e) => e.currentTarget.blur()}
                                aria-invalid={!!error}
                                // 48 px, el mismo alto que DropdownForm y DatePicker.
                                className={`h-12 ${type === 'number' ? "w-auto max-md:w-[50px]" : "w-full"}`}
                                inputMode={type === 'number' ? 'decimal' : undefined}
                            />
                            {isPasswordField && (
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    aria-label={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-400"
                                >
                                    {passwordVisible ? (
                                        <Eye className="w-5 h-5" aria-hidden="true" />
                                    ) : (
                                        <EyeOff className="w-5 h-5" aria-hidden="true" />
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
