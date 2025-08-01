import { useEffect, useState } from "react";
import { AddOrUpdateExperienceParams, BaseResponse, Experience } from "../../models";
import { Modal } from "./Modal";
import { Utils } from "../../utilities/utils";
import { useApi } from "../../hooks/useApi";
import { enqueueSnackbar } from "notistack";
import { addOrUpdateTalentExperience, deleteTalenteExperience } from "../../services/apiService";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { useModal } from "../../context/ModalContext";
import { Loading } from "../ui/Loading";
import { validateDates, validateText } from "../../utilities/validation";

interface Props {
    idTalento?: number;
    experienceRef: React.MutableRefObject<Experience | null>;
    onUpdate?: (idTalento: number) => void;
}

export const ModalExperience = ({ idTalento, onUpdate, experienceRef }: Props) => {
    const isEditing = !!experienceRef.current;
    const { closeModal } = useModal();
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [empresa, setEmpresa] = useState(experienceRef.current?.nombreEmpresa || "");
    const [puesto, setPuesto] = useState(experienceRef.current?.puesto || "");
    const [fechaInicio, setFechaInicio] = useState(Utils.formatDateForMonthInput(experienceRef.current?.fechaInicio) || "");
    const [fechaFin, setFechaFin] = useState(Utils.formatDateForMonthInput(experienceRef.current?.fechaFin) || "");
    const [funciones, setFunciones] = useState(experienceRef.current?.funciones || "");
    const [empresaCheck, setEmpresaCheck] = useState(false);
    const [dateCheck, setDateCheck] = useState(experienceRef.current?.flActualidad || false);

    const { loading: addOrUpdateLoading, fetch: addOrUpdateData } = useApi<BaseResponse, AddOrUpdateExperienceParams>(addOrUpdateTalentExperience, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    const { loading: deleteLoading, fetch: deleteData } = useApi<BaseResponse, number>(deleteTalenteExperience, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    useEffect(() => {
        if (experienceRef.current) {
            setEmpresa(experienceRef.current.nombreEmpresa || "");
            setPuesto(experienceRef.current.puesto || "");
            setFechaInicio(Utils.formatDateForMonthInput(experienceRef.current.fechaInicio) || "");
            setFechaFin(Utils.formatDateForMonthInput(experienceRef.current.fechaFin) || "");
            setFunciones(experienceRef.current.funciones || "");
            setDateCheck(experienceRef.current.flActualidad || false);
        } else {
            setEmpresa("");
            setPuesto("");
            setFechaInicio("");
            setFechaFin("");
            setFunciones("");
            setDateCheck(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [experienceRef.current]);

    useEffect(() => {
        if (empresaCheck) {
            setEmpresa("Fractal");
        } else {
            setEmpresa("");
        }
    }, [empresaCheck]);

    useEffect(() => {
        if (dateCheck) {
            setFechaFin("");
        }
    }, [dateCheck]);

    const handleOnConfirm = () => {
        setErrors({});
        const newErrors: { [key: string]: string } = {};

        if (idTalento) {
            const empresaValidation = validateText(empresa);
            if (!empresaValidation.isValid) {
                newErrors.empresa = empresaValidation.message || "Error de validación.";
            }

            const puestoValidation = validateText(puesto);
            if (!puestoValidation.isValid) {
                newErrors.puesto = puestoValidation.message || "Error de validación.";
            }

            const datesValidation = validateDates(fechaInicio, fechaFin, dateCheck);
            if (!datesValidation.isValid) {
                newErrors.fechas = datesValidation.message || "Error de validación.";
            }

            const funcionesValidation = validateText(funciones);
            if (!funcionesValidation.isValid) {
                newErrors.funciones = funcionesValidation.message || "Error de validación.";
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            let data: AddOrUpdateExperienceParams = {
                idTalento: idTalento,
                empresa: empresa,
                puesto: puesto,
                funciones: funciones,
                fechaInicio: fechaInicio,
                fechaFin: fechaFin,
                flActualidad: dateCheck ? 1 : 0,
            };

            if (isEditing && experienceRef.current) {
                data = {
                    idExperiencia: experienceRef.current.idExperiencia,
                    ...data
                };
            }

            addOrUpdateData(data).then((response) => {
                if (response.data.idMensaje === 2) {
                    if (onUpdate) onUpdate(idTalento);
                    closeModal("modalExperience");
                }
            });
        }
    };

    const handleOnDelete = () => {
        if (experienceRef.current && idTalento) {
            deleteData(experienceRef.current.idExperiencia).then((response) => {
                if (response.data.idMensaje === 2) {
                    if (onUpdate) onUpdate(idTalento);
                    closeModal("modalExperience");
                }
            });
        }
    };

    return (
        <Modal id="modalExperience" title={isEditing ? "Editar experiencia" : "Agregar experiencia"} confirmationLabel={isEditing ? "Actualizar" : "Agregar"} onConfirm={handleOnConfirm}>
            {(addOrUpdateLoading || deleteLoading) && (<Loading opacity="opacity-60" />)}
            <div className="relative">
                <h3 className="text-[#71717A] text-sm mt-6">Describe tu nueva experiencia laboral.</h3>
                {isEditing && (
                    <button type="button" onClick={handleOnDelete} className="absolute -right-2 top-6 rounded-lg hover:bg-red-50 w-10 h-10">
                        <img src="/assets/ic_delete_bdt.svg" alt="delete icon" className="w-7 h-7 mx-auto" />
                    </button>
                )}
                <div className="flex flex-col my-2">
                    <label htmlFor="companyName" className="input-label">Empresa</label>
                    <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        placeholder="Nombre de la empresa"
                        disabled={empresaCheck}
                        className="input" />
                    {errors.empresa && <p className="text-red-500 text-sm mt-2">{errors.empresa}</p>}

                    <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                        <input
                            type="checkbox"
                            name="currentCompany"
                            checked={empresaCheck}
                            onChange={(e) => setEmpresaCheck(e.target.checked)}
                            id="currentCompany"
                            className="input-checkbox" />
                        <label htmlFor="currentCompany" className="cursor-pointer input-label">Aquí en Fractal</label>
                    </div>
                </div>
                <div className="flex flex-col my-2">
                    <label htmlFor="puesto" className="input-label">Puesto</label>
                    <input
                        type="text"
                        id="puesto"
                        name="puesto"
                        value={puesto}
                        onChange={(e) => setPuesto(e.target.value)}
                        placeholder="Puesto"
                        className="input" />
                    {errors.puesto && <p className="text-red-500 text-sm mt-2">{errors.puesto}</p>}
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="initDate" className="input-label">Fecha de inicio</label>
                        <input
                            type="date"
                            name="initDate"
                            id="initDate"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="input" />
                        <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                            <input
                                type="checkbox"
                                checked={dateCheck}
                                onChange={(e) => setDateCheck(e.target.checked)}
                                name="currentDate"
                                id="currentDate"
                                className="input-checkbox" />
                            <label htmlFor="currentDate" className="cursor-pointer input-label">Hasta la actualidad</label>
                        </div>
                    </div>
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="endDate" className="text-[#37404c] input-label">Fecha de fin</label>
                        <input
                            type="date"
                            name="endDate"
                            id="endDate"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            disabled={dateCheck}
                            className="input" />
                    </div>
                </div>
                {errors.fechas && <p className="text-red-500 text-sm mt-2">{errors.fechas}</p>}
                <div className="flex flex-col my-2">
                    <label htmlFor="funciones" className="input-label">Funciones</label>
                    <textarea
                        name="funciones"
                        id="funciones"
                        value={funciones}
                        onChange={(e) => setFunciones(e.target.value)}
                        placeholder="Digitar funciones"
                        className="input resize-none">
                    </textarea>
                    {errors.funciones && <p className="text-red-500 text-sm mt-2">{errors.funciones}</p>}
                </div>
            </div>
        </Modal>
    );
};