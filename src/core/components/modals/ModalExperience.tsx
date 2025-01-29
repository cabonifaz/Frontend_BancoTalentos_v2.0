import { Modal } from "./Modal";

export const ModalExperience = () => {
    return (
        <Modal id="modalExperience" title="Agrega una nueva experiencia" confirmationLabel="Agregar">
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">Describe y agrega tu nueva experiencia laboral.</h3>
                <div className="flex flex-col my-2">
                    <label htmlFor="companyName" className="text-[#37404c] text-base my-2">Empresa</label>
                    <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        placeholder="Nombre de la empresa"
                        className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />

                    <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                        <input type="checkbox" name="currentCompany" id="currentCompany" className="accent-[#4F46E5] h-5 w-5 cursor-pointer" />
                        <label htmlFor="currentCompany" className="cursor-pointer text-[#3f3f46] text-base">Aquí en Fractal</label>
                    </div>
                </div>
                <div className="flex flex-col my-2">
                    <label htmlFor="area" className="text-[#37404c] text-base my-2">Puesto</label>
                    <input
                        type="text"
                        id="area"
                        name="area"
                        placeholder="Puesto"
                        className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="initDate" className="text-[#37404c] text-base my-2">Año y mes de inicio</label>
                        <input
                            type="month"
                            name="initDate"
                            id="initDate"
                            className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                        <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                            <input type="checkbox" name="currentDate" id="currentDate" className="accent-[#4F46E5] h-5 w-5 cursor-pointer" />
                            <label htmlFor="currentDate" className="cursor-pointer text-[#3f3f46] text-base">Hasta la actualidad</label>
                        </div>
                    </div>
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="endDate" className="text-[#37404c] text-base my-2">Año y mes de fin</label>
                        <input
                            type="month"
                            name="endDate"
                            id="endDate"
                            className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                    </div>
                </div>
                <div className="flex flex-col my-2">
                    <label htmlFor="job" className="text-[#37404c] text-base my-2">Funciones</label>
                    <textarea
                        name="job"
                        id="job"
                        placeholder="Digitar funciones"
                        className="h-44 p-3 resize-none border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]">
                    </textarea>
                </div>
            </div>
        </Modal>
    );
}