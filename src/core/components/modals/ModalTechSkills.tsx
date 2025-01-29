import { Modal } from "./Modal";

export const ModalTechSkills = () => {
    return (
        <Modal id="modalTechSkills" title="Agregar habilidad técnica" confirmationLabel="Agregar">
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">Agrega tu nueva experiencia técnica</h3>
                <div className="flex flex-col my-2">
                    <label htmlFor="techSkill" className="text-[#37404c] text-base my-2">Habilidad técnica</label>
                    <input
                        type="text"
                        name="techSkill"
                        placeholder="Ingrese su habilidad técnica"
                        className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                </div>
                <div className="flex flex-col my-2">
                    <label htmlFor="skillYears" className="text-[#37404c] text-base my-2">Años de experiencia</label>
                    <input
                        type="text"
                        name="skillYears"
                        placeholder="Nro. años"
                        className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                </div>
            </div>
        </Modal>
    );
}