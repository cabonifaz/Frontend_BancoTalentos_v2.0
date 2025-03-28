import { enqueueSnackbar } from "notistack";
import { useRef, useState } from "react";
import { useModal } from "../../context/ModalContext";
import { useParamContext } from "../../context/ParamsContext";
import { useApi } from "../../hooks/useApi";
import { BaseResponse } from "../../models";
import { TalentSoftSkillParams } from "../../models/params/TalentUpdateParams";
import { addTalentSoftSkill } from "../../services/apiService";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { Modal } from "./Modal";
import { Loading } from "../ui/Loading";
import { validateSkill } from "../../utilities/validation";

interface Props {
    idTalento?: number;
    onUpdate?: (idTalento: number) => void;
}

export const ModalSoftSkills = ({ idTalento, onUpdate }: Props) => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { paramsByMaestro } = useParamContext();
    const { closeModal } = useModal();
    const abilityRef = useRef<HTMLSelectElement>(null);

    const habilidadesBlandas = paramsByMaestro[20] || [];

    const { loading, fetch: addData } = useApi<BaseResponse, TalentSoftSkillParams>(addTalentSoftSkill, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    const handleOnConfirm = () => {
        setErrors({});
        const newErrors: { [key: string]: string } = {};
        if (abilityRef.current && idTalento) {
            const ability = Number(abilityRef.current.value);

            const skillValidation = validateSkill(ability);
            if (!skillValidation.isValid) {
                newErrors.skill = skillValidation.message || "Error de validación.";
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            addData({
                idTalento: idTalento,
                idHabilidad: ability,
            }).then((response) => {
                if (response.data.idMensaje === 2) {
                    if (onUpdate) onUpdate(idTalento);
                    closeModal("modalSoftSkills");
                }
            });
        }
    }

    return (
        <Modal id="modalSoftSkills" title="Agregar habilidad blanda" confirmationLabel="Agregar" onConfirm={handleOnConfirm}>
            {loading && (<Loading opacity="opacity-60" />)}
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">Agrega tu nueva habilidad blanda</h3>
                <div className="flex flex-col my-2">
                    <label htmlFor="softSkill" className="text-[#37404c] text-base my-2">Habilidad blanda</label>
                    <select
                        id="softSkill"
                        ref={abilityRef}
                        className="input">
                        <option value={0}>Seleccione una habilidad</option>
                        {habilidadesBlandas.map((habilidad) => (
                            <option key={habilidad.idParametro} value={habilidad.num1}>
                                {habilidad.string1}
                            </option>
                        ))}
                    </select>
                    {errors.skill && <p className="text-red-500 text-sm mt-2">{errors.skill}</p>}
                </div>
            </div>
        </Modal>
    );
}