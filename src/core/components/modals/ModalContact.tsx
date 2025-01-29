import { Modal } from "./Modal";

export const ModalContact = () => {
    return (
        <Modal id="modalContact" title="Métodos de Contacto" confirmationLabel="Actualizar">
            <div className="flex flex-col mt-6 gap-4">
                <div className="flex flex-col gap-2 w-full">
                    <label htmlFor="email" className="w-full">Correo Electrónico</label>
                    <div className="flex">
                        <input type="text" name="email" className="p-3 border-gray-300 border-2 rounded-lg w-[93%] focus:outline-none focus:border-[#4F46E5]" />
                        <button type="button" className="w-12 h-12 p-3 ms-4 bg-[#4F46E5] rounded-lg">
                            <img src="/assets/ic_copy.svg" alt="icon copy" className="invert-[1]" />
                        </button>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="w-full">Número de Celular</label>
                    <div className="flex">
                        <div className="flex w-[93%]">
                            <p className="rounded-l-lg border-l-2 border-t-2 border-b-2 px-3 border-gray-300 bg-gray-100 flex items-center">+51</p>
                            <input type="text" name="phone" className="p-3 border-gray-300 border-2 rounded-r-lg w-full focus:outline-none focus:border-[#4F46E5]" />
                        </div>
                        <button type="button" className="w-12 h-12 ms-4 p-3 bg-[#4F46E5] rounded-lg justify-self-end">
                            <img src="/assets/ic_copy.svg" alt="icon copy" className="invert-[1]" />
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}