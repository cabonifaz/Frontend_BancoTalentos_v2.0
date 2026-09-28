import { Briefcase } from "lucide-react";
import { ExpedienteContrato } from "../../models";
import { TablaExpediente } from "./TablaExpediente";

interface Props {
  contratos?: ExpedienteContrato[];
}

const COLUMNAS = [
  { label: "ID" },
  { label: "Modalidad" },
  { label: "Objeto" },
  { label: "Área" },
  { label: "Cliente" },
  { label: "RQ" },
  { label: "Título del RQ" },
  { label: "Inicio", align: "center" as const },
  { label: "Fin", align: "center" as const },
  { label: "Monto base", align: "right" as const },
  { label: "Estado" },
];

/** Contratos del talento (TALENTO_CONTRATO), del más nuevo al más antiguo. */
export const TabContratos = ({ contratos = [] }: Props) => {
  const vigentes = contratos.filter((c) => c.status === "ACTIVO").length;

  return (
    <TablaExpediente
      columnas={COLUMNAS}
      hayFilas={contratos.length > 0}
      anchoMinimo="1180px"
      vacio={{
        icono: Briefcase,
        titulo: "Sin contratos",
        texto:
          "Este talento todavía no tiene contratos generados. Se crean al finalizar un requerimiento en Asignar Talento.",
      }}
      pie={
        <>
          {contratos.length} contrato{contratos.length === 1 ? "" : "s"} ·{" "}
          {vigentes} vigente{vigentes === 1 ? "" : "s"}
        </>
      }
    >
      {contratos.map((contrato) => (
        <tr key={contrato.contractId} className="table-row">
          <td className="table-cell font-semibold">{contrato.contractId}</td>
          <td className="table-cell">{contrato.contractType || "—"}</td>
          <td className="table-cell">{contrato.contractObject || "—"}</td>
          <td className="table-cell">{contrato.area || "—"}</td>
          <td className="table-cell">{contrato.client || "—"}</td>
          <td className="table-cell font-semibold">{contrato.rqCode || "—"}</td>
          <td className="table-cell max-w-[220px] truncate" title={contrato.rqTitle}>
            {contrato.rqTitle || "—"}
          </td>
          <td className="table-cell text-center">{contrato.startDate || "—"}</td>
          <td className="table-cell text-center">{contrato.endDate || "—"}</td>
          <td className="table-cell text-right tabular-nums font-semibold">
            {contrato.baseAmount || "—"}
          </td>
          <td className="table-cell">
            <span
              className={`badge ${
                contrato.status === "ACTIVO"
                  ? "bg-green-100 text-green-800 dark:bg-green-400/15 dark:text-green-300"
                  : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300"
              }`}
            >
              {contrato.status || "—"}
            </span>
          </td>
        </tr>
      ))}
    </TablaExpediente>
  );
};
