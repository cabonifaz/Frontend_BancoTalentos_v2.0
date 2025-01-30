import { useModal } from "../../context/ModalContext";
import { Modal } from "./Modal";

export const ModalResume = () => {
    const { openModal, closeModal } = useModal();

    const replaceResumeFile = () => {
        closeModal("modalCv");
        openModal("modalUploadResume");
    }

    return (
        <Modal id="modalCv" title="Curriculum Vitae" showButtonOptions={false}>
            <div className="flex flex-col">
                <h3 className="text-[#71717A] text-sm mt-6">Curriculum Vitae</h3>
                <div className="my-8 flex flex-col justify-center w-fit items-center relative self-center">
                    <img src="/assets/ic_pdf_info.svg" alt="icon pdf" className="w-48 h-48" />
                    <p className="text-[#71717A] text-xs my-2 text-ellipsis max-w-40 line-clamp-1">CV username userlastname userlastname userlastname</p>
                    <button type="button" className="hover:shadow-lg hover:rounded-full hover:bg-gray-100" onClick={replaceResumeFile}>
                        <img src="/assets/ic_edit.svg" alt="icon edit" className="absolute right-0 top-0 w-6 h-6" />
                    </button>
                    <button type="button" className="hover:shadow-lg hover:rounded-full hover:bg-gray-100">
                        <img src="/assets/ic_show_pass.svg" alt="icon eye" className="absolute right-0 bottom-1" />
                    </button>
                </div>
            </div>
        </Modal>
    );
}