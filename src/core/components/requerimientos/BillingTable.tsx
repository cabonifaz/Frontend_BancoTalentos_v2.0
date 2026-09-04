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
    { 
      groupName: "baseAmount",
      groupLabel: "M. Básico",
      bgColor: "bg-sky-100 dark:bg-sky-500/15",
      borderColor: "border-sky-600",
      fields: [
        { name: "minBaseAmount", label: "Min" },
        { name: "maxBaseAmount", label: "Max" }
      ]
    },
    { 
      groupName: "travelAllowance",
      groupLabel: "M. Movilidad",
      bgColor: "bg-orange-100 dark:bg-orange-500/15",
      borderColor: "border-orange-600",
      fields: [
        { name: "minTravelAllowance", label: "Min" },
        { name: "maxTravelAllowance", label: "Max" }
      ]
    },
    { 
      groupName: "monthlyAmount",
      groupLabel: "M. Mensual",
      bgColor: "bg-blue-100 dark:bg-blue-500/15",
      borderColor: "border-blue-600",
      fields: [
        { name: "minMonthlyAmount", label: "Min" },
        { name: "maxMonthlyAmount", label: "Max" }
      ]
    },
    { 
      groupName: "quarterlyAmount",
      groupLabel: "M. Trimestral",
      bgColor: "bg-emerald-100 dark:bg-emerald-500/15",
      borderColor: "border-emerald-600",
      fields: [
        { name: "minQuarterlyAmount", label: "Min" },
        { name: "maxQuarterlyAmount", label: "Max" }
      ]
    },
    { 
      groupName: "semiAnnualAmount",
      groupLabel: "M. Semestral",
      bgColor: "bg-orange-100 dark:bg-orange-500/15",
      borderColor: "border-orange-500",
      fields: [
        { name: "minSemiAnnualAmount", label: "Min" },
        { name: "maxSemiAnnualAmount", label: "Max" }
      ]
    }
  ];

  const universalFields = ["baseAmount"];

  return (
    <div className={"border border-gray-300 rounded-lg p-4 dark:border-slate-600"}>
      {/* Header de la tabla */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">{title}</h3>

        <div className="flex items-center">
          <label className="w-1/3 text-sm font-semibold text-gray-700 dark:text-slate-200">
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
         {montoFields.map((group) => {
          const isUniversalGroup = universalFields.includes(group.groupName);
          const isVisible = isUniversalGroup || modalidadId !== 1;

          return (
            <div
              key={group.groupName}
              className={`${!isVisible ? "hidden" : "flex flex-col gap-2"}`}
            >
              {/* Label del grupo */}
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                {group.groupLabel}
              </label>

              {/* Contenedor único con borde para Min y Max */}
              <div className={`rounded-md p-3 border-2 dark:border-slate-700 ${group.bgColor} ${group.borderColor}`}>
                <div className="grid grid-cols-2 gap-3">
                  {group.fields.map((field) => (
                    <div key={field.name} className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-slate-300">{field.label}</span>
                      <Controller
                        name={`lstFacturacion.${index}.${field.name}` as any}
                        control={control}
                        render={({ field: controllerField }) => (
                          <input
                            {...controllerField}
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 text-right bg-white dark:border-slate-600 dark:bg-slate-800"
                            type="number"
                            disabled={!isEditable}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={controllerField.value ?? ""}
                          />
                        )}
                      />
                      {errors.lstFacturacion?.[index]?.[field.name as keyof typeof errors.lstFacturacion[number]] && (
                        <span className="text-red-500 text-xs leading-tight">
                          {errors.lstFacturacion?.[index]?.[field.name as "minBaseAmount"]?.message}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

