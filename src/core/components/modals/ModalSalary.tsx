import { useRef, useState, ChangeEvent, useEffect } from "react";
import { useParams } from "../../context/ParamsContext";
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
import { MODALIDAD_PLANILLA, MODALIDAD_RXH } from "../../utilities/constants";

interface Props {
    idTalento?: number;
    idMoneda?: number;
    idModalidadFacturacion?: number;
    moneda?: string;
    initPlan?: number;
    endPlan?: number;
    initRxH?: number;
    endRxH?: number;
    updateTalentList?: (idTalento: number, fields: Partial<Talent>) => void;
}

export const ModalSalary = ({ idTalento, idMoneda, moneda, initPlan, endPlan, initRxH, endRxH, idModalidadFacturacion, updateTalentList }: Props) => {
    const { paramsByMaestro } = useParams();
    const { closeModal } = useModal();
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [inputValues, setInputValues] = useState({
        montoInicial: '0',
        montoFinal: '0',
    });

    useEffect(() => {
        const newMontoInicial = idModalidadFacturacion === MODALIDAD_RXH
            ? initRxH?.toString()
            : initPlan?.toString();

        const newMontoFinal = idModalidadFacturacion === MODALIDAD_RXH
            ? endRxH?.toString()
            : endPlan?.toString();

        // Solo actualiza si los valores no son undefined
        if (newMontoInicial !== undefined && newMontoFinal !== undefined) {
            setInputValues({
                montoInicial: newMontoInicial,
                montoFinal: newMontoFinal,
            });
        }
    }, [idModalidadFacturacion, initPlan, endPlan, initRxH, endRxH]);

    const currencyRef = useRef<HTMLSelectElement>(null);
    const modalidadFacturacionRef = useRef<HTMLSelectElement>(null);

    const { loading, fetch: updateData } = useApi<BaseResponse, TalentSalaryParams>(updateTalentSalary, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar })
    });

    const monedas = paramsByMaestro[2] || [];
    const modalidadFacturacion = paramsByMaestro[32] || [];

    const handleNumberChange = (e: ChangeEvent<HTMLInputElement>, fieldName: keyof typeof inputValues) => {
        let inputValue = e.target.value;

        if (/^(\d+\.?\d*|\.\d+)$/.test(inputValue) || inputValue === "") {
            if (inputValue.includes('.')) {
                const parts = inputValue.split('.');
                if (parts[1].length > 2) {
                    inputValue = parts[0] + '.' + parts[1].substring(0, 2);
                }
            }

            setInputValues(prev => ({
                ...prev,
                [fieldName]: inputValue
            }));
        } else if (inputValue === ".") {
            setInputValues(prev => ({
                ...prev,
                [fieldName]: "0."
            }));
        }
    };

    const handleOnConfirm = () => {
        setErrors({});
        const newErrors: { [key: string]: string } = {};

        if (currencyRef.current && idTalento) {
            const idCurrency = Number(currencyRef.current.value);
            const modalidadFacturacion = Number(modalidadFacturacionRef.current?.value);
            const initPlanilla = modalidadFacturacion === MODALIDAD_PLANILLA ? Number(inputValues.montoInicial) : 0;
            const endPlanilla = modalidadFacturacion === MODALIDAD_PLANILLA ? Number(inputValues.montoFinal) : 0;
            const initRxH = modalidadFacturacion === MODALIDAD_RXH ? Number(inputValues.montoInicial) : 0;
            const endRxH = modalidadFacturacion === MODALIDAD_RXH ? Number(inputValues.montoFinal) : 0;

            const currencyValidation = validateCurrency(idCurrency);
            if (!currencyValidation.isValid) {
                newErrors.currency = currencyValidation.message || "Error de validación.";
            }

            const montoInicialValidation = validateSalary(Number(inputValues.montoInicial));
            if (!montoInicialValidation.isValid) {
                newErrors.initPlan = montoInicialValidation.message || "Error de validación.";
            }

            const montoFinalValidation = validateSalary(Number(inputValues.montoFinal));
            if (!montoFinalValidation.isValid) {
                newErrors.endPlan = montoFinalValidation.message || "Error de validación.";
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
                montoFinalRxH: endRxH,
                idModalidadFacturacion: modalidadFacturacion
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
                                    idModalidadFacturacion: modalidadFacturacion,
                                    montoInicialPlanilla: initPlanilla,
                                    montoFinalPlanilla: endPlanilla,
                                    montoInicialRxH: initRxH,
                                    montoFinalRxH: endRxH
                                }
                            );
                        }
                    }
                }
            );
        }
    }

    return (
        <Modal id="modalSalary" title="Modifica tu banda salarial" confirmationLabel="Editar" onConfirm={handleOnConfirm}>
            {loading && (<Loading opacity="opacity-60" />)}
            <div>
                <h3 className="text-[#71717A] text-sm my-3">Agrega el rango de tus espectativas salariales.</h3>
                <div className="flex flex-col gap-1">
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
                    <label htmlFor="modalidadFacturacion" className="input-label">Modalidad de facturación</label>
                    <select
                        id="modalidadFacturacion"
                        ref={modalidadFacturacionRef}
                        defaultValue={idModalidadFacturacion || 0}
                        className="text-[#3f3f46] p-3 w-full border boder-gray-300 rounded-lg focus:outline-none cursor-pointer">
                        <option value={0}>Seleccione la modalidad de facturación</option>
                        {modalidadFacturacion.map((mod) => (
                            <option key={mod.idParametro} value={mod.num1}>
                                {mod.string1}
                            </option>
                        ))}
                    </select>
                </div>
                <h3 className="w-full my-2">Montos</h3>
                <div className="flex w-full gap-8">
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="montoInicial" className="input-label">Monto inicial</label>
                        <input
                            type="text"
                            value={inputValues.montoInicial}
                            onChange={(e) => handleNumberChange(e, 'montoInicial')}
                            onWheel={(e) => e.currentTarget.blur()}
                            onFocus={(e) => e.currentTarget.select()}
                            name="montoInicial"
                            className="input"
                            inputMode="decimal" />
                        {errors.montoInicial && <p className="text-red-500 text-sm mt-2">{errors.montoInicial}</p>}
                    </div>
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="montoFinal" className="input-label">Monto final</label>
                        <input
                            type="text"
                            value={inputValues.montoFinal}
                            onChange={(e) => handleNumberChange(e, 'montoFinal')}
                            name="montoFinal"
                            onFocus={(e) => e.currentTarget.select()}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="input"
                            inputMode="decimal" />
                        {errors.montoFinal && <p className="text-red-500 text-sm mt-2">{errors.montoFinal}</p>}
                    </div>
                </div>
            </div>
        </Modal>
    );
}