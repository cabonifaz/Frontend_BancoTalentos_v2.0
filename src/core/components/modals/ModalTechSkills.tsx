import { enqueueSnackbar } from "notistack";
import { useParamContext } from "../../context/ParamsContext";
import { useApi } from "../../hooks/useApi";
import { BaseResponse } from "../../models";
import { TalentTechSkillParams } from "../../models/params/TalentUpdateParams";
import { addTalentTechSkill } from "../../services/apiService";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { Modal } from "./Modal";
import { useModal } from "../../context/ModalContext";
import { Loading } from "../ui/Loading";
import { useRef, useState } from "react";
import { validateSkill, validateYears } from "../../utilities/validation";

interface Props {
    idTalento?: number;
    onUpdate?: (idTalento: number) => void;
}

export const ModalTechSkills = ({ idTalento, onUpdate }: Props) => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { paramsByMaestro } = useParamContext();
    const { closeModal } = useModal();
    const abilityRef = useRef<HTMLSelectElement>(null);
    const aniosRef = useRef<HTMLInputElement>(null);

    const habilidadesTecnicas = paramsByMaestro[19] || [];

    const { loading, fetch: addData } = useApi<BaseResponse, TalentTechSkillParams>(addTalentTechSkill, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    const handleOnConfirm = () => {
        setErrors({});
        const newErrors: { [key: string]: string } = {};
        if (abilityRef.current && aniosRef.current && idTalento) {
            const ability = Number(abilityRef.current.value);
            const anios = Number(aniosRef.current.value);

            const skillValidation = validateSkill(ability);
            if (!skillValidation.isValid) {
                newErrors.skill = skillValidation.message || "Error de validación.";
            }

            const yearsValidation = validateYears(anios);
            if (!yearsValidation.isValid) {
                newErrors.years = yearsValidation.message || "Error de validación.";
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            addData({
                idTalento: idTalento,
                idHabilidad: ability,
                anios: anios
            }).then((response) => {
                if (response.data.idMensaje === 2) {
                    if (onUpdate) onUpdate(idTalento);
                    closeModal("modalTechSkills");
                }
            });
        }
    }

    return (
        <Modal id="modalTechSkills" title="Agregar habilidad técnica" confirmationLabel="Agregar" onConfirm={handleOnConfirm}>
            {loading && (<Loading opacity="opacity-60" />)}
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">Agrega tu nueva experiencia técnica</h3>
                <div className="flex flex-col my-2">
                    <label htmlFor="techSkill" className="text-[#71717A] text-sm px-1">Habilidad técnica</label>
                    <select
                        id="techSkill"
                        ref={abilityRef}
                        className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]">
                        <option value={0}>Seleccione una habilidad</option>
                        {habilidadesTecnicas.map((habilidad) => (
                            <option key={habilidad.idParametro} value={habilidad.num1}>
                                {habilidad.string1}
                            </option>
                        ))}
                    </select>
                    {errors.skill && <p className="text-red-500 text-sm mt-2">{errors.skill}</p>}
                </div>
                <div className="flex flex-col my-2">
                    <label htmlFor="skillYears" className="text-[#71717A] text-sm px-1">Años de experiencia</label>
                    <input
                        id="skillYears"
                        type="number"
                        ref={aniosRef}
                        onFocus={(e) => e.target.select()}
                        placeholder="Nro. años"
                        className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />

                    {errors.years && <p className="text-red-500 text-sm mt-2">{errors.years}</p>}
                </div>
            </div>
        </Modal>
    );
}