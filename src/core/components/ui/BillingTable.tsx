import React from "react";

interface BillingTableProps {
  title: string;
  className?: string;
  declaredInSunat?: boolean;
}

export const BillingTable: React.FC<BillingTableProps> = ({
  title,
  className = "",
  declaredInSunat = false,
}) => {
  // Datos de ejemplo para la tabla
  const sampleData = [
    {
      concepto: "Monto Base",
      valor: "1500",
      checked: true,
    },
    {
      concepto: "Monto Movilidad",
      valor: "0",
      checked: true,
    },
    {
      concepto: "Monto Mensual",
      valor: "0",
      checked: true,
    },
    {
      concepto: "Monto Trimestral",
      valor: "0",
      checked: true,
    },
    {
      concepto: "Monto Semestral",
      valor: "0",
      checked: true,
    },
  ];

  return (
    <div
      className={`border border-gray-300 rounded-lg p-4 ${className}`}
    >
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
            Declarado en SUNAT?
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={true}
          >
            <option value={declaredInSunat ? 1 : 0}>
              {declaredInSunat ? "Sí" : "No"}
            </option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sede a declarar
          </label>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="sede-principal">Sede Principal</option>
            <option value="sede-secundaria">Sede Secundaria</option>
          </select>
        </div>
      </div>

      {/* Tabla de montos */}
      <div className="space-y-4">
        {sampleData.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            {/* Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={item.checked}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                readOnly
              />
            </div>

            {/* Label del concepto */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                {item.concepto}
              </label>
            </div>

            {/* Input del valor */}
            <div className="w-24">
              <input
                type="number"
                value={item.valor}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                readOnly
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
