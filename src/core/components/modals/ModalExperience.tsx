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
    onUpdate?: () => void;
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
        onSuccess: (response) => {
            handleResponse(response, enqueueSnackbar);

            if (response.data.idMensaje === 2) {
                if (onUpdate) onUpdate();
                closeModal("modalExperience");
                enqueueSnackbar("Guardado", { variant: 'success' });
            }
        },
    });

    const { loading: deleteLoading, fetch: deleteData } = useApi<BaseResponse, number>(deleteTalenteExperience, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => {
            handleResponse(response, enqueueSnackbar);

            if (response.data.idMensaje === 2) {
                if (onUpdate) onUpdate();
                closeModal("modalExperience");
                enqueueSnackbar("Eliminado", { variant: 'success' });
            }
        },
    });

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
                flActualidad: dateCheck,
            };

            if (isEditing && experienceRef.current) {
                data = {
                    idExperiencia: experienceRef.current.idExperiencia,
                    ...data
                };
            }

            addOrUpdateData(data);
        }
    };

    const handleOnDelete = () => {
        if (experienceRef.current) {
            deleteData(experienceRef.current.idExperiencia);
        }
    };

    return (
        <Modal id="modalExperience" title={isEditing ? "Editar experiencia" : "Agregar experiencia"} confirmationLabel={isEditing ? "Actualizar" : "Agregar"} onConfirm={handleOnConfirm}>
            {(addOrUpdateLoading || deleteLoading) && (<Loading opacity="opacity-60" />)}
            <div className="relative">
                <h3 className="text-[#71717A] text-sm mt-6">Describe tu nueva experiencia laboral.</h3>
                {isEditing && (
                    <button type="button" onClick={handleOnDelete} className="absolute -right-2 top-6 rounded-lg hover:bg-red-50 w-10 h-10">
                        <img src="/assets/ic_delete.svg" alt="delete icon" className="w-7 h-7 mx-auto" />
                    </button>
                )}
                <div className="flex flex-col my-2">
                    <label htmlFor="companyName" className="text-[#37404c] text-base my-2">Empresa</label>
                    <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        placeholder="Nombre de la empresa"
                        disabled={empresaCheck}
                        className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                    {errors.empresa && <p className="text-red-500 text-sm mt-2">{errors.empresa}</p>}

                    <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                        <input
                            type="checkbox"
                            name="currentCompany"
                            checked={empresaCheck}
                            onChange={(e) => setEmpresaCheck(e.target.checked)}
                            id="currentCompany"
                            className="accent-[#4F46E5] h-5 w-5 cursor-pointer" />
                        <label htmlFor="currentCompany" className="cursor-pointer text-[#3f3f46] text-base">Aquí en Fractal</label>
                    </div>
                </div>
                <div className="flex flex-col my-2">
                    <label htmlFor="puesto" className="text-[#37404c] text-base my-2">Puesto</label>
                    <input
                        type="text"
                        id="puesto"
                        name="puesto"
                        value={puesto}
                        onChange={(e) => setPuesto(e.target.value)}
                        placeholder="Puesto"
                        className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                    {errors.puesto && <p className="text-red-500 text-sm mt-2">{errors.puesto}</p>}
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="initDate" className="text-[#37404c] text-base my-2">Mes y año de inicio</label>
                        <input
                            type="date"
                            name="initDate"
                            id="initDate"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                        <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                            <input
                                type="checkbox"
                                checked={dateCheck}
                                onChange={(e) => setDateCheck(e.target.checked)}
                                name="currentDate"
                                id="currentDate"
                                className="accent-[#4F46E5] h-5 w-5 cursor-pointer" />
                            <label htmlFor="currentDate" className="cursor-pointer text-[#3f3f46] text-base">Hasta la actualidad</label>
                        </div>
                    </div>
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="endDate" className="text-[#37404c] text-base my-2">Mes y año de fin</label>
                        <input
                            type="date"
                            name="endDate"
                            id="endDate"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            disabled={dateCheck}
                            className="h-12 p-3 border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                    </div>
                </div>
                {errors.fechas && <p className="text-red-500 text-sm mt-2">{errors.fechas}</p>}
                <div className="flex flex-col my-2">
                    <label htmlFor="funciones" className="text-[#37404c] text-base my-2">Funciones</label>
                    <textarea
                        name="funciones"
                        id="funciones"
                        value={funciones}
                        onChange={(e) => setFunciones(e.target.value)}
                        placeholder="Digitar funciones"
                        className="h-44 p-3 resize-none border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]">
                    </textarea>
                    {errors.funciones && <p className="text-red-500 text-sm mt-2">{errors.funciones}</p>}
                </div>
            </div>
        </Modal>
    );
};