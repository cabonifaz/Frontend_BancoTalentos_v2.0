import { FieldErrors, UseFormRegister } from "react-hook-form";
import { AddTalentType } from "../schemas/AddTalentSchema";

export interface DynamicSectionProps<T> {
    register: UseFormRegister<AddTalentType>;
    errors: FieldErrors<AddTalentType>;
    fields: any[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    handleChange?: (index: number, field: keyof T, value: any) => void;
}