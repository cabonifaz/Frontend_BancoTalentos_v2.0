import { enqueueSnackbar } from "notistack";
import { Modal } from "./Modal";
import { useApi } from "../../hooks/useApi";
import { BaseResponse } from "../../models";
import { updateTalentContact } from "../../services/apiService";
import { TalentContactParams } from "../../models/params/TalentUpdateParams";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { useRef, useState } from "react";
import { Loading } from "../ui/Loading";
import { useModal } from "../../context/ModalContext";
import { validateEmail, validatePhone } from "../../utilities/validation";

interface Props {
    idTalento?: number
    email?: string;
    phone?: string;
    onUpdate?: () => void;
}

export const ModalContact = ({ idTalento, email, phone, onUpdate }: Props) => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const phoneRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const codeRef = useRef<HTMLParagraphElement>(null);
    const { closeModal } = useModal();

    const { loading, fetch: updateData } = useApi<BaseResponse, TalentContactParams>(updateTalentContact, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => {
            handleResponse(response, enqueueSnackbar);

            if (response.data.idMensaje === 2) {
                if (onUpdate) onUpdate();
                closeModal("modalContact");
                enqueueSnackbar("Actualizado", { variant: 'success' });
            }
        },
    });

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                enqueueSnackbar('Copiado', { variant: 'success' });
            })
            .catch(() => {
                enqueueSnackbar('Error al copiar', { variant: 'error' });
            });
    };

    const handleOnConfirm = () => {
        setErrors({});
        const newErrors: { [key: string]: string } = {};
        if (phoneRef.current && emailRef.current && idTalento) {
            const phone = codeRef.current?.textContent + ' ' + phoneRef.current.value.trim();
            const email = emailRef.current.value;

            const emailValidation = validateEmail(email);
            if (!emailValidation.isValid) {
                newErrors.email = emailValidation.message || "Error de validación.";
            }

            const phoneValidation = validatePhone(phoneRef.current.value);
            if (!phoneValidation.isValid) {
                newErrors.phone = phoneValidation.message || "Error de validación.";
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            updateData({ idTalento: idTalento, telefono: phone, email: email });
        }
    }

    return (
        <Modal id="modalContact" title="Métodos de Contacto" confirmationLabel="Actualizar" onConfirm={handleOnConfirm}>
            {loading && (<Loading opacity="opacity-60" />)}
            <div className="flex flex-col mt-6 gap-4">
                <div className="flex flex-col gap-2 w-full">
                    <label htmlFor="email" className="w-full">Correo Electrónico</label>
                    <div className="flex">
                        <input type="text" ref={emailRef} name="email" defaultValue={email} className="p-3 border-gray-300 border rounded-lg w-[93%] focus:outline-none focus:border-[#4F46E5]" />
                        <button
                            type="button"
                            onClick={() => copyToClipboard(email || "")}
                            className="w-12 h-12 p-3 ms-4 bg-[#4F46E5] rounded-lg">
                            <img src="/assets/ic_copy.svg" alt="icon copy" className="invert-[1]" />
                        </button>
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="w-full">Número de Celular</label>
                    <div className="flex">
                        <div className="flex w-[93%]">
                            <p ref={codeRef} className="rounded-l-lg border-l border-t border-b px-3 border-gray-300 bg-gray-100 flex items-center">
                                {phone ? phone.split(' ')[0] : '+00'}
                            </p>
                            <input type="text" ref={phoneRef} name="phone" defaultValue={phone ? phone.split(' ')[1] : '+00'} className="p-3 border-gray-300 border rounded-r-lg w-full focus:outline-none focus:border-[#4F46E5]" />
                        </div>
                        <button
                            type="button"
                            onClick={() => copyToClipboard(phone || "")}
                            className="w-12 h-12 ms-4 p-3 bg-[#4F46E5] rounded-lg justify-self-end">
                            <img src="/assets/ic_copy.svg" alt="icon copy" className="invert-[1]" />
                        </button>
                    </div>
                    {errors.phone && <p className="text-red-500 text-sm mt-2">{errors.phone}</p>}
                </div>
            </div>
        </Modal>
    );
}