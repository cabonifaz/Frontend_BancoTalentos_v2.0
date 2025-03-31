import { useState } from "react";
import { FieldError, UseFormRegister } from "react-hook-form";
import { AddTalentType } from "../../models/schemas/AddTalentSchema";

interface Props {
    register: UseFormRegister<AddTalentType>;
    name: keyof AddTalentType;
    error?: string;
}

export const NumberInput = ({ register, name, error }: Props) => {
    const [value, setValue] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;

        // Remove invalid characters (anything that is not a digit or dot)
        inputValue = inputValue.replace(/[^0-9.]/g, "");

        // Allow only one dot
        const parts = inputValue.split(".");
        if (parts.length > 2) {
            inputValue = parts[0] + "." + parts.slice(1).join("");
        }

        // Restrict to two decimal places
        if (parts.length === 2) {
            parts[1] = parts[1].slice(0, 2);
            inputValue = parts.join(".");
        }

        setValue(inputValue);
    };

    return (
        <>
            <input
                type="text"
                {...register(name, { valueAsNumber: true })}
                value={value}
                onChange={handleChange}
                className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
        </>
    );
};