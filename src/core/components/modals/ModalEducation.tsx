import { Modal } from "./Modal";

export const ModalEducation = () => {
    return (
        <Modal id="modalEducation" title="Agrega una nueva experiencia educativa" confirmationLabel="Agregar">
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">Describe y agrega tu nueva experiencia educativa.</h3>
                <div className="flex flex-col my-2">
                    <label htmlFor="entity" className="text-[#37404c] text-base my-2">Institución</label>
                    <input
                        type="text"
                        id="entity"
                        name="entity"
                        placeholder="Nombre de la institución"
                        className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                    <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                        <input type="checkbox" name="currentEntity" id="currentEntity" className="accent-[#4F46E5] h-5 w-5 cursor-pointer" />
                        <label htmlFor="currentEntity" className="cursor-pointer text-[#3f3f46] text-base">Aquí en Fractal</label>
                    </div>
                </div>
                <div className="flex flex-col my-2">
                    <label htmlFor="major" className="text-[#37404c] text-base my-2">Carrera</label>
                    <input
                        type="text"
                        id="major"
                        name="major"
                        placeholder="Carrera"
                        className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                </div>
                <div className="flex flex-col my-2">
                    <label htmlFor="degree" className="text-[#37404c] text-base my-2">Grado</label>
                    <input
                        type="text"
                        id="degree"
                        name="degree"
                        placeholder="Grado"
                        className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="initDateEducation" className="text-[#37404c] text-base my-2">Mes y año de inicio</label>
                        <input
                            type="month"
                            name="initDateEducation"
                            id="initDateEducation"
                            className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                        <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                            <input type="checkbox" name="currentDate" id="currentDate" className="accent-[#4F46E5] h-5 w-5 cursor-pointer" />
                            <label htmlFor="currentDate" className="cursor-pointer text-[#3f3f46] text-base">Hasta la actualidad</label>
                        </div>
                    </div>
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="endDateEducation" className="text-[#37404c] text-base my-2">Mes y año de fin</label>
                        <input
                            type="month"
                            name="endDateEducation"
                            id="endDateEducation"
                            className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                    </div>
                </div>
            </div>
        </Modal>
    );
}