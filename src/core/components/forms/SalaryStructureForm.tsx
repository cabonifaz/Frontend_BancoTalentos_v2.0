import { Control, Controller, FieldErrors, UseFormSetValue } from "react-hook-form";
import { EntryFormType } from "../../models/schemas/EntryFormSchema";

interface InputItem {
    label: string;
    name: string;
    type?: string;
}

interface Props {
    control: Control<any>;
    setValue: UseFormSetValue<any>;
    mainLabel: string;
    inputs: InputItem[];
    errors: FieldErrors;
}

const SalaryStructureForm = ({ control, setValue, mainLabel, inputs, errors }: Props) => {
    return (
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 mt-4">
            <div className="w-full md:flex-1 md:basis-3/12">
                <label className="text-lg font-semibold">{mainLabel}</label>
            </div>

            <div className="w-full md:flex-1 md:basis-9/12 relative">
                <div className="overflow-x-auto">
                    <table className="table-cell border-collapse border border-gray-300 rounded-lg w-full">
                        <thead>
                            <tr>
                                {inputs.map((input) => (
                                    <th
                                        key={`thead-${input.name}`}
                                        className="p-2 border border-gray-300 text-left">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`checkbox-${input.name}`}
                                                className="w-5 h-5 accent-blue-500"
                                                defaultChecked={input.name === "montoBase"}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    const inputElement = document.getElementById(input.name) as HTMLInputElement;
                                                    inputElement.disabled = !isChecked;
                                                    setValue(input.name as keyof EntryFormType, 0);
                                                }}
                                            />
                                            <label htmlFor={`checkbox-${input.name}`} className="text-xs font-semibold">
                                                {input.label}
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
                                        className="p-2 border border-gray-300">
                                        <Controller
                                            name={input.name}
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    disabled={input.name !== "montoBase"}
                                                    id={input.name}
                                                    {...field}
                                                    type={input.type ?? "text"}
                                                    onChange={(e) =>
                                                        input.type === "number"
                                                            ? field.onChange(Number(e.target.value))
                                                            : field.onChange(e.target.value)
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
                {errors.montoBase && typeof errors.montoBase.message === 'string' && (
                    <span className="text-red-500 text-xs absolute -bottom-4">{errors.montoBase.message}</span>
                )}
            </div>
        </div>
    );
};

export default SalaryStructureForm;