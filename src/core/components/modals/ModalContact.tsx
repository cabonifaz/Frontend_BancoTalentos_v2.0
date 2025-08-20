import { enqueueSnackbar } from "notistack";
import { Modal } from "./Modal";
import { useApi } from "../../hooks/useApi";
import { BaseResponse } from "../../models";
import { updateTalentContact } from "../../services/apiService";
import { TalentContactParams } from "../../models/params/TalentUpdateParams";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { useRef, useState, useEffect } from "react";
import { Loading } from "../ui/Loading";
import { useModal } from "../../context/ModalContext";
import { validateEmail, validatePhone } from "../../utilities/validation";

interface Props {
  idTalento?: number;
  email?: string;
  phone?: string;
  onUpdate?: (idTalento: number) => void;
}

export const ModalContact = ({
  idTalento,
  email = "",
  phone = "",
  onUpdate,
}: Props) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [emailValue, setEmailValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const codeRef = useRef<HTMLParagraphElement>(null);
  const { closeModal } = useModal();

  const { loading, fetch: updateData } = useApi<
    BaseResponse,
    TalentContactParams
  >(updateTalentContact, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) =>
      handleResponse({
        response: response,
        showSuccessMessage: true,
        enqueueSnackbar: enqueueSnackbar,
      }),
  });

  // Sincronizar el estado con las props cuando cambien
  useEffect(() => {
    setEmailValue(email || "");
    setPhoneValue(phone ? phone.split(" ")[1] || "" : "");
    validateFields(email || "", phone ? phone.split(" ")[1] || "" : "");
  }, [email, phone]);

  // Validar en tiempo real
  useEffect(() => {
    validateFields(emailValue, phoneValue);
  }, [emailValue, phoneValue]);

  const validateFields = (email: string, phone: string) => {
    const newErrors: { [key: string]: string } = {};

    // Validar email
    if (!email.trim()) {
      newErrors.email = "El correo electrónico es requerido";
    } else {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        newErrors.email = emailValidation.message || "Error de validación.";
      }
    }

    // Validar teléfono
    if (!phone.trim()) {
      newErrors.phone = "El número de celular es requerido";
    } else {
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.isValid) {
        newErrors.phone = phoneValidation.message || "Error de validación.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailValue(e.target.value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneValue(e.target.value);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        enqueueSnackbar("Copiado", { variant: "success" });
      })
      .catch(() => {
        enqueueSnackbar("Error al copiar", { variant: "error" });
      });
  };

  const handleOnConfirm = () => {
    const isValid = validateFields(emailValue, phoneValue);

    if (!isValid || !idTalento) {
      return;
    }

    const fullPhone = `${codeRef.current?.textContent || "+00"} ${phoneValue.trim()}`;

    updateData({
      idTalento: idTalento,
      telefono: fullPhone,
      email: emailValue.trim(),
    }).then((response) => {
      if (response.data.idMensaje === 2) {
        if (onUpdate) onUpdate(idTalento);
        closeModal("modalContact");
      }
    });
  };

  const handleCloseModal = () => {
    // Restaurar los valores originales al cerrar/cancelar
    setEmailValue(email || "");
    setPhoneValue(phone ? phone.split(" ")[1] || "" : "");
    setErrors({});
    closeModal("modalContact");
  };

  return (
    <Modal
      id="modalContact"
      title="Métodos de Contacto"
      confirmationLabel="Actualizar"
      onConfirm={handleOnConfirm}
      onClose={handleCloseModal}
    >
      {loading && <Loading opacity="opacity-60" />}
      <div className="flex flex-col mt-6 gap-4">
        <div className="flex flex-col w-full">
          <label htmlFor="email" className="input-label">
            Correo Electrónico
          </label>
          <div className="flex">
            <input
              type="text"
              name="email"
              value={emailValue}
              onChange={handleEmailChange}
              className="w-[93%] input"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(emailValue)}
              className="w-12 h-12 p-3 ms-4 bg-[#4F46E5] rounded-lg"
            >
              <img
                src="/assets/ic_copy.svg"
                alt="icon copy"
                className="invert-[1]"
              />
            </button>
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-2">{errors.email}</p>
          )}
        </div>
        <div className="flex flex-col">
          <label htmlFor="phone" className="input-label">
            Número de Celular
          </label>
          <div className="flex">
            <div className="flex w-[93%]">
              <p
                ref={codeRef}
                className="rounded-l-lg border-l border-t border-b px-3 border-gray-300 bg-gray-100 flex items-center"
              >
                {phone ? phone.split(" ")[0] : "+00"}
              </p>
              <input
                type="text"
                name="phone"
                value={phoneValue}
                onChange={handlePhoneChange}
                className="p-3 border-gray-300 border rounded-r-lg w-full focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  `${codeRef.current?.textContent || "+00"} ${phoneValue}`,
                )
              }
              className="w-12 h-12 ms-4 p-3 bg-[#4F46E5] rounded-lg justify-self-end"
            >
              <img
                src="/assets/ic_copy.svg"
                alt="icon copy"
                className="invert-[1]"
              />
            </button>
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm mt-2">{errors.phone}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};
