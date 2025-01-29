import { Modal } from "./Modal";

export const ModalSoftSkills = () => {
    return (
        <Modal id="modalSoftSkills" title="Agregar habilidad blanda" confirmationLabel="Agregar">
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">Agrega tu nueva habilidad blanda</h3>
                <div className="flex flex-col my-2">
                    <label htmlFor="softSkill" className="text-[#37404c] text-base my-2">Habilidad blanda</label>
                    <input
                        type="text"
                        name="softSkill"
                        placeholder="Ingrese su habilidad blanda"
                        className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                </div>
            </div>
        </Modal>
    );
}