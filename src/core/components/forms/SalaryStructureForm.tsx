import { useEffect, useState } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormSetValue,
} from "react-hook-form";
import { EntryFormType } from "@/core/models/schemas/EntryFormSchema";
import { Checkbox } from "@/core/components/ui/shadcn/checkbox";
import { Input } from "@/core/components/ui/shadcn/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/shadcn/table";

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
  enabledFields: string[];
}

const isEnabledMap = (inputs: InputItem[], enabledFields: string[]) =>
  Object.fromEntries(
    inputs.map((inp) => [inp.name, enabledFields.includes(inp.name)]),
  ) as Record<string, boolean>;

const SalaryStructureForm = ({
  control,
  setValue,
  mainLabel,
  inputs,
  errors,
  enabledFields,
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

  /**
   * Casilla de cada concepto: marcada = el importe se usa. Antes se leía y
   * escribía en el DOM (getElementById + .checked/.disabled); el Checkbox de
   * Radix no es un <input>, así que ahora es estado. Se reinicia cuando cambian
   * los conceptos habilitados (claves de texto: ModalIngreso pasa arrays nuevos
   * en cada render).
   */
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    isEnabledMap(inputs, enabledFields),
  );
  const enabledKey = enabledFields.join("|");
  const inputsKey = inputs.map((inp) => inp.name).join("|");

  useEffect(() => {
    setChecked(isEnabledMap(inputs, enabledFields));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledKey, inputsKey]);

  // Los conceptos no habilitados valen 0 (mismas dependencias que antes).
  useEffect(() => {
    inputs.forEach((inp) => {
      if (!enabledFields.includes(inp.name)) {
        setValue(inp.name as keyof EntryFormType, 0);
      }
    });
  }, [enabledFields, inputs, setValue]);

  return (
    <div className="flex flex-col md:flex-row items-start justify-between gap-4 mt-4">
      {mainLabel && (
        <div className="w-full md:flex-1 md:basis-3/12">
          <label className="text-lg font-semibold">{mainLabel}</label>
        </div>
      )}

      <div className="w-full md:flex-1 md:basis-9/12">
        <div className="overflow-x-auto">
          <Table className="table-cell border-collapse border border-gray-300 rounded-lg w-full dark:border-slate-600">
            <TableHeader>
              <TableRow>
                {inputs.map((input) => {
                  const enabled = enabledFields.includes(input.name);
                  return (
                    <TableHead
                      key={`thead-${input.name}`}
                      className="p-2 border border-gray-300 text-left dark:border-slate-600"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`checkbox-${input.name}`}
                          className="data-[state=checked]:border-blue-400 data-[state=checked]:bg-blue-400"
                          checked={!!checked[input.name]}
                          disabled={!enabled}
                          onCheckedChange={(value) => {
                            setChecked((prev) => ({
                              ...prev,
                              [input.name]: value === true,
                            }));
                            setValue(input.name as keyof EntryFormType, 0);
                          }}
                        />
                        <label
                          htmlFor={`checkbox-${input.name}`}
                          className={`text-xs font-semibold ${!enabled ? "text-gray-400 dark:text-slate-500" : "cursor-pointer"}`}
                        >
                          {input.label}
                          {input.required && (
                            <span className="text-red-400">*</span>
                          )}
                        </label>
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow>
                {inputs.map((input) => (
                  <TableCell
                    key={`tbody-${input.name}`}
                    className="p-2 border border-gray-300 dark:border-slate-600"
                  >
                    <Controller
                      name={input.name}
                      control={control}
                      render={({ field }) => (
                        <Input
                          ref={field.ref}
                          disabled={
                            !enabledFields.includes(input.name) ||
                            !checked[input.name]
                          }
                          id={input.name}
                          aria-label={input.label}
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
                          className="h-10 border-0 px-2 py-0 ring-1 ring-slate-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-100 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
                        />
                      )}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
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
