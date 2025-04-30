import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

// F: El tipo del formulario (AddTalentType o AddPostulanteType)
// T: El tipo de los campos específicos (AddSoftSkill, etc.)
export interface DynamicSectionProps<F extends FieldValues, T> {
    register: UseFormRegister<F>;
    errors: FieldErrors<F>;
    fields: T[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    handleChange?: (index: number, field: keyof T, value: any) => void;
}