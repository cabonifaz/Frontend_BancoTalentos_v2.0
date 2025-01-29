import { Modal } from "./Modal";

export const ModalSocialMedia = () => {
    return (
        <Modal id="modalSocialMedia" title="Modifica tus medios sociales" confirmationLabel="Editar">
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">Agrega y muestra tus medios sociales</h3>
                <div className="flex flex-col my-2">
                    <label htmlFor="linkedin" className="text-[#37404c] text-base my-2">LinkedIn</label>
                    <input type="text" name="linkedin" className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                </div>
                <div className="flex flex-col my-2">
                    <label htmlFor="github" className="text-[#37404c] text-base my-2">Github</label>
                    <input type="text" name="github" className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                </div>
            </div>
        </Modal>
    );
}