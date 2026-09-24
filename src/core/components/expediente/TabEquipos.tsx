import { Monitor } from "lucide-react";
import { ExpedienteEquipo } from "../../models";
import { BotonPdf, TablaExpediente } from "./TablaExpediente";

interface Props {
  equipos?: ExpedienteEquipo[];
  onVerPdf: (idSolicitud: number) => void;
}

const COLUMNAS = [
  { label: "Equipo" },
  { label: "Marca y modelo" },
  { label: "Fecha de solicitud", align: "center" as const },
  { label: "Fecha de entrega", align: "center" as const },
  { label: "Celular asignado", align: "center" as const },
  { label: "", align: "right" as const },
];

/** Solicitudes de equipo (EQUIPO_SOLICITUD) del talento. */
export const TabEquipos = ({ equipos = [], onVerPdf }: Props) => (
  <TablaExpediente
    columnas={COLUMNAS}
    hayFilas={equipos.length > 0}
    vacio={{
      icono: Monitor,
      titulo: "Sin solicitudes de equipo",
      texto:
        "Este talento no tiene hardware ni software solicitado. Las solicitudes se generan al asignarlo a un requerimiento o desde FMI.",
    }}
    pie={
      <>
        {equipos.length} solicitud{equipos.length === 1 ? "" : "es"} · el PDF es el
        formulario FT-GS-03 de requerimiento de hardware y software.
      </>
    }
  >
    {equipos.map((equipo) => (
      <tr key={equipo.requestId} className="table-row">
        <td className="table-cell font-semibold">
          <span className="flex items-center gap-2">
            <Monitor size={16} strokeWidth={1.8} className="text-gray-400 dark:text-slate-500" />
            {equipo.equipmentType || "—"}
          </span>
        </td>
        <td className="table-cell">{equipo.brand || "—"}</td>
        <td className="table-cell text-center">{equipo.requestDate || "—"}</td>
        <td className="table-cell text-center">{equipo.deliveryDate || "—"}</td>
        <td className="table-cell text-center">{equipo.mobileAssigned || "—"}</td>
        <td className="table-cell text-right">
          <BotonPdf
            onClick={() => onVerPdf(equipo.requestId)}
            titulo="Ver la solicitud de equipo"
          />
        </td>
      </tr>
    ))}
  </TablaExpediente>
);
