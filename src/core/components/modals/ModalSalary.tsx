import { useRef, useState } from "react";
import { useParamContext } from "../../context/ParamsContext";
import { Modal } from "./Modal";
import { useModal } from "../../context/ModalContext";
import { useApi } from "../../hooks/useApi";
import { TalentSalaryParams } from "../../models/params/TalentUpdateParams";
import { BaseResponse } from "../../models";
import { enqueueSnackbar } from "notistack";
import { updateTalentSalary } from "../../services/apiService";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { Loading } from "../ui/Loading";
import { validateCurrency, validateSalary } from "../../utilities/validation";

interface Props {
    idTalento?: number;
    idMoneda?: number;
    initPlan?: number;
    endPlan?: number;
    initRxH?: number;
    endRxH?: number;
    onUpdate?: () => void;
}

export const ModalSalary = ({ idTalento, idMoneda, initPlan, endPlan, initRxH, endRxH, onUpdate }: Props) => {
    const { paramsByMaestro } = useParamContext();
    const { closeModal } = useModal();
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const currencyRef = useRef<HTMLSelectElement>(null);
    const initPlanRef = useRef<HTMLInputElement>(null);
    const endPlanRef = useRef<HTMLInputElement>(null);
    const initRxHRef = useRef<HTMLInputElement>(null);
    const endRxHRef = useRef<HTMLInputElement>(null);

    const { loading, fetch: updateData } = useApi<BaseResponse, TalentSalaryParams>(updateTalentSalary, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => {
            handleResponse(response, enqueueSnackbar);

            if (response.data.idMensaje === 2) {
                if (onUpdate) onUpdate();
                closeModal("modalSalary");
                enqueueSnackbar("Actualizado", { variant: 'success' });
            }
        },
    });

    const monedas = paramsByMaestro[2] || [];

    const handleOnConfirm = () => {
        setErrors({});
        const newErrors: { [key: string]: string } = {};
        if (currencyRef.current && initPlanRef.current && idTalento && endPlanRef.current && initRxHRef.current && endRxHRef.current) {
            const idCurrency = Number(currencyRef.current.value);
            const initPlanilla = Number(initPlanRef.current.value);
            const endPlanilla = Number(endPlanRef.current.value);
            const initRxH = Number(initRxHRef.current.value);
            const endRxH = Number(endRxHRef.current.value);

            const currencyValidation = validateCurrency(idCurrency);
            if (!currencyValidation.isValid) {
                newErrors.currency = currencyValidation.message || "Error de validación.";
            }

            const initPlanValidation = validateSalary(initPlanilla);
            if (!initPlanValidation.isValid) {
                newErrors.initPlan = initPlanValidation.message || "Error de validación.";
            }

            const endPlanValidation = validateSalary(endPlanilla);
            if (!endPlanValidation.isValid) {
                newErrors.endPlan = endPlanValidation.message || "Error de validación.";
            }

            const initRxHValidation = validateSalary(initRxH);
            if (!initRxHValidation.isValid) {
                newErrors.initRxH = initRxHValidation.message || "Error de validación.";
            }

            const endRxHValidation = validateSalary(endRxH);
            if (!endRxHValidation.isValid) {
                newErrors.endRxH = endRxHValidation.message || "Error de validación.";
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            updateData({
                idTalento: idTalento,
                idMoneda: idCurrency,
                montoInicialPlanilla: initPlanilla,
                montoFinalPlanilla: endPlanilla,
                montoInicialRxH: initRxH,
                montoFinalRxH: endRxH
            });
        }
    }

    return (
        <Modal id="modalSalary" title="Modifica to banda salarial" confirmationLabel="Editar" onConfirm={handleOnConfirm}>
            {loading && (<Loading opacity="opacity-60" />)}
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">Agrega el rango de tus espectativas salariales.</h3>
                <select
                    id="currency"
                    ref={currencyRef}
                    defaultValue={idMoneda || 0}
                    className="text-[#3f3f46] p-3 w-full border boder-gray-300 rounded-lg focus:outline-none cursor-pointer">
                    <option value={0}>Seleccione una moneda</option>
                    {monedas.map((moneda) => (
                        <option key={moneda.idParametro} value={moneda.num1}>
                            {moneda.string1}
                        </option>
                    ))}
                </select>
                {errors.currency && <p className="text-red-500 text-sm mt-2">{errors.currency}</p>}
                <h3 className="w-full my-2">Monto por RXH</h3>
                <div className="flex w-full gap-8">
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="initRxH" className="text-[#71717A] text-sm my-2">Monto inicial</label>
                        <input type="number" ref={initPlanRef} defaultValue={initPlan} name="initRxH" className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                        {errors.initPlan && <p className="text-red-500 text-sm mt-2">{errors.initPlan}</p>}
                    </div>
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="endRxH" className="text-[#71717A] text-sm my-2">Monto final</label>
                        <input type="number" ref={endPlanRef} defaultValue={endPlan} name="endtRxH" className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                        {errors.endPlan && <p className="text-red-500 text-sm mt-2">{errors.endPlan}</p>}
                    </div>
                </div>
                <h3 className="w-full mb-2 mt-6">Monto por planilla</h3>
                <div className="flex w-full gap-8">
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="initPlanilla" className="text-[#71717A] text-sm my-2">Monto inicial</label>
                        <input type="number" ref={initRxHRef} defaultValue={initRxH} name="initPlanilla" className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                        {errors.initRxH && <p className="text-red-500 text-sm mt-2">{errors.initRxH}</p>}
                    </div>
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="endPlanilla" className="text-[#71717A] text-sm my-2">Monto final</label>
                        <input type="number" ref={endRxHRef} defaultValue={endRxH} name="endPlanilla" className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                        {errors.endRxH && <p className="text-red-500 text-sm mt-2">{errors.endRxH}</p>}
                    </div>
                </div>
            </div>
        </Modal>
    );
}