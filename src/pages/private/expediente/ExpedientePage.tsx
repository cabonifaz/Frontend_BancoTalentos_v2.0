import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams as useRouteParams } from "react-router-dom";
import { Dashboard } from "../Dashboard";
import { Loading } from "../../../core/components";
import { BuscadorTalentos } from "../../../core/components/expediente/BuscadorTalentos";
import { FichaTalento } from "../../../core/components/expediente/FichaTalento";
import {
  ExpedienteTabs,
  SeccionExpediente,
} from "../../../core/components/expediente/ExpedienteTabs";
import { TabResumen } from "../../../core/components/expediente/TabResumen";
import { TabContratos } from "../../../core/components/expediente/TabContratos";
import { TabMovimientos } from "../../../core/components/expediente/TabMovimientos";
import { TabEquipos } from "../../../core/components/expediente/TabEquipos";
import { TabCeses } from "../../../core/components/expediente/TabCeses";
import {
  MODAL_DOCUMENTOS_EXPEDIENTE,
  ModalDocumentos,
} from "../../../core/components/expediente/ModalDocumentos";
import { useModal } from "../../../core/context/ModalContext";
import {
  useBuscadorExpediente,
  useExpedienteDetalle,
  useExpedientePdf,
} from "../../../core/hooks/expediente/useExpediente";
import { nombreCompleto } from "../../../core/utilities/expediente";

/**
 * Expediente del talento: el buscador de FMI y su ficha (contratos,
 * movimientos, solicitudes de equipo y ceses) como módulo propio de BDT.
 *
 * Es de consulta: los formularios de ingreso, movimiento, cese y solicitud de
 * equipo se generan en Asignar Talento y en FMI. Aquí se leen y se descargan.
 */
export default function ExpedientePage() {
  const { idTalento } = useRouteParams();
  const navigate = useNavigate();
  const { openModal } = useModal();

  const talentoId = Number(idTalento) || 0;
  const [seccion, setSeccion] = useState<SeccionExpediente>("resumen");

  const { talentos, loading: buscando, buscado, buscar } = useBuscadorExpediente();
  const { detalle, loading: cargando, cargar, limpiar } = useExpedienteDetalle();
  const {
    loading: descargando,
    verHistorial,
    verEquipo,
    verUltimoHistorial,
    verUltimoEquipo,
  } = useExpedientePdf();

  // Sin talento seleccionado se precarga la lista, igual que hace FMI al abrir
  // su buscador: son los talentos con contrato más reciente.
  useEffect(() => {
    if (!talentoId) {
      limpiar();
      buscar();
    }
  }, [talentoId, buscar, limpiar]);

  useEffect(() => {
    if (talentoId) {
      setSeccion("resumen");
      cargar(talentoId);
    }
  }, [talentoId, cargar]);

  const nombre = useMemo(() => nombreCompleto(detalle) || "el talento", [detalle]);

  const handleVerHistorial = useCallback(
    (tipoHistorial: number, idHistorial: number) =>
      verHistorial(tipoHistorial, idHistorial, talentoId),
    [verHistorial, talentoId]
  );

  const handleVerEquipo = useCallback(
    (idSolicitud: number) => verEquipo(idSolicitud, talentoId),
    [verEquipo, talentoId]
  );

  const tabs = useMemo(
    () => [
      { id: "resumen" as const, label: "Resumen" },
      {
        id: "contratos" as const,
        label: "Contratos",
        total: detalle?.contracts?.length ?? 0,
      },
      {
        id: "movimientos" as const,
        label: "Movimientos",
        total: detalle?.movements?.length ?? 0,
      },
      {
        id: "equipos" as const,
        label: "Solicitudes de equipo",
        total: detalle?.equipmentRequests?.length ?? 0,
      },
      {
        id: "ceses" as const,
        label: "Ceses",
        total: detalle?.terminations?.length ?? 0,
      },
    ],
    [detalle]
  );

  return (
    <Dashboard>
      {(buscando || cargando || descargando) && <Loading opacity="opacity-50" />}

      <div className="flex h-full flex-col gap-4 overflow-x-hidden">
        {!talentoId ? (
          <>
            <div className="flex shrink-0 flex-col gap-1">
              <h2 className="text-2xl font-semibold">Expediente del talento</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Consulta contratos, movimientos, solicitudes de equipo y ceses de
                cualquier talento.
              </p>
            </div>
            <BuscadorTalentos
              talentos={talentos}
              loading={buscando}
              buscado={buscado}
              onBuscar={buscar}
              onAbrir={(talento) =>
                navigate(`/dashboard/expediente/${talento.idTalento}`)
              }
            />
          </>
        ) : (
          <>
            <FichaTalento
              detalle={detalle}
              onVolver={() => navigate("/dashboard/expediente")}
              onDocumentos={() => openModal(MODAL_DOCUMENTOS_EXPEDIENTE)}
            />

            <ExpedienteTabs tabs={tabs} activa={seccion} onChange={setSeccion} />

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-1">
              {seccion === "resumen" && (
                <TabResumen
                  detalle={detalle}
                  onVerHistorial={handleVerHistorial}
                  onVerEquipo={handleVerEquipo}
                />
              )}
              {seccion === "contratos" && (
                <TabContratos contratos={detalle?.contracts} />
              )}
              {seccion === "movimientos" && (
                <TabMovimientos
                  movimientos={detalle?.movements}
                  onVerPdf={handleVerHistorial}
                />
              )}
              {seccion === "equipos" && (
                <TabEquipos
                  equipos={detalle?.equipmentRequests}
                  onVerPdf={handleVerEquipo}
                />
              )}
              {seccion === "ceses" && (
                <TabCeses ceses={detalle?.terminations} onVerPdf={handleVerHistorial} />
              )}
            </div>

            <ModalDocumentos
              nombre={nombre}
              busy={descargando}
              onVerUltimoHistorial={(tipoHistorial) =>
                verUltimoHistorial(tipoHistorial, talentoId)
              }
              onVerUltimoEquipo={() => verUltimoEquipo(talentoId)}
            />
          </>
        )}
      </div>
    </Dashboard>
  );
}
