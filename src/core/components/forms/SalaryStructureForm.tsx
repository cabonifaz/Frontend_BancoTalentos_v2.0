import {
  Control,
  Controller,
  FieldErrors,
  UseFormSetValue,
} from "react-hook-form";
import { EntryFormType } from "../../models/schemas/EntryFormSchema";

interface InputItem {
  label: string;
  name: string;
  type?: string;
  regex?: RegExp;
  required?: boolean;
}

interface Props {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  mainLabel?: string;
  inputs: InputItem[];
  errors: FieldErrors;
}

const SalaryStructureForm = ({
  control,
  setValue,
  mainLabel,
  inputs,
  errors,
}: Props) => {
  // Función de manejo de cambios basada en InputForm
  const handleChange = (
    input: InputItem,
    value: string,
    onChange: (value: any) => void,
  ) => {
    // Caso especial: permitir borrado completo
    if (value === "") {
      onChange(null);
      return;
    }

    // Verificar si el valor tiene más de un punto
    const dotCount = (value.match(/\./g) || []).length;
    const hasMultipleDots = dotCount > 1;

    // Si pasa el regex (si existe) y no tiene múltiples puntos
    if ((!input.regex || input.regex.test(value)) && !hasMultipleDots) {
      // Solo convertir a número si es un valor completo (no termina en punto)
      if (input.type === "number" && !value.endsWith(".")) {
        const numValue = Number(value);
        onChange(isNaN(numValue) ? null : numValue);
      } else {
        onChange(value);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-start justify-between gap-4 mt-4">
      {mainLabel && (
        <div className="w-full md:flex-1 md:basis-3/12">
          <label className="text-lg font-semibold">{mainLabel}</label>
        </div>
      )}

      <div className="w-full md:flex-1 md:basis-9/12">
        <div className="overflow-x-auto">
          <table className="table-cell border-collapse border border-gray-300 rounded-lg w-full">
            <thead>
              <tr>
                {inputs.map((input) => (
                  <th
                    key={`thead-${input.name}`}
                    className="p-2 border border-gray-300 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`checkbox-${input.name}`}
                        className="w-5 h-5 accent-blue-500"
                        defaultChecked={input.name === "montoBase"}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          const inputElement = document.getElementById(
                            input.name,
                          ) as HTMLInputElement;
                          inputElement.disabled = !isChecked;
                          setValue(input.name as keyof EntryFormType, 0);
                        }}
                      />
                      <label
                        htmlFor={`checkbox-${input.name}`}
                        className="text-xs font-semibold"
                      >
                        {input.label}
                        {input.required && (
                          <span className="text-red-400">*</span>
                        )}
                      </label>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr>
                {inputs.map((input) => (
                  <td
                    key={`tbody-${input.name}`}
                    className="p-2 border border-gray-300"
                  >
                    <Controller
                      name={input.name}
                      control={control}
                      render={({ field }) => (
                        <input
                          disabled={input.name !== "montoBase"}
                          id={input.name}
                          type={
                            input.type === "number"
                              ? "text"
                              : (input.type ?? "text")
                          }
                          value={field.value ?? ""}
                          onChange={(e) =>
                            handleChange(input, e.target.value, field.onChange)
                          }
                          onBlur={field.onBlur}
                          onWheel={(e) => e.currentTarget.blur()}
                          inputMode={
                            input.type === "number" ? "decimal" : undefined
                          }
                          className="w-full outline-none px-2 ring-1 ring-slate-400 rounded-lg h-10"
                        />
                      )}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mensajes de error debajo de la tabla */}
        <div className="mt-2 space-y-1">
          {inputs.map(
            (input) =>
              errors[input.name] &&
              typeof errors[input.name]?.message === "string" && (
                <p key={`error-${input.name}`} className="text-red-500 text-xs">
                  {errors[input.name]?.message as string}
                </p>
              ),
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryStructureForm;
