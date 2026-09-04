import { Control, Controller, FieldErrors } from "react-hook-form";
import { AddTalentType } from "../../models/schemas/AddTalentSchema";

interface SalaryExpecProps {
  coins: { idCoin: number; stringVal: string }[];
  /** Maestro 3: cómo se le factura al talento. `num1` es lo que se guarda. */
  modalidades: { idModalidad: number; stringVal: string }[];
  control: Control<AddTalentType>;
  errors: FieldErrors<AddTalentType>;
}

export const SalaryExpectSection = ({
  coins,
  modalidades,
  control,
  errors,
}: SalaryExpecProps) => {
  // Función simplificada para inputs type="number"
  const toNumberOrUndef = (val: string | number): number | undefined => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) || num < 0 ? undefined : Math.round(num * 100) / 100; // Redondea a 2 decimales
  };

  return (
    <div>
      <h3 className="text-[#3f3f46] text-lg my-5 font-semibold dark:text-slate-200">
        Expectativas salariales
      </h3>

      {/* Va antes de los importes porque los condiciona: es lo que decide si a
          lo que pide el talento hay que sumarle cargas patronales. */}
      <div className="mb-4">
        <label
          htmlFor="idModalidadFacturacion"
          className="text-[#3f3f46] text-sm block mb-1 dark:text-slate-200"
        >
          Modalidad de facturación<span className="text-red-500">*</span>
        </label>
        <Controller
          name="idModalidadFacturacion"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              id="idModalidadFacturacion"
              value={field.value ?? 0}
              onChange={(e) => field.onChange(Number(e.target.value))}
              className="text-[#3f3f46] p-3 w-full border boder-gray-300 rounded-lg focus:outline-none cursor-pointer dark:border-slate-700 dark:text-slate-200"
            >
              <option value={0}>Seleccione una modalidad</option>
              {modalidades.map((modalidad) => (
                <option
                  key={modalidad.idModalidad}
                  value={modalidad.idModalidad}
                >
                  {modalidad.stringVal}
                </option>
              ))}
            </select>
          )}
        />
        {errors.idModalidadFacturacion && (
          <p className="text-red-400 text-sm">
            {errors.idModalidadFacturacion.message}
          </p>
        )}
      </div>

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
                <select
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                  className="p-2 border-r text-sm dark:border-slate-700"
                >
                  <option value="">Elija una moneda</option>
                  {coins.map((coin) => (
                    <option key={coin.idCoin} value={coin.idCoin}>
                      {coin.stringVal}
                    </option>
                  ))}
                </select>
              )}
            />

            {/* Min */}
            <Controller
              name="salaryExpectations.rxh.min"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(toNumberOrUndef(e.target.value))
                  }
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="p-2 border-r text-sm text-right outline-none dark:border-slate-700"
                />
              )}
            />

            {/* Max */}
            <Controller
              name="salaryExpectations.rxh.max"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(toNumberOrUndef(e.target.value))
                  }
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="p-2 text-sm text-right outline-none"
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
                <select
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                  className="p-2 border-r text-sm dark:border-slate-700"
                >
                  <option value="">Elija una moneda</option>
                  {coins.map((coin) => (
                    <option key={coin.idCoin} value={coin.idCoin}>
                      {coin.stringVal}
                    </option>
                  ))}
                </select>
              )}
            />

            {/* Min */}
            <Controller
              name="salaryExpectations.planilla.min"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(toNumberOrUndef(e.target.value))
                  }
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="p-2 border-r text-sm text-right outline-none dark:border-slate-700"
                />
              )}
            />

            {/* Max */}
            <Controller
              name="salaryExpectations.planilla.max"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(toNumberOrUndef(e.target.value))
                  }
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="p-2 text-sm text-right outline-none"
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
