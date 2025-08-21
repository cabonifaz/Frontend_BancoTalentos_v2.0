import {
  FieldErrors,
  FieldValues,
  Control,
  UseFormSetValue,
} from "react-hook-form";

export interface DynamicSectionProps<F extends FieldValues> {
  control: Control<F>;
  errors: FieldErrors<F>;
  setValue?: UseFormSetValue<F>;
  shouldShowEmptyForm?: boolean;
  shouldAddElements?: boolean;
}
