import { Modal } from "./Modal";

export const ModalAvailability = () => {
    return (
        <Modal id="modalAvailability" title="Edita tu disponibilidad" confirmationLabel="Editar">
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">¿Tiempo de nueva disponibilidad?. Edítela</h3>
                <div className="flex flex-col my-2">
                    <label htmlFor="availability" className="text-[#37404c] text-base my-2">Disponibilidad</label>
                    <input
                        type="text"
                        id="availability"
                        name="availability"
                        placeholder="Disponibilidad"
                        className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                </div>
            </div>
        </Modal>
    );
}