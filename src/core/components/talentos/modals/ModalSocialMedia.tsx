import { useRef, useState } from "react";
import { Modal } from "@/core/components/modals/Modal";
import { TalentSocialMediaParams } from "@/core/models/params/TalentUpdateParams";
import { BaseResponse } from "@/core/models";
import { useApi } from "@/core/hooks/useApi";
import { handleError, handleResponse } from "@/core/utilities/errorHandler";
import { enqueueSnackbar } from "notistack";
import { useModal } from "@/core/context/ModalContext";
import { updateTalentSocialMedia } from "@/core/services/talents.service";
import { Loading } from "@/core/components/ui/Loading";
import { validateGitHubURL, validateLinkedInURL } from "@/core/utilities/validation";
import { Input } from "@/core/components/ui/shadcn/input";

interface Props {
    idTalento?: number
    linkedin?: string;
    github?: string;
    onUpdate?: (idTalento: number) => void;
}

export const ModalSocialMedia = ({ idTalento, linkedin, github, onUpdate }: Props) => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const linkedinRef = useRef<HTMLInputElement>(null);
    const githubRef = useRef<HTMLInputElement>(null);
    const { closeModal } = useModal();

    const { loading, fetch: updateData } = useApi<BaseResponse, TalentSocialMediaParams>(updateTalentSocialMedia, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    const handleOnConfirm = () => {
        setErrors({});
        const newErrors: { [key: string]: string } = {};
        if (linkedinRef.current && githubRef.current && idTalento) {
            const linkedinURL = linkedinRef.current.value.trim();
            const githubURL = githubRef.current.value.trim();

            const linkedinValidation = validateLinkedInURL(linkedinURL);
            if (linkedinURL !== "" && !linkedinValidation.isValid) {
                newErrors.linkedin = linkedinValidation.message || "Error de validación.";
            }

            const githubValidation = validateGitHubURL(githubURL);
            if (githubURL !== "" && !githubValidation.isValid) {
                newErrors.github = githubValidation.message || "Error de validación.";
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            updateData({ idTalento: idTalento, linkedin: linkedinURL, github: githubURL })
                .then((response) => {
                    if (response.data.idMensaje === 2) {
                        if (onUpdate) onUpdate(idTalento);
                        closeModal("modalSocialMedia");
                    }
                });
        }
    }

    return (
        <Modal id="modalSocialMedia" title="Modifica tus medios sociales" confirmationLabel="Editar" onConfirm={handleOnConfirm}>
            {loading && (<Loading opacity="opacity-60" />)}
            <div>
                <h3 className="text-[#71717A] text-sm mt-6 dark:text-slate-400">Agrega y muestra tus medios sociales</h3>
                <div className="flex flex-col my-2">
                    <label htmlFor="linkedin" className="input-label">LinkedIn</label>
                    <Input type="text" id="linkedin" name="linkedin" ref={linkedinRef} defaultValue={linkedin} />
                    {errors.linkedin && <p className="text-red-500 text-sm mt-2">{errors.linkedin}</p>}
                </div>
                <div className="flex flex-col my-2">
                    <label htmlFor="github" className="input-label">Github</label>
                    <Input type="text" id="github" name="github" ref={githubRef} defaultValue={github} />
                    {errors.github && <p className="text-red-500 text-sm mt-2">{errors.github}</p>}
                </div>
            </div>
        </Modal>
    );
}