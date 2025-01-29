import { Modal } from "./Modal";

export const ModalSalary = () => {
    return (
        <Modal id="modalSalary" title="Modifica to banda salarial" confirmationLabel="Editar">
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">Agrega el rango de tus espectativas salariales.</h3>
                <select name="currency" id="currency" className="w-full my-4 h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]">
                    <option value={1}>Nuevo Sol</option>
                    <option value={2}>Dólar Americano</option>
                </select>
                <h3 className="w-full my-2">Monto por RXH</h3>
                <div className="flex w-full gap-8">
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="initRxH" className="text-[#71717A] text-sm my-2">Monto inicial</label>
                        <input type="text" name="initRxH" className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                    </div>
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="endRxH" className="text-[#71717A] text-sm my-2">Monto final</label>
                        <input type="text" name="endtRxH" className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                    </div>
                </div>
                <h3 className="w-full mb-2 mt-6">Monto por planilla</h3>
                <div className="flex w-full gap-8">
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="initPlanilla" className="text-[#71717A] text-sm my-2">Monto inicial</label>
                        <input type="text" name="initPlanilla" className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                    </div>
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="endPlanilla" className="text-[#71717A] text-sm my-2">Monto final</label>
                        <input type="text" name="endPlanilla" className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                    </div>
                </div>
            </div>
        </Modal>
    );
}