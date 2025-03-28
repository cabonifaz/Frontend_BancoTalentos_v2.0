import { Control, Controller, FieldError } from "react-hook-form";

interface Props {
    name: string;
    control: Control<any>;
    label?: string;
    options: { label: string; value: number }[];
    error?: FieldError;
    word_wrap?: boolean;
    flex?: boolean;
}

const DropdownForm = ({ name, control, label, options, error, word_wrap = false, flex = false }: Props) => {
    return (
        <>
            <div className={`${flex ? "flex-1" : "flex flex-1 gap-2"}`}>
                {label && <label htmlFor={name} className={`${word_wrap ? "w-[9rem]" : "min-w-[9rem]"}`}>{label}</label>}
                <div className={`${label ? "flex-[2]" : "basis-80"} `}>
                    <Controller
                        name={name}
                        control={control}
                        render={({ field }) => (
                            <select
                                id={name}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="input w-full h-12"
                            >
                                <option value={0}>Elige una opción</option>
                                {options.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        )}
                    />
                    {error && <p className="text-red-400 bg-transparent text-xs mt-2">{error.message}</p>}
                </div>
            </div>
        </>
    );
};

export default DropdownForm;
