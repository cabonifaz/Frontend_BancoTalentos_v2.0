import React from "react";
import { Control, Controller, FieldError } from "react-hook-form";

interface Props {
    name: string;
    control: Control<any>;
    label: string;
    type?: string;
    error?: FieldError;
}

export const InputForm = ({ name, control, label, type = "text", error }: Props) => {
    return (
        <div className="mb-4">
            <label htmlFor={name} className="block mb-1 font-medium">
                {label}
            </label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <input
                        {...field}
                        id={name}
                        type={type}
                        onChange={(e) =>
                            type === "number" ? field.onChange(Number(e.target.value)) : field.onChange(e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded focus:outline-none ${error ? "border-red-500" : "border-gray-300"}`}
                    />
                )}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
        </div>
    );
};