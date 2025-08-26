import {
  Control,
  Controller,
  FieldError,
  UseFormClearErrors,
} from "react-hook-form";

interface Props {
  name: string;
  control: Control<any>;
  label?: string;
  options: { label: string; value: number }[];
  error?: FieldError;
  clearErrors?: UseFormClearErrors<any>;
  word_wrap?: boolean;
  flex?: boolean;
  required: boolean;
  disabled?: boolean;
}

const DropdownForm = ({
  name,
  control,
  label,
  options,
  error,
  word_wrap = false,
  flex = false,
  disabled = false,
  required,
  clearErrors,
}: Props) => {
  return (
    <>
      <div className={`${flex ? "flex-1" : "flex flex-1 gap-4 items-center"}`}>
        {label && (
          <label
            htmlFor={name}
            className={`${word_wrap ? "w-[11rem]" : "min-w-[11rem]"}`}
          >
            {label}
            {required && <span className="text-red-400">*</span>}
          </label>
        )}
        <div className={`${label ? "flex-[2]" : "basis-80"} `}>
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <select
                id={name}
                {...field}
                onChange={(e) => {
                  field.onChange(Number(e.target.value));
                  if (clearErrors) {
                    clearErrors(name);
                  }
                }}
                disabled={disabled}
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
          {error && (
            <p className="text-red-400 bg-transparent text-xs mt-2">
              {error.message}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default DropdownForm;
