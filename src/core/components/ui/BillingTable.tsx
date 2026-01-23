import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { newRQSchemaType } from "../../models/schemas/NewRQSchemaV1";
import { RQFacturacionDeclaraSunat } from "../../models/interfaces/RQFacturacion";
import { Param } from "../../models/interfaces/Param";
import { DropdownForm } from "../forms";

interface BillingTableProps {
  index: number;
  title: string;
  modalidadId: number;
  isEditable?: boolean;
  currencyOptions: Param[];
}
export const BillingTable: React.FC<BillingTableProps> = ({
  index,
  title,
  modalidadId,
  isEditable = true,
  currencyOptions,
}) => {
  const {
    control,
    formState: { errors },
    clearErrors,
  } = useFormContext<newRQSchemaType>();

  // Configuración de campos de montos
  const montoFields = [
      { name: "minBaseAmount", label: "M. Básico Min", bgColor: "bg-blue-100 border-2 border-blue-500" },
      { name: "maxBaseAmount", label: "M. Básico Max", bgColor: "bg-blue-100 border-2 border-blue-500" },

      { name: "minTravelAllowance", label: "M. Movilidad Min", bgColor: "bg-emerald-100 border-2 border-emerald-500" },
      { name: "maxTravelAllowance", label: "M. Movilidad Max", bgColor: "bg-emerald-100 border-2 border-emerald-500" },

      { name: "minMonthlyAmount", label: "M. Mensual Min", bgColor: "bg-emerald-100 border-2 border-emerald-500" },
      { name: "maxMonthlyAmount", label: "M. Mensual Max", bgColor: "bg-emerald-100 border-2 border-emerald-500" },

      { name: "minQuarterlyAmount", label: "M. Trimestral Min", bgColor: "bg-sky-100 border-2 border-sky-500" },
      { name: "maxQuarterlyAmount", label: "M. Trimestral Max", bgColor: "bg-sky-100 border-2 border-sky-500" },

      { name: "minSemiAnnualAmount", label: "M. Semestral Min", bgColor: "bg-blue-100 border-2 border-blue-500" },
      { name: "maxSemiAnnualAmount", label: "M. Semestral Max", bgColor: "bg-blue-100 border-2 border-blue-500" },
    ] as const;

  const universalFields = ["minBaseAmount", "maxBaseAmount"];

  return (
    <div className={"border border-gray-300 rounded-lg p-4"}>
      {/* Header de la tabla */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>

        <div className="flex items-center">
          <label className="w-1/3 text-sm font-semibold text-gray-700">
            Tipo de moneda:
          </label>
          <div className="flex gap-4 w-2/3">
            <DropdownForm
              name={`lstFacturacion.${index}.currencyType`}
              control={control}
              error={errors?.lstFacturacion?.[index]?.currencyType}
              required={false}
              disabled={!isEditable}
              flex={true}
              clearErrors={clearErrors}
              options={currencyOptions.map((op) => ({
                label: op.string1,
                value: op.num1,
              }))}
            />
          </div>
        </div>
      </div>

      {/* Tabla de montos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {montoFields.map((montoField) => {
          const isUniversalField = universalFields.includes(
            montoField.name,
          );
          const isVisible = isUniversalField || modalidadId !== 1;

          return (
            <div
              key={montoField.name}
              className={`${
                !isVisible ? "hidden" : "flex flex-col gap-1"
              }`}
            >
              {/* Label Row */}
              <label className="text-sm font-semibold text-gray-700">
                {montoField.label}
              </label>

              {/* Input & Error Row */}
              <div className={`rounded-md p-2 ${montoField.bgColor}`}>
                <Controller
                  name={
                    `lstFacturacion.${index}.${montoField.name}` as any
                  }
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 text-right"
                      type="number"
                      disabled={!isEditable}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={field.value ?? ""}
                    />
                  )}
                />
                {errors.lstFacturacion?.[index]?.[
                  montoField.name
                ] && (
                  <span className="text-red-500 text-xs mt-1 block leading-tight">
                    {
                      errors.lstFacturacion?.[index]?.[
                        montoField.name
                      ]?.message
                    }
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
