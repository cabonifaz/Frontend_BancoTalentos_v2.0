import { useEffect, useRef, useState } from "react";
import { useModal } from "../../context/ModalContext";
import { useParams } from "../../context/ParamsContext";
import { AddOrUpdateLanguageParams, BaseResponse, Language } from "../../models";
import { Modal } from "./Modal";
import { enqueueSnackbar } from "notistack";
import { useApi } from "../../hooks/useApi";
import { addOrUpdateTalentLanguage, deleteTalenteLanguage } from "../../services/apiService";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { Loading } from "../ui/Loading";
import { validateSelect, validateStars } from "../../utilities/validation";

interface Props {
    idTalento?: number;
    languageRef: React.MutableRefObject<Language | null>;
    onUpdate?: (idTalento: number) => void;
}

export const ModalLanguage = ({ idTalento, languageRef, onUpdate }: Props) => {
    const { paramsByMaestro } = useParams();
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const isEditing = !!languageRef.current;
    const { closeModal, isModalOpen } = useModal();
    const idIdiomaRef = useRef<HTMLSelectElement>(null);
    const idNivelRef = useRef<HTMLSelectElement>(null);
    const [stars, setStars] = useState(0);

    const idiomas = paramsByMaestro[15] || [];
    const nivelesIdioma = paramsByMaestro[16] || [];

    useEffect(() => {
        setStars(languageRef.current?.estrellas || 0);

        return () => {
            setStars(0);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen]);

    const { loading: addOrUpdateLoading, fetch: addOrUpdateData } = useApi<BaseResponse, AddOrUpdateLanguageParams>(addOrUpdateTalentLanguage, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    const { loading: deleteLoading, fetch: deleteData } = useApi<BaseResponse, number>(deleteTalenteLanguage, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    const handleOnConfirm = () => {
        setErrors({});
        const newErrors: { [key: string]: string } = {};
        if (idIdiomaRef.current && idNivelRef.current && idTalento) {
            const idIdioma = Number(idIdiomaRef.current.value);
            const idNivel = Number(idNivelRef.current.value);

            const idiomaValidation = validateSelect(idIdioma);
            if (!idiomaValidation.isValid) {
                newErrors.idioma = idiomaValidation.message || "Error de validación.";
            }

            const nivelValidation = validateSelect(idNivel);
            if (!nivelValidation.isValid) {
                newErrors.nivel = nivelValidation.message || "Error de validación.";
            }

            const starsValidation = validateStars(stars);
            if (!starsValidation.isValid) {
                newErrors.stars = starsValidation.message || "Error de validación.";
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            let data: AddOrUpdateLanguageParams = {
                idTalento: idTalento,
                idIdioma: idIdioma,
                idNivel: idNivel,
                estrellas: stars,
            }

            if (isEditing && languageRef.current) {
                data = {
                    idTalentoIdioma: languageRef.current.idTalentoIdioma,
                    ...data
                }
            }

            addOrUpdateData(data).then((response) => {
                if (response.data.idMensaje === 2) {
                    if (onUpdate) onUpdate(idTalento);
                    closeModal("modalLanguage");
                }
            });
        }
    }

    const handleOnDelete = () => {
        if (languageRef.current && idTalento) {
            deleteData(languageRef.current.idTalentoIdioma).then((response) => {
                if (response.data.idMensaje === 2) {
                    if (onUpdate) onUpdate(idTalento);
                    closeModal("modalLanguage");
                }
            });
        }
    }

    const handleStarClick = (starPosition: number) => {
        if (starPosition === stars) {
            setStars(0);
            return;
        }

        setStars(starPosition);
    }

    return (
        <Modal id="modalLanguage" title={isEditing ? "Editar idioma" : "Agregar idioma"} confirmationLabel={isEditing ? "Actualizar" : "Agregar"} onConfirm={handleOnConfirm}>
            {(addOrUpdateLoading || deleteLoading) && (<Loading opacity="opacity-60" />)}
            <div className="relative">
                <h3 className="text-[#71717A] text-sm mt-6">Agregar un nuevo idioma aprendido.</h3>
                {isEditing && (
                    <button type="button" onClick={handleOnDelete} className="absolute -right-2 top-6 rounded-lg hover:bg-red-50 w-10 h-10">
                        <img src="/assets/ic_delete_bdt.svg" alt="delete icon" className="w-7 h-7 mx-auto" />
                    </button>
                )}
                <div className="flex flex-col my-2">
                    <label htmlFor="language" className="input-label">Idioma</label>
                    <select
                        id="language"
                        name="language"
                        ref={idIdiomaRef}
                        defaultValue={languageRef.current?.idIdioma || 0}
                        className="input">
                        <option value={0}>Nombre del idioma</option>
                        {idiomas.map((idioma) => (
                            <option key={idioma.idParametro} value={idioma.num1}>
                                {idioma.string1}
                            </option>
                        ))}
                    </select>
                    {errors.idioma && <p className="text-red-500 text-sm mt-2">{errors.idioma}</p>}
                </div>
                <div className="flex flex-col my-2">
                    <label htmlFor="proficiency" className="input-label">Nivel</label>
                    <select
                        id="proficiency"
                        name="proficiency"
                        ref={idNivelRef}
                        defaultValue={languageRef.current?.idNivel || 0}
                        className="input">
                        <option value={0}>Nivel del idioma</option>
                        {nivelesIdioma.map((nivel) => (
                            <option key={nivel.idParametro} value={nivel.num1}>
                                {nivel.string1}
                            </option>
                        ))}
                    </select>
                    {errors.nivel && <p className="text-red-500 text-sm mt-2">{errors.nivel}</p>}
                </div>
                <div id="rating-container" className="flex items-center my-6 gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <div
                            key={star}
                            className="star cursor-pointer"
                            onClick={() => handleStarClick(star)}>
                            <img
                                src={stars >= star ? "/assets/ic_fill_star.svg" : "/assets/ic_outline_star.svg"}
                                alt={`Star ${star}`}
                                className="star-icon w-6 h-6"
                            />
                        </div>
                    ))}
                </div>
                {errors.stars && <p className="text-red-500 text-sm mt-2">{errors.stars}</p>}
            </div>
        </Modal>
    );
}