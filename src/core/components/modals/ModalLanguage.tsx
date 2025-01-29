import { Modal } from "./Modal";

export const ModalLanguage = () => {
    return (
        <Modal id="modalLanguage" title="Agrega un nuevo idioma" confirmationLabel="Agregar">
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">Agregar un nuevo idioma aprendido.</h3>
                <div className="flex flex-col my-2">
                    <label htmlFor="language" className="text-[#37404c] text-base my-2">Idioma</label>
                    <select
                        id="language"
                        name="language"
                        className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]">
                        <option value={0}>Nombre del idioma</option>
                        <option value={1}>Español</option>
                        <option value={2}>Inglés</option>
                        <option value={3}>Francés</option>
                    </select>
                </div>
                <div className="flex flex-col my-2">
                    <label htmlFor="proficiency" className="text-[#37404c] text-base my-2">Nivel</label>
                    <select
                        id="proficiency"
                        name="proficiency"
                        className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]">
                        <option value={0}>Nivel del idioma</option>
                        <option value={1}>Básico</option>
                        <option value={2}>Intermedio</option>
                        <option value={3}>Avanzado</option>
                        <option value={4}>Nativo</option>
                    </select>
                </div>
                <div id="rating-container" className="flex items-center my-6 gap-2 *:cursor-pointer">
                    <div className="star" data-index="1">
                        <img src="/assets/ic_outline_star.svg" alt="Star 1" className="star-icon w-6 h-6" />
                    </div>
                    <div className="star" data-index="2">
                        <img src="/assets/ic_outline_star.svg" alt="Star 2" className="star-icon w-6 h-6" />
                    </div>
                    <div className="star" data-index="3">
                        <img src="/assets/ic_outline_star.svg" alt="Star 3" className="star-icon w-6 h-6" />
                    </div>
                    <div className="star" data-index="4">
                        <img src="/assets/ic_outline_star.svg" alt="Star 4" className="star-icon w-6 h-6" />
                    </div>
                    <div className="star" data-index="5">
                        <img src="/assets/ic_outline_star.svg" alt="Star 5" className="star-icon w-6 h-6" />
                    </div>
                </div>
            </div>
        </Modal>
    );
}