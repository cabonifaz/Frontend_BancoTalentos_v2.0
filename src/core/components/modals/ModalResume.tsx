import { enqueueSnackbar } from "notistack";
import { useModal } from "../../context/ModalContext";
import { useApi } from "../../hooks/useApi";
import { FileResponse, TalentFile } from "../../models";
import { getCvFile } from "../../services/apiService";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { Modal } from "./Modal";
import { Loading } from "../ui/Loading";

interface Props {
    cvData?: TalentFile;
}

export const ModalResume = ({ cvData }: Props) => {
    const { openModal, closeModal } = useModal();

    const { loading, fetch } = useApi<FileResponse, number>(getCvFile, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => {
            handleResponse(response, enqueueSnackbar);

            if (response.data.result.idMensaje === 2) {
                const archivoB64 = response.data.archivo;
                const byteCharacters = atob(archivoB64);
                const byteNumbers = new Array(byteCharacters.length);

                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);

                window.open(url, "_blank");
                URL.revokeObjectURL(url);
            }
        },
    });

    const replaceResumeFile = () => {
        closeModal("modalCv");
        openModal("modalUploadResume");
    }

    const openFile = () => {
        if (cvData?.idArchivo) {
            fetch(cvData.idArchivo);
        }
    }

    return (
        <Modal id="modalCv" title="Curriculum Vitae" showButtonOptions={false}>
            {loading && (<Loading opacity="opacity-60" />)}
            <div className="flex flex-col">
                <h3 className="text-[#71717A] text-sm mt-6">Curriculum Vitae</h3>
                <div className="my-8 flex flex-col justify-center w-fit items-center relative self-center">
                    <img src="/assets/ic_pdf_info.svg" alt="icon pdf" className="w-48 h-48" />
                    <p className="text-[#71717A] text-xs my-2 text-ellipsis max-w-40 line-clamp-1">{cvData?.nombreArchivo}</p>
                    <button type="button" className="hover:shadow-lg hover:rounded-full hover:bg-gray-100" onClick={replaceResumeFile}>
                        <img src="/assets/ic_edit.svg" alt="icon edit" className="absolute right-0 top-0 w-6 h-6" />
                    </button>
                    <button type="button" className="hover:shadow-lg hover:rounded-full hover:bg-gray-100" onClick={openFile}>
                        <img src="/assets/ic_show_pass.svg" alt="icon eye" className="absolute right-0 bottom-1" />
                    </button>
                </div>
            </div>
        </Modal>
    );
}