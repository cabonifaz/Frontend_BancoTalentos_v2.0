import { Control, Controller, FieldErrors } from "react-hook-form";
import { AddTalentType } from "@/core/models/schemas/AddTalentSchema";
import { AddPostulanteType } from "@/core/models";
import { Input } from "@/core/components/ui/shadcn/input";
import { AppSelect } from "@/core/components/ui/AppSelect";

interface SalaryExpecProps {
  coins: { idCoin: number; stringVal: string }[];
  control: Control<AddPostulanteType>;
  errors: FieldErrors<AddTalentType>;
}

/** "" del Select = sin valor, como la opción vacía del <select> anterior. */
const toIdOrUndef = (v: string) => (v === "" ? undefined : Number(v));

// Celdas de la tabla de montos: sin caja propia, solo el separador vertical.
const cellSelect =
  "h-auto rounded-none border-0 border-r bg-transparent p-2 text-sm dark:border-slate-700 dark:bg-transparent";
const cellInput =
  "h-auto rounded-none border-0 bg-transparent p-2 text-right text-sm dark:bg-transparent";

export const SalaryExpectSectionExter = ({
  coins,
  control,
  errors,
}: SalaryExpecProps) => {
  // Función simplificada para inputs type="number"
  const toNumberOrUndef = (val: string | number): number | undefined => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) || num < 0 ? undefined : Math.round(num * 100) / 100; // Redondea a 2 decimales
  };

  const coinOptions = coins.map((coin) => ({
    value: coin.idCoin,
    label: coin.stringVal,
  }));

  return (
    <div>
      <h3 className="text-[#3f3f46] text-lg my-5 font-semibold dark:text-slate-200">
        Expectativas salariales
      </h3>

      <div className="border rounded-lg divide-y dark:border-slate-700">
        {/* --- RxH --- */}
        <div>
          <div className="bg-gray-100 text-sm font-medium text-gray-700 p-2 text-center dark:bg-slate-700 dark:text-slate-200">
            Locación de Servicios (RxH)
          </div>
          <div className="grid grid-cols-3 bg-gray-50 text-xs text-gray-600 dark:bg-slate-800 dark:text-slate-300">
            <div className="p-2 border-r dark:border-slate-700">Moneda</div>
            <div className="p-2 border-r text-center dark:border-slate-700">Mínimo</div>
            <div className="p-2 text-center">Máximo</div>
          </div>
          <div className="grid grid-cols-3">
            {/* Moneda */}
            <Controller
              name="salaryExpectations.rxh.coin"
              control={control}
              render={({ field }) => (
                <AppSelect
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  aria-label="Moneda RxH"
                  value={field.value ?? ""}
                  onChange={(v) => field.onChange(toIdOrUndef(v))}
                  options={coinOptions}
                  placeholder="Elija una moneda"
                  className={cellSelect}
                />
              )}
            />

            {/* Min */}
            <Controller
              name="salaryExpectations.rxh.min"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  aria-label="Mínimo RxH"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(toNumberOrUndef(e.target.value))
                  }
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`${cellInput} border-r dark:border-slate-700`}
                />
              )}
            />

            {/* Max */}
            <Controller
              name="salaryExpectations.rxh.max"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  aria-label="Máximo RxH"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(toNumberOrUndef(e.target.value))
                  }
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={cellInput}
                />
              )}
            />
          </div>
          {errors.salaryExpectations?.rxh?.coin && (
            <span className="text-red-500 text-xs p-2 block">
              {errors.salaryExpectations.rxh.coin.message}
            </span>
          )}
          {errors.salaryExpectations?.rxh?.min && (
            <span className="text-red-500 text-xs p-2 block">
              {errors.salaryExpectations.rxh.min.message}
            </span>
          )}
          {errors.salaryExpectations?.rxh?.max && (
            <span className="text-red-500 text-xs p-2 block">
              {errors.salaryExpectations.rxh.max.message}
            </span>
          )}
        </div>

        {/* --- Planilla --- */}
        <div>
          <div className="bg-gray-100 text-sm font-medium text-gray-700 p-2 text-center dark:bg-slate-700 dark:text-slate-200">
            Régimen General (Planilla)
          </div>
          <div className="grid grid-cols-3 bg-gray-50 text-xs text-gray-600 dark:bg-slate-800 dark:text-slate-300">
            <div className="p-2 border-r dark:border-slate-700">Moneda</div>
            <div className="p-2 border-r text-center dark:border-slate-700">Mínimo</div>
            <div className="p-2 text-center">Máximo</div>
          </div>
          <div className="grid grid-cols-3">
            {/* Moneda */}
            <Controller
              name="salaryExpectations.planilla.coin"
              control={control}
              render={({ field }) => (
                <AppSelect
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  aria-label="Moneda planilla"
                  value={field.value ?? ""}
                  onChange={(v) => field.onChange(toIdOrUndef(v))}
                  options={coinOptions}
                  placeholder="Elija una moneda"
                  className={cellSelect}
                />
              )}
            />

            {/* Min */}
            <Controller
              name="salaryExpectations.planilla.min"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  aria-label="Mínimo planilla"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(toNumberOrUndef(e.target.value))
                  }
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`${cellInput} border-r dark:border-slate-700`}
                />
              )}
            />

            {/* Max */}
            <Controller
              name="salaryExpectations.planilla.max"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  aria-label="Máximo planilla"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(toNumberOrUndef(e.target.value))
                  }
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={cellInput}
                />
              )}
            />
          </div>
          {errors.salaryExpectations?.planilla?.coin && (
            <span className="text-red-500 text-xs p-2 block">
              {errors.salaryExpectations.planilla.coin.message}
            </span>
          )}
          {errors.salaryExpectations?.planilla?.min && (
            <span className="text-red-500 text-xs p-2 block">
              {errors.salaryExpectations.planilla.min.message}
            </span>
          )}
          {errors.salaryExpectations?.planilla?.max && (
            <span className="text-red-500 text-xs p-2 block">
              {errors.salaryExpectations.planilla.max.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
