import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { newRQSchemaType } from "../../models/schemas/NewRQSchemaV1";
import { RQFacturacionDeclaraSunat } from "../../models/interfaces/RQFacturacion";

interface BillingTableProps {
  index: number;
  title: string;
  modalidadId: number;
  isEditable?: boolean;
}

export const BillingTable: React.FC<BillingTableProps> = ({
  index,
  title,
  modalidadId,
  isEditable = true,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<newRQSchemaType>();

  // Configuración de campos de montos
  const montoFields = [
    { name: "montoBase", label: "Monto Base" },
    { name: "montoMovilidad", label: "Monto Movilidad" },
    { name: "montoMensual", label: "Monto Mensual" },
    { name: "montoTrimestral", label: "Monto Trimestral" },
    { name: "montoSemestral", label: "Monto Semestral" },
  ] as const;

  // Determinar el grupo de modalidad y configuración por defecto
  const planillaIds = [2, 3];
  const isPlanilla = planillaIds.includes(modalidadId);

  return (
    <div className={"border border-gray-300 rounded-lg p-4"}>
      {/* Header de la tabla */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {title}
        </h3>
      </div>

      {/* Campos superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ¿Declarado en SUNAT?
          </label>
          <Controller
            name={`lstFacturacion.${index}.declaraSunat`}
            control={control}
            defaultValue={isPlanilla}
            render={({ field }) => (
              <select
                {...field}
                disabled={!isEditable}
                value={
                  isPlanilla
                    ? RQFacturacionDeclaraSunat.SI
                    : RQFacturacionDeclaraSunat.NO
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={RQFacturacionDeclaraSunat.SI}>
                  Sí
                </option>
                <option value={RQFacturacionDeclaraSunat.NO}>
                  No
                </option>
              </select>
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sede a declarar
          </label>
          <Controller
            name={`lstFacturacion.${index}.sedeSunat`}
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value || ""}
                disabled={!isEditable}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione una opción</option>
                <option value="sede-principal">Sede Principal</option>
                <option value="oficina-cliente">
                  Oficina del Cliente
                </option>
              </select>
            )}
          />
        </div>
      </div>

      {/* Tabla de montos */}
      <div className="space-y-4">
        {montoFields.map((montoField) => (
          <div
            key={montoField.name}
            className="flex items-center space-x-4"
          >
            {/* Label del concepto */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                {montoField.label}
              </label>
            </div>

            {/* Input del valor */}
            <div className="w-32">
              <Controller
                name={
                  `lstFacturacion.${index}.${montoField.name}` as any
                }
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    disabled={!isEditable}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                )}
              />
              {errors.lstFacturacion?.[index]?.[montoField.name] && (
                <span className="text-red-500 text-xs mt-1 block">
                  {
                    errors.lstFacturacion?.[index]?.[montoField.name]
                      ?.message
                  }
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
