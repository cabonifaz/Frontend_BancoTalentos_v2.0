import { Control, Controller, FieldErrors } from "react-hook-form";
import { AddTalentType } from "../../models/schemas/AddTalentSchema";

interface SalaryExpecProps {
  coins: { idCoin: number; stringVal: string }[];
  control: Control<AddTalentType>;
  errors: FieldErrors<AddTalentType>;
}

export const SalaryExpectSection = ({
  coins,
  control,
  errors,
}: SalaryExpecProps) => {
  return (
    <div>
      <h3 className="text-[#3f3f46] text-lg my-5 font-semibold">
        Expectativas salariales
      </h3>

      <div className="border rounded-lg divide-y">
        {/* --- Bloque Rxh --- */}
        <div>
          <div className="bg-gray-100 text-sm font-medium text-gray-700 p-2 text-center">
            Locación de Servicios (Rxh)
          </div>
          <div className="grid grid-cols-3 bg-gray-50 text-xs text-gray-600">
            <div className="p-2 border-r">Moneda</div>
            <div className="p-2 border-r text-center">Mínimo</div>
            <div className="p-2 text-center">Máximo</div>
          </div>
          <div className="grid grid-cols-3">
            {/* Moneda RxH */}
            <div className="p-2 border-r">
              <Controller
                name="salaryExpectations.rxh.coin"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full border rounded p-1 text-sm cursor-pointer"
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
            </div>

            {/* Min RxH */}
            <Controller
              name="salaryExpectations.rxh.min"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  {...control.register("salaryExpectations.rxh.min", {
                    valueAsNumber: true,
                  })}
                  type="number"
                  placeholder="0"
                  className="p-1 text-sm text-right border-r outline-none"
                />
              )}
            />

            {/* Max RxH */}
            <Controller
              name="salaryExpectations.rxh.max"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  {...control.register("salaryExpectations.rxh.max", {
                    valueAsNumber: true,
                  })}
                  type="number"
                  placeholder="0"
                  className="p-1 text-sm text-right outline-none"
                />
              )}
            />
          </div>
          {errors.salaryExpectations?.rxh?.coin && (
            <span className="text-red-500 text-xs me-2">
              {errors.salaryExpectations.rxh.coin.message}
            </span>
          )}
          {errors.salaryExpectations?.rxh?.max && (
            <span className="text-red-500 text-xs me-2">
              {errors.salaryExpectations.rxh.max.message}
            </span>
          )}
          {errors.salaryExpectations?.rxh?.min && (
            <span className="text-red-500 text-xs">
              {errors.salaryExpectations.rxh.min.message}
            </span>
          )}
        </div>

        {/* --- Bloque Planilla --- */}
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
            {/* Moneda Planilla */}
            <div className="p-2 border-r">
              <Controller
                name="salaryExpectations.planilla.coin"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full border rounded p-1 text-sm cursor-pointer"
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
            </div>

            {/* Min Planilla */}
            <Controller
              name="salaryExpectations.planilla.min"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  {...control.register("salaryExpectations.planilla.min", {
                    valueAsNumber: true,
                  })}
                  type="number"
                  placeholder="0"
                  className="p-1 text-sm text-right border-r outline-none"
                />
              )}
            />

            {/* Max Planilla */}
            <Controller
              name="salaryExpectations.planilla.max"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  {...control.register("salaryExpectations.planilla.max", {
                    valueAsNumber: true,
                  })}
                  type="number"
                  placeholder="0"
                  className="p-1 text-sm text-right outline-none"
                />
              )}
            />
          </div>
          {errors.salaryExpectations?.planilla?.coin && (
            <span className="text-red-500 text-xs me-2">
              {errors.salaryExpectations.planilla.coin.message}
            </span>
          )}
          {errors.salaryExpectations?.planilla?.min && (
            <span className="text-red-500 text-xs me-2">
              {errors.salaryExpectations.planilla.min.message}
            </span>
          )}
          {errors.salaryExpectations?.planilla?.max && (
            <span className="text-red-500 text-xs">
              {errors.salaryExpectations.planilla.max.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
