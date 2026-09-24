import { Repeat2 } from "lucide-react";
import { ExpedienteMovimiento } from "../../models";
import { HISTORIAL_MOVIMIENTO } from "../../utilities/expediente";
import { BotonPdf, TablaExpediente } from "./TablaExpediente";

interface Props {
  movimientos?: ExpedienteMovimiento[];
  onVerPdf: (tipoHistorial: number, idHistorial: number) => void;
}

const COLUMNAS = [
  { label: "Fecha", align: "center" as const },
  { label: "Tipo" },
  { label: "Motivo" },
  { label: "Área anterior" },
  { label: "Cargo" },
  { label: "", align: "right" as const },
];

/** Movimientos del talento (HISTORIAL, tipos distintos de cese). */
export const TabMovimientos = ({ movimientos = [], onVerPdf }: Props) => (
  <TablaExpediente
    columnas={COLUMNAS}
    hayFilas={movimientos.length > 0}
    vacio={{
      icono: Repeat2,
      titulo: "Sin movimientos",
      texto:
        "No hay cambios de área ni de cargo registrados para este talento. Los movimientos se generan desde FMI.",
    }}
    pie={
      <>
        {movimientos.length} movimiento{movimientos.length === 1 ? "" : "s"} · el
        PDF es el formulario firmado de ese movimiento.
      </>
    }
  >
    {movimientos.map((movimiento) => (
      <tr key={movimiento.movementId} className="table-row">
        <td className="table-cell text-center font-semibold">
          {movimiento.movementDate || "—"}
        </td>
        <td className="table-cell">{movimiento.movementType || "—"}</td>
        <td className="table-cell max-w-[260px] truncate" title={movimiento.reason}>
          {movimiento.reason || "—"}
        </td>
        <td className="table-cell">{movimiento.previousArea || "—"}</td>
        <td className="table-cell">{movimiento.position || "—"}</td>
        <td className="table-cell text-right">
          <BotonPdf
            onClick={() =>
              onVerPdf(
                movimiento.movementTypeId ?? HISTORIAL_MOVIMIENTO,
                movimiento.movementId
              )
            }
            titulo="Ver el formulario del movimiento"
          />
        </td>
      </tr>
    ))}
  </TablaExpediente>
);
