import { Modal } from "./Modal";

export const ModalUploadResume = () => {
    return (
        <Modal id="modalUploadResume" title="Editar Curriculum Vitae" confirmationLabel="Subir">
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">Sube tu nuevo Curriculum Vitae.</h3>
                <div className="rounded-lg overflow-hidden py-4">
                    <div className="w-full">
                        <div className="relative h-32 rounded-lg border-2 border-gray-100 flex justify-center items-center hover:bg-gray-100">
                            <div className="absolute flex flex-col items-center py-12">
                                <img
                                    alt="File Icon"
                                    className="mb-3 mt-6 w-8 h-8"
                                    src="/assets/ic_upload.svg"
                                />
                                <span className="block text-[#0b85c3] font-normal mt-1">
                                    Sube un archivo
                                </span>
                                <span className="text-sm text-[#71717A] mb-6">PDF (max. 5MB)</span>
                            </div>
                            <input
                                type="file"
                                name="user-photo"
                                accept=".pdf"
                                className="h-full w-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}