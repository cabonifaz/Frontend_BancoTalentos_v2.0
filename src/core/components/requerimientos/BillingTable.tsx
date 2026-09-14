import { Fragment } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { newRQSchemaType } from "@/core/models/schemas/NewRQSchemaV1";
import { Param } from "@/core/models/interfaces/Param";
import { DropdownForm } from "@/core/components/forms";
import { Input } from "@/core/components/ui/shadcn/input";
import { cn } from "@/core/lib/utils";
import { rqReadonly } from "@/core/components/requerimientos/rq-ui";

interface BillingTableProps {
  index: number;
  modalidadId: number;
  isEditable?: boolean;
  currencyOptions: Param[];
}

type AmountField =
  | "minBaseAmount"
  | "maxBaseAmount"
  | "minTravelAllowance"
  | "maxTravelAllowance"
  | "minMonthlyAmount"
  | "maxMonthlyAmount"
  | "minQuarterlyAmount"
  | "maxQuarterlyAmount"
  | "minSemiAnnualAmount"
  | "maxSemiAnnualAmount";

const CONCEPTS: {
  label: string;
  min: AmountField;
  max: AmountField;
  universal?: boolean;
}[] = [
  { label: "Básico", min: "minBaseAmount", max: "maxBaseAmount", universal: true },
  { label: "Movilidad", min: "minTravelAllowance", max: "maxTravelAllowance" },
  { label: "Mensual", min: "minMonthlyAmount", max: "maxMonthlyAmount" },
  { label: "Trimestral", min: "minQuarterlyAmount", max: "maxQuarterlyAmount" },
  { label: "Semestral", min: "minSemiAnnualAmount", max: "maxSemiAnnualAmount" },
];

/**
 * Banda salarial de una modalidad de contrato: es el cuerpo de su tarjeta
 * (ModalityCard) en Gestión, así que no pinta borde ni cabecera propios.
 * Moneda arriba y una rejilla Mínimo/Máximo por concepto. Sin `isEditable`
 * (Detalle RQ sin pulsar Editar) los mismos campos se muestran bloqueados.
 */
export const BillingTable = ({
  index,
  modalidadId,
  isEditable = true,
  currencyOptions,
}: BillingTableProps) => {
  const {
    control,
    formState: { errors },
    clearErrors,
  } = useFormContext<newRQSchemaType>();

  const itemErrors = errors.lstFacturacion?.[index];
  // DropdownForm usa el nombre del campo como id del select.
  const currencyName = `lstFacturacion.${index}.currencyType`;

  // Locación de servicios (modalidad 1) solo lleva el monto básico, como antes.
  const isVisible = (c: (typeof CONCEPTS)[number]) =>
    !!c.universal || modalidadId !== 1;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* La etiqueta ocupa la misma columna que "Mínimo"/"Máximo", así el
          select queda alineado con la columna Básico. */}
      <div className="flex items-start gap-3">
        <label
          htmlFor={currencyName}
          className="flex h-12 w-24 shrink-0 items-center text-sm font-medium text-gray-700 dark:text-slate-200"
        >
          Moneda
          {isEditable && <span className="text-red-500">&nbsp;*</span>}
        </label>
        <div className="w-56">
          <DropdownForm
            name={currencyName}
            control={control}
            error={itemErrors?.currencyType}
            required={false}
            disabled={!isEditable}
            flex={true}
            clearErrors={clearErrors}
            triggerClassName={rqReadonly}
            options={currencyOptions.map((op) => ({
              label: op.string1,
              value: op.num1,
            }))}
          />
        </div>
      </div>

      {/* Conceptos en columnas y Mínimo/Máximo en filas. En pantallas
          estrechas la rejilla se desplaza en horizontal. */}
      <div className="overflow-x-auto">
        <div className="grid min-w-[44rem] grid-cols-[6rem_repeat(5,minmax(0,1fr))] items-start gap-x-3 gap-y-2.5">
          <span />
          {CONCEPTS.map((c) => (
            <span
              key={c.label}
              className="text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400"
            >
              {isVisible(c) ? c.label : ""}
            </span>
          ))}

          {(["min", "max"] as const).map((kind) => (
            <Fragment key={kind}>
              <span className="flex h-10 items-center text-sm font-medium text-gray-700 dark:text-slate-200">
                {kind === "min" ? "Mínimo" : "Máximo"}
              </span>
              {CONCEPTS.map((c) => {
                const name = c[kind];
                if (!isVisible(c)) return <span key={name} />;
                const error = itemErrors?.[name]?.message;
                return (
                  <div key={name} className="flex min-w-0 flex-col gap-1">
                    <Controller
                      name={`lstFacturacion.${index}.${name}`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          aria-label={`${c.label} ${kind === "min" ? "mínimo" : "máximo"}`}
                          aria-invalid={!!error}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          disabled={!isEditable}
                          className={cn(
                            "h-10 px-3 text-right tabular-nums",
                            rqReadonly
                          )}
                        />
                      )}
                    />
                    {error && (
                      <span className="text-xs leading-tight text-red-500 dark:text-red-400">
                        {error}
                      </span>
                    )}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
