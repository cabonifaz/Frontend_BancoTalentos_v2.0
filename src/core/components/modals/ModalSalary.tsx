import { useRef, useState } from "react";
import { useParamContext } from "../../context/ParamsContext";
import { Modal } from "./Modal";
import { useModal } from "../../context/ModalContext";
import { useApi } from "../../hooks/useApi";
import { TalentSalaryParams } from "../../models/params/TalentUpdateParams";
import { BaseResponse, Talent } from "../../models";
import { enqueueSnackbar } from "notistack";
import { updateTalentSalary } from "../../services/apiService";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { Loading } from "../ui/Loading";
import { validateCurrency, validateSalary } from "../../utilities/validation";

interface Props {
    idTalento?: number;
    idMoneda?: number;
    moneda?: string;
    initPlan?: number;
    endPlan?: number;
    initRxH?: number;
    endRxH?: number;
    updateTalentList?: (idTalento: number, fields: Partial<Talent>) => void;
}

export const ModalSalary = ({ idTalento, idMoneda, moneda, initPlan, endPlan, initRxH, endRxH, updateTalentList }: Props) => {
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
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar })
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
            }).then(
                (response) => {
                    if (response.data.idMensaje === 2) {
                        closeModal("modalSalary");
                        if (idTalento && updateTalentList && currencyRef.current) {
                            const selectedIndex = currencyRef.current.selectedIndex;
                            const selectedOption = currencyRef.current.options[selectedIndex];

                            updateTalentList(
                                idTalento,
                                {
                                    moneda: selectedOption.getAttribute('data-code') ?? moneda,
                                    montoInicialPlanilla: initPlanRef.current?.value ? Number(initPlanRef.current.value) : initPlan,
                                    montoFinalPlanilla: endPlanRef.current?.value ? Number(endPlanRef.current.value) : endPlan,
                                    montoInicialRxH: initRxHRef.current?.value ? Number(initRxHRef.current.value) : initRxH,
                                    montoFinalRxH: endRxHRef.current?.value ? Number(endRxHRef.current.value) : endRxH
                                }
                            );
                        }
                    }
                }
            );
        }
    }

    return (
        <Modal id="modalSalary" title="Modifica to banda salarial" confirmationLabel="Editar" onConfirm={handleOnConfirm}>
            {loading && (<Loading opacity="opacity-60" />)}
            <div>
                <h3 className="text-[#71717A] text-sm my-6">Agrega el rango de tus espectativas salariales.</h3>
                <label htmlFor="currency" className="input-label">Moneda</label>
                <select
                    id="currency"
                    ref={currencyRef}
                    name="currency"
                    defaultValue={idMoneda || 0}
                    className="input w-full">
                    <option value={0}>Seleccione una moneda</option>
                    {monedas.map((moneda) => (
                        <option key={moneda.idParametro} value={moneda.num1} data-code={moneda.num1 === 3 ? moneda.string2 : moneda.string3}>
                            {moneda.string1}
                        </option>
                    ))}
                </select>
                {errors.currency && <p className="text-red-500 text-sm mt-2">{errors.currency}</p>}
                <h3 className="w-full my-2">Monto por RXH</h3>
                <div className="flex w-full gap-8">
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="initRxH" className="input-label">Monto inicial</label>
                        <input
                            type="number"
                            ref={initRxHRef}
                            defaultValue={initRxH}
                            onWheel={(e) => e.currentTarget.blur()}
                            onFocus={(e) => e.currentTarget.select()}
                            min={0}
                            name="initRxH"
                            className="input" />
                        {errors.initRxH && <p className="text-red-500 text-sm mt-2">{errors.initRxH}</p>}
                    </div>
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="endRxH" className="input-label">Monto final</label>
                        <input
                            type="number"
                            ref={endRxHRef}
                            defaultValue={endRxH}
                            name="endtRxH"
                            onFocus={(e) => e.currentTarget.select()}
                            min={0}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="input" />
                        {errors.endRxH && <p className="text-red-500 text-sm mt-2">{errors.endRxH}</p>}
                    </div>
                </div>
                <h3 className="w-full mb-2 mt-6">Monto por planilla</h3>
                <div className="flex w-full gap-8">
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="initPlanilla" className="input-label">Monto inicial</label>
                        <input
                            type="number"
                            ref={initPlanRef}
                            defaultValue={initPlan}
                            onWheel={(e) => e.currentTarget.blur()}
                            onFocus={(e) => e.currentTarget.select()}
                            min={0}
                            name="initPlanilla" className="input" />
                        {errors.initPlan && <p className="text-red-500 text-sm mt-2">{errors.initPlan}</p>}
                    </div>
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="endPlanilla" className="input-label">Monto final</label>
                        <input
                            type="number"
                            ref={endPlanRef}
                            defaultValue={endPlan}
                            name="endPlanilla"
                            onWheel={(e) => e.currentTarget.blur()}
                            onFocus={(e) => e.currentTarget.select()}
                            min={0}
                            className="input" />
                        {errors.endPlan && <p className="text-red-500 text-sm mt-2">{errors.endPlan}</p>}
                    </div>
                </div>
            </div>
        </Modal>
    );
}