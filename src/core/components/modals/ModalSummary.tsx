import { Modal } from "./Modal";

export const ModalSummary = () => {
    return (
        <Modal id="modalSummary" title="Edita tu resumen profesional" confirmationLabel="Editar">
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">¿Tiempo para un nuevo resumen?. Edítelo</h3>
                <div className="flex flex-col my-2">
                    <label htmlFor="summary" className="text-[#37404c] text-base my-2">Resumen profesional</label>
                    <textarea
                        name="summary"
                        id="summary"
                        className="h-44 p-3 resize-none border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]">
                    </textarea>
                </div>
            </div>
        </Modal>
    );
}