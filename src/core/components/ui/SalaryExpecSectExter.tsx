import { Control, Controller, FieldErrors } from "react-hook-form";
import { AddTalentType } from "../../models/schemas/AddTalentSchema";
import { AddPostulanteType } from "../../models";

interface SalaryExpecProps {
  coins: { idCoin: number; stringVal: string }[];
  control: Control<AddPostulanteType>;
  errors: FieldErrors<AddTalentType>;
}

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

  return (
    <div>
      <h3 className="text-[#3f3f46] text-lg my-5 font-semibold">
        Expectativas salariales
      </h3>

      <div className="border rounded-lg divide-y">
        {/* --- RxH --- */}
        <div>
          <div className="bg-gray-100 text-sm font-medium text-gray-700 p-2 text-center">
            Locación de Servicios (RxH)
          </div>
          <div className="grid grid-cols-3 bg-gray-50 text-xs text-gray-600">
            <div className="p-2 border-r">Moneda</div>
            <div className="p-2 border-r text-center">Mínimo</div>
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
                  className="p-2 border-r text-sm"
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
                  className="p-2 border-r text-sm text-right outline-none"
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
          <div className="bg-gray-100 text-sm font-medium text-gray-700 p-2 text-center">
            Régimen General (Planilla)
          </div>
          <div className="grid grid-cols-3 bg-gray-50 text-xs text-gray-600">
            <div className="p-2 border-r">Moneda</div>
            <div className="p-2 border-r text-center">Mínimo</div>
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
                  className="p-2 border-r text-sm"
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
                  className="p-2 border-r text-sm text-right outline-none"
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
