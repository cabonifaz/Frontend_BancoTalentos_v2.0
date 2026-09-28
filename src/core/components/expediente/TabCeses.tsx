import { DoorOpen } from "lucide-react";
import { ExpedienteCese } from "../../models";
import { HISTORIAL_CESE } from "../../utilities/expediente";
import { BotonPdf, TablaExpediente } from "./TablaExpediente";

interface Props {
  ceses?: ExpedienteCese[];
  onVerPdf: (tipoHistorial: number, idHistorial: number) => void;
}

const COLUMNAS = [
  { label: "Fecha de cese", align: "center" as const },
  { label: "Motivo" },
  { label: "Cliente" },
  { label: "RQ" },
  { label: "Título del RQ" },
  { label: "", align: "right" as const },
];

/** Ceses del talento (HISTORIAL tipo 3). */
export const TabCeses = ({ ceses = [], onVerPdf }: Props) => (
  <TablaExpediente
    columnas={COLUMNAS}
    hayFilas={ceses.length > 0}
    vacio={{
      icono: DoorOpen,
      titulo: "Sin ceses",
      texto:
        "Este talento no tiene ceses registrados. Los ceses se generan desde FMI, sobre un contrato activo.",
    }}
    pie={
      <>
        {ceses.length} cese{ceses.length === 1 ? "" : "s"} · el PDF es el
        formulario FT-GS-01 de desactivación de usuarios.
      </>
    }
  >
    {ceses.map((cese, indice) => (
      <tr key={cese.terminationId ?? indice} className="table-row">
        <td className="table-cell text-center font-semibold">
          {cese.terminationDate || "—"}
        </td>
        <td
          className="table-cell max-w-[260px] truncate"
          title={cese.terminationReason}
        >
          {cese.terminationReason || "—"}
        </td>
        <td className="table-cell">{cese.client || "—"}</td>
        <td className="table-cell font-semibold">{cese.requirementCode || "—"}</td>
        <td
          className="table-cell max-w-[220px] truncate"
          title={cese.requirementTitle}
        >
          {cese.requirementTitle || "—"}
        </td>
        <td className="table-cell text-right">
          <BotonPdf
            onClick={() => onVerPdf(HISTORIAL_CESE, cese.terminationId ?? 0)}
            disabled={!cese.terminationId}
            titulo="Ver el formulario de cese"
          />
        </td>
      </tr>
    ))}
  </TablaExpediente>
);
