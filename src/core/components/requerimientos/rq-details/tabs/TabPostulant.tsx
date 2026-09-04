import { Eye, FolderOpen } from "lucide-react";
import { useState } from "react";
import { useModal } from "../../../../context/ModalContext";
import { ReqTalento } from "../../../../models/interfaces/ReqTalento";
import { ESTADO_ATENDIDO } from "../../../../utilities/constants";
import { MODAL_DETALLES_RQ } from "../../../../utilities/modalsIds";
import { useViewTalentFile } from "../../../../hooks/talentos/useViewTalentFile";
import { Loading } from "../../../ui/Loading";
import { ModalPostulantFiles } from "../../modals/ModalPostulantFiles";

interface TabProps {
  rqId: number;
  /** Cliente del RQ: los tipos de documento del postulante son por cliente. */
  idCliente: number;
  rqState: number;
  talents: ReqTalento[];
  handleAssign: (reqId: number) => void;
}

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

  const openFile = (index: number) => {
    if (talents[index].idCvFile) {
      viewFile(talents[index].idCvFile);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {downloadingFile && <Loading opacity="opacity-30" />}
      <div className="text-end">
        {rqState !== ESTADO_ATENDIDO && (
          <button
            type="button"
            className="focus:outline-none text-sm rounded-lg py-1 px-2 mx-1 my-2 btn-blue cursor-pointer"
            onClick={() => {
              if (isModalOpen(MODAL_DETALLES_RQ)) {
                closeModal(MODAL_DETALLES_RQ);
              }
              handleAssign(rqId);
            }}
          >
            Asignar
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto custom-scroll min-h-0">
        <table className="table w-full">
          <thead>
            <tr className="table-header">
              <th scope="col" className="table-header-cell">
                CV
              </th>
              <th scope="col" className="table-header-cell">
                Nombres y apellidos
              </th>
              <th scope="col" className="table-header-cell">
                Doc. Identidad
              </th>
              <th scope="col" className="table-header-cell">
                Celular
              </th>
              <th scope="col" className="table-header-cell">
                Correo
              </th>
              <th scope="col" className="table-header-cell">
                Situación
              </th>
              <th scope="col" className="table-header-cell">
                Estado
              </th>
              <th scope="col" className="table-header-cell">
                Perfil
              </th>
              <th scope="col" className="table-header-cell">
                Archivos
              </th>
            </tr>
          </thead>
          <tbody>
            {talents.length === 0 ? (
              <tr>
                <td colSpan={9} className="table-empty">
                  No hay postulantes disponibles.
                </td>
              </tr>
            ) : (
              talents.map((talent, index) => (
                <tr key={talent.idTalento} className="table-row">
                  <td className="text-center">
                    <button
                      type="button"
                      className="hover:shadow-lg hover:rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                      onClick={() => openFile(index)}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="table-cell">
                    {talent.nombresTalento} {talent.apellidosTalento}
                  </td>
                  <td className="table-cell">{talent.dni}</td>
                  <td className="table-cell">{talent.celular}</td>
                  <td className="table-cell">{talent.email}</td>
                  <td className="table-cell">{talent.situacion}</td>
                  <td className="table-cell">
                    <span
                      className={`badge ${
                        talent.estado?.toUpperCase() ===
                        "DATOS COMPLETOS"
                          ? "badge-green"
                          : talent.estado?.toUpperCase() ===
                            "OBSERVADO"
                          ? "badge-yellow"
                          : ""
                      }`}
                    >
                      {(
                        talent.estado ||
                        (talent.idEstado === 1
                          ? "DATOS COMPLETOS"
                          : "OBSERVADO")
                      ).toUpperCase()}
                    </span>
                  </td>
                  <td className="table-cell">{talent.perfil}</td>
                  <td className="text-center">
                    <button
                      type="button"
                      title="Ver archivos del postulante"
                      className="p-1 hover:rounded-full hover:bg-gray-100 hover:shadow-lg dark:hover:bg-slate-700"
                      onClick={() => setFilesFor(talent)}
                    >
                      <FolderOpen className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filesFor && (
        <ModalPostulantFiles
          rqId={rqId}
          idCliente={idCliente}
          postulant={filesFor}
          onClose={() => setFilesFor(null)}
        />
      )}
    </div>
  );
};
