import { Control, Controller, FieldError } from "react-hook-form";

interface Props {
    name: string;
    control: Control<any>
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
}

const InputForm = ({ name, control, label, type, isWide, orientation, passwordVisible, togglePasswordVisibility, isPasswordField, error, disabled, word_wrap = false, isTable = false }: Props) => {
    return (
        <>
            <div className={`flex ${orientation === "vertical" ? "flex-col" : "flex-row"}`}>
            <label 
                htmlFor={name} 
                className={`${word_wrap ? "w-[9rem]" : isTable ? "" : "min-w-[9rem]"}`}
                >
                {label}
            </label>
                <div className="flex-[2]">
                    <Controller
                        name={name}
                        control={control}
                        render={({ field }) =>
                            <div className="relative">
                                <input
                                    id={name}
                                    type={type ? type : "text"}
                                    {...field}
                                    onChange={(e) => type === 'number' ? field.onChange(Number(e.target.value)) : field.onChange(e.target.value)}
                                    disabled={disabled}
                                    className={`${type === 'number' ? "max-md:w-[50px]": "w-full"} outline-none px-2 ring-1 ring-slate-400 rounded-lg h-10 ${error ? " ring-red-400" : ""}`} />
                                {isPasswordField &&
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
                                }
                            </div>
                        }
                    />

                    {error && <p className="text-red-400 bg-transparent text-xs">{error.message}</p>}
                </div>
            </div>
        </>
    );
}

export default InputForm;