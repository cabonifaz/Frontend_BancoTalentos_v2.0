import { Eye, FolderOpen, UserPlus } from "lucide-react";
import { useState } from "react";
import { useModal } from "@/core/context/ModalContext";
import { ReqTalento } from "@/core/models/interfaces/ReqTalento";
import { ESTADO_ATENDIDO } from "@/core/utilities/constants";
import { MODAL_DETALLES_RQ } from "@/core/utilities/modalsIds";
import { useViewTalentFile } from "@/core/hooks/talentos/useViewTalentFile";
import { Loading } from "@/core/components/ui/Loading";
import { ModalPostulantFiles } from "@/core/components/requerimientos/modals/ModalPostulantFiles";
import { Button } from "@/core/components/ui/shadcn/button";
import { Badge } from "@/core/components/ui/shadcn/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/shadcn/table";
import { cn } from "@/core/lib/utils";
import {
  IconAction,
  SectionHeader,
  TabBody,
  rqTable,
} from "@/core/components/requerimientos/rq-ui";

interface TabProps {
  rqId: number;
  /** Cliente del RQ: los tipos de documento del postulante son por cliente. */
  idCliente: number;
  rqState: number;
  talents: ReqTalento[];
  handleAssign: (reqId: number) => void;
}

/** .badge-green / .badge-yellow; sin estado conocido, un badge gris. */
const estadoBadgeVariant = (estado?: string) => {
  const upper = estado?.toUpperCase();
  if (upper === "DATOS COMPLETOS") return "green" as const;
  if (upper === "OBSERVADO") return "yellow" as const;
  return "outline" as const;
};

/** "DATOS COMPLETOS" → "Datos completos". */
const toSentence = (text: string) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : text;

const initialsOf = (talent: ReqTalento) =>
  `${talent.nombresTalento?.trim().charAt(0) ?? ""}${
    talent.apellidosTalento?.trim().charAt(0) ?? ""
  }`.toUpperCase();

export const TabPostulant = ({
  rqId,
  idCliente,
  rqState,
  talents,
  handleAssign,
}: TabProps) => {
  const { closeModal, isModalOpen } = useModal();

  // Postulante cuyo modal de archivos está abierto (null = cerrado).
  const [filesFor, setFilesFor] = useState<ReqTalento | null>(null);

  /**
   * Abre el CV del postulante en el visor del navegador vía URL pre-firmada.
   */
  const { viewingId, viewFile } = useViewTalentFile();
  const downloadingFile = viewingId !== null;

  const openFile = (talent: ReqTalento) => {
    if (talent.idCvFile) {
      viewFile(talent.idCvFile);
    }
  };

  return (
    <TabBody>
      {downloadingFile && <Loading opacity="opacity-30" />}
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Postulantes"
          helper="Talentos asignados a este requerimiento."
          actions={
            rqState !== ESTADO_ATENDIDO && (
              <Button
                variant="blue"
                className="font-medium"
                onClick={() => {
                  if (isModalOpen(MODAL_DETALLES_RQ)) {
                    closeModal(MODAL_DETALLES_RQ);
                  }
                  handleAssign(rqId);
                }}
              >
                <UserPlus className="h-4 w-4" aria-hidden />
                Asignar talentos
              </Button>
            )
          }
        />

        <div className={rqTable.wrapper}>
          <div className="overflow-x-auto">
            <Table className={cn(rqTable.table, "min-w-[60rem]")}>
              <TableHeader>
                <TableRow className={rqTable.headRow}>
                  <TableHead scope="col" className={rqTable.head}>
                    Talento
                  </TableHead>
                  <TableHead scope="col" className={rqTable.head}>
                    Contacto
                  </TableHead>
                  <TableHead scope="col" className={rqTable.head}>
                    Perfil
                  </TableHead>
                  <TableHead scope="col" className={rqTable.head}>
                    Situación
                  </TableHead>
                  <TableHead scope="col" className={cn(rqTable.head, "w-40")}>
                    Estado
                  </TableHead>
                  <TableHead scope="col" className={cn(rqTable.head, "w-28")}>
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {talents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className={rqTable.empty}>
                      Aún no hay postulantes asignados.
                    </TableCell>
                  </TableRow>
                ) : (
                  talents.map((talent) => {
                    const variant = estadoBadgeVariant(talent.estado);
                    const nombre = `${talent.nombresTalento} ${talent.apellidosTalento}`;
                    const estado =
                      talent.estado ||
                      (talent.idEstado === 1 ? "DATOS COMPLETOS" : "OBSERVADO");
                    return (
                      <TableRow key={talent.idTalento} className={rqTable.row}>
                        <TableCell className={rqTable.cell}>
                          <div className="flex items-center gap-3">
                            <span
                              aria-hidden
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[13px] font-bold text-[var(--color-blue)] dark:bg-sky-400/15 dark:text-sky-300"
                            >
                              {initialsOf(talent)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{nombre}</p>
                              <p className="truncate text-[13px] text-gray-500 dark:text-slate-400">
                                Doc. {talent.dni}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className={rqTable.cell}>
                          <p className="tabular-nums">{talent.celular}</p>
                          <p className="truncate text-[13px] text-gray-500 dark:text-slate-400">
                            {talent.email}
                          </p>
                        </TableCell>
                        <TableCell className={rqTable.cell}>{talent.perfil}</TableCell>
                        <TableCell className={rqTable.cell}>{talent.situacion}</TableCell>
                        <TableCell className={rqTable.cell}>
                          <Badge
                            variant={variant}
                            className={
                              variant === "outline"
                                ? "border-transparent bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300"
                                : undefined
                            }
                          >
                            {toSentence(estado)}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn(rqTable.cell, "py-2")}>
                          <div className="flex items-center gap-1">
                            <IconAction
                              icon={Eye}
                              tone="blue"
                              label={
                                talent.idCvFile
                                  ? `Ver CV de ${nombre}`
                                  : `${nombre} no tiene CV`
                              }
                              disabled={!talent.idCvFile}
                              onClick={() => openFile(talent)}
                            />
                            <IconAction
                              icon={FolderOpen}
                              label={`Ver archivos de ${nombre}`}
                              onClick={() => setFilesFor(talent)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {filesFor && (
        <ModalPostulantFiles
          rqId={rqId}
          idCliente={idCliente}
          postulant={filesFor}
          onClose={() => setFilesFor(null)}
        />
      )}
    </TabBody>
  );
};
