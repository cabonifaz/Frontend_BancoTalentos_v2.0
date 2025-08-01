import { useEffect, useState } from "react";
import { useModal } from "../../context/ModalContext";
import { AddOrUpdateEducationParams, BaseResponse, Education } from "../../models";
import { Modal } from "./Modal";
import { useApi } from "../../hooks/useApi";
import { enqueueSnackbar } from "notistack";
import { addOrUpdateTalentEducation, deleteTalenteEducation } from "../../services/apiService";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { Loading } from "../ui/Loading";
import { Utils } from "../../utilities/utils";
import { validateDates, validateText } from "../../utilities/validation";

interface Props {
    idTalento?: number;
    educationRef: React.MutableRefObject<Education | null>;
    onUpdate?: (idTalento: number) => void;
}

export const ModalEducation = ({ idTalento, educationRef, onUpdate }: Props) => {
    const isEditing = !!educationRef.current;
    const { closeModal } = useModal();
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [institucion, setInstitucion] = useState(educationRef.current?.nombreInstitucion || "");
    const [carrera, setCarrera] = useState(educationRef.current?.carrera || "");
    const [grado, setGrado] = useState(educationRef.current?.grado || "");
    const [fechaInicio, setFechaInicio] = useState(Utils.formatDateForMonthInput(educationRef.current?.fechaInicio) || "");
    const [fechaFin, setFechaFin] = useState(Utils.formatDateForMonthInput(educationRef.current?.fechaFin) || "");
    const [institucionCheck, setInstitucionCheck] = useState(false);
    const [dateCheck, setDateCheck] = useState(educationRef.current?.flActualidad || false);

    const { loading: addOrUpdateLoading, fetch: addOrUpdateData } = useApi<BaseResponse, AddOrUpdateEducationParams>(addOrUpdateTalentEducation, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    const { loading: deleteLoading, fetch: deleteData } = useApi<BaseResponse, number>(deleteTalenteEducation, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    useEffect(() => {
        if (educationRef.current) {
            setInstitucion(educationRef.current.nombreInstitucion || "");
            setCarrera(educationRef.current.carrera || "");
            setGrado(educationRef.current.grado || "");
            setFechaInicio(Utils.formatDateForMonthInput(educationRef.current.fechaInicio) || "");
            setFechaFin(Utils.formatDateForMonthInput(educationRef.current.fechaFin) || "");
            setDateCheck(educationRef.current.flActualidad || false);
        } else {
            setInstitucion("");
            setCarrera("");
            setGrado("");
            setFechaInicio("");
            setFechaFin("");
            setDateCheck(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [educationRef.current]);

    useEffect(() => {
        if (institucionCheck) {
            setInstitucion("Fractal");
        } else {
            setInstitucion("");
        }
    }, [institucionCheck]);

    useEffect(() => {
        if (dateCheck) {
            setFechaFin("");
        }
    }, [dateCheck]);

    const handleOnConfirm = () => {
        setErrors({});
        const newErrors: { [key: string]: string } = {};

        if (idTalento) {
            const institucionValidation = validateText(institucion);
            if (!institucionValidation.isValid) {
                newErrors.institucion = institucionValidation.message || "Error de validación.";
            }

            const carreraValidation = validateText(carrera);
            if (!carreraValidation.isValid) {
                newErrors.carrera = carreraValidation.message || "Error de validación.";
            }

            const gradoValidation = validateText(grado);
            if (!gradoValidation.isValid) {
                newErrors.grado = gradoValidation.message || "Error de validación.";
            }

            const datesValidation = validateDates(fechaInicio, fechaFin, dateCheck);
            if (!datesValidation.isValid) {
                newErrors.fechasEdu = datesValidation.message || "Error de validación.";
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            let data: AddOrUpdateEducationParams = {
                idTalento: idTalento,
                institucion: institucion,
                carrera: carrera,
                grado: grado,
                fechaInicio: fechaInicio,
                fechaFin: fechaFin,
                flActualidad: dateCheck ? 1 : 0,
            };

            if (isEditing && educationRef.current) {
                data = {
                    idTalentoEducacion: educationRef.current.idEducacion,
                    ...data
                };
            }

            addOrUpdateData(data).then((response) => {
                if (response.data.idMensaje === 2) {
                    if (onUpdate) onUpdate(idTalento);
                    closeModal("modalEducation");
                }
            });
        }
    };

    const handleOnDelete = () => {
        if (educationRef.current && idTalento) {
            deleteData(educationRef.current.idEducacion).then((response) => {
                if (response.data.idMensaje === 2) {
                    if (onUpdate) onUpdate(idTalento);
                    closeModal("modalEducation");
                }
            });
        }
    };

    return (
        <Modal id="modalEducation" title={isEditing ? "Editar educación" : "Agregar educación"} confirmationLabel={isEditing ? "Actualizar" : "Agregar"} onConfirm={handleOnConfirm}>
            {(addOrUpdateLoading || deleteLoading) && (<Loading opacity="opacity-60" />)}
            <div className="relative">
                <h3 className="text-[#71717A] text-sm mt-6">Describe y agrega tu nueva experiencia educativa.</h3>
                {isEditing && (
                    <button type="button" onClick={handleOnDelete} className="absolute -right-2 top-6 rounded-lg hover:bg-red-50 w-10 h-10">
                        <img src="/assets/ic_delete_bdt.svg" alt="delete icon" className="w-7 h-7 mx-auto" />
                    </button>
                )}
                <div className="flex flex-col my-2">
                    <label htmlFor="institucion" className="input-label">Institución</label>
                    <input
                        type="text"
                        id="institucion"
                        name="institucion"
                        value={institucion}
                        onChange={(e) => setInstitucion(e.target.value)}
                        placeholder="Nombre de la institución"
                        disabled={institucionCheck}
                        className="input" />

                    {errors.institucion && <p className="text-red-500 text-sm mt-2">{errors.institucion}</p>}
                    <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                        <input
                            type="checkbox"
                            name="currentEntity"
                            checked={institucionCheck}
                            onChange={(e) => setInstitucionCheck(e.target.checked)}
                            id="currentEntity"
                            className="input-checkbox" />
                        <label htmlFor="currentEntity" className="cursor-pointer input-label">Aquí en Fractal</label>
                    </div>
                </div>
                <div className="flex flex-col my-2">
                    <label htmlFor="carrera" className="input-label">Carrera</label>
                    <input
                        type="text"
                        id="carrera"
                        name="carrera"
                        value={carrera}
                        onChange={(e) => setCarrera(e.target.value)}
                        placeholder="Carrera"
                        className="input" />

                    {errors.carrera && <p className="text-red-500 text-sm mt-2">{errors.carrera}</p>}
                </div>
                <div className="flex flex-col my-2">
                    <label htmlFor="grado" className="input-label">Grado</label>
                    <input
                        type="text"
                        id="grado"
                        name="grado"
                        value={grado}
                        onChange={(e) => setGrado(e.target.value)}
                        placeholder="Grado"
                        className="input" />

                    {errors.grado && <p className="text-red-500 text-sm mt-2">{errors.grado}</p>}
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="initDateEducation" className="input-label">Mes y año de inicio</label>
                        <input
                            type="date"
                            name="initDateEducation"
                            id="initDateEducation"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="input" />
                        <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                            <input
                                type="checkbox"
                                name="currentDate"
                                checked={dateCheck}
                                onChange={(e) => setDateCheck(e.target.checked)}
                                id="currentDate"
                                className="input-checkbox" />
                            <label htmlFor="currentDate" className="cursor-pointer input-label">Hasta la actualidad</label>
                        </div>
                    </div>
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="endDateEducation" className="input-label">Mes y año de fin</label>
                        <input
                            type="date"
                            name="endDateEducation"
                            id="endDateEducation"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            disabled={dateCheck}
                            className="input" />
                    </div>
                </div>
                {errors.fechasEdu && <p className="text-red-500 text-sm mt-2">{errors.fechasEdu}</p>}
            </div>
        </Modal>
    );
};