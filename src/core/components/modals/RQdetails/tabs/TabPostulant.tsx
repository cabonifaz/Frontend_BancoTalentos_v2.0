import { useModal } from "../../../../context/ModalContext";
import { useApi } from "../../../../hooks/useApi";
import { FileResponse } from "../../../../models";
import { ReqTalento } from "../../../../models/interfaces/ReqTalento";
import { getCvFile } from "../../../../services/apiService";
import { ESTADO_ATENDIDO } from "../../../../utilities/constants";
import {
  handleError,
  handleResponse,
} from "../../../../utilities/errorHandler";
import { MODAL_DETALLES_RQ } from "../../../../utilities/modalsIds";
import { Utils } from "../../../../utilities/utils";
import { enqueueSnackbar } from "notistack";
import { Loading } from "../../../ui/Loading";

interface TabProps {
  rqId: number;
  rqState: number;
  talents: ReqTalento[];
  handleAssign: (reqId: number) => void;
}

export const TabPostulant = ({
  rqId,
  rqState,
  talents,
  handleAssign,
}: TabProps) => {
  const { closeModal, isModalOpen } = useModal();

  /**
   * Fetch CV file for talent
   */
  const { loading: downloadingFile, fetch } = useApi<
    FileResponse,
    number
  >(getCvFile, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) =>
      handleResponse({
        response: response,
        showSuccessMessage: false,
        enqueueSnackbar: enqueueSnackbar,
      }),
  });

  const openFile = (index: number) => {
    if (talents[index].idCvFile) {
      fetch(talents[index].idCvFile).then((response) => {
        if (response.data.result.idMensaje === 2) {
          const archivoB64 = response.data.archivo;
          Utils.openPdfDocument(archivoB64);
        }
      });
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
            </tr>
          </thead>
          <tbody>
            {talents.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-empty">
                  No hay postulantes disponibles.
                </td>
              </tr>
            ) : (
              talents.map((talent, index) => (
                <tr key={talent.idTalento} className="table-row">
                  <td className="text-center">
                    <button
                      type="button"
                      className="hover:shadow-lg hover:rounded-full hover:bg-gray-100"
                      onClick={() => openFile(index)}
                    >
                      <img
                        src="/assets/ic_show_pass.svg"
                        alt="icon eye"
                        className="w-5 h-5"
                      />
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
