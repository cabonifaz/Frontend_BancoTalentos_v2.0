import { Eye, FileText, Pencil } from "lucide-react";
import { useModal } from "../../../context/ModalContext";
import { TalentFile } from "../../../models";
import { Modal } from "../../modals/Modal";
import { Loading } from "../../ui/Loading";
import { useViewTalentFile } from "../../../hooks/talentos/useViewTalentFile";

interface Props {
    cvData?: TalentFile;
}

export const ModalResume = ({ cvData }: Props) => {
    const { openModal, closeModal } = useModal();

    const { viewingId, viewFile } = useViewTalentFile();
    const loading = viewingId !== null;

    const replaceResumeFile = () => {
        closeModal("modalCv");
        openModal("modalUploadResume");
    }

    const openFile = () => {
        if (cvData?.idArchivo) {
            viewFile(cvData.idArchivo);
        }
    }

    return (
        <Modal id="modalCv" title="Curriculum Vitae" showButtonOptions={false}>
            {loading && (<Loading opacity="opacity-60" />)}
            <div className="flex flex-col">
                <h3 className="text-[#71717A] text-sm mt-6 dark:text-slate-400">Curriculum Vitae</h3>
                <div className="my-8 flex flex-col justify-center w-fit items-center relative self-center">
                    <FileText className="w-48 h-48 text-[#71717A] dark:text-slate-400" strokeWidth={1} />
                    <p className="text-[#71717A] text-xs my-2 text-ellipsis max-w-40 line-clamp-1 dark:text-slate-400">{cvData?.nombreArchivo}</p>
                    <button type="button" className="hover:shadow-lg hover:rounded-full hover:bg-gray-100 dark:hover:bg-slate-700" onClick={replaceResumeFile}>
                        <Pencil className="absolute right-0 top-0 w-6 h-6" />
                    </button>
                    <button type="button" className="hover:shadow-lg hover:rounded-full hover:bg-gray-100 dark:hover:bg-slate-700" onClick={openFile}>
                        <Eye className="absolute right-0 bottom-1 w-6 h-6" />
                    </button>
                </div>
            </div>
        </Modal>
    );
}