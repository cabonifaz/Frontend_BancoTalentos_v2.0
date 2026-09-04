import { Copy, MessageCircle } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { Modal } from "../../modals/Modal";
import { useApi } from "../../../hooks/useApi";
import { BaseResponse } from "../../../models";
import { updateTalentContact } from "../../../services/talents.service";
import { TalentContactParams } from "../../../models/params/TalentUpdateParams";
import { handleError, handleResponse } from "../../../utilities/errorHandler";
import { useRef, useState, useEffect } from "react";
import { Loading } from "../../ui/Loading";
import { useModal } from "../../../context/ModalContext";
import { validateEmail, validatePhone } from "../../../utilities/validation";

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

  // Código de país mostrado junto al input (mismo valor que renderiza codeRef)
  const phoneCode = phone ? phone.split(" ")[0] : "+00";
  // wa.me exige solo dígitos: sin "+", espacios ni guiones
  const whatsappNumber = `${phoneCode}${phoneValue}`.replace(/\D/g, "");
  const canOpenWhatsapp =
    !errors.phone &&
    phoneValue.trim() !== "" &&
    phoneCode !== "+00" &&
    whatsappNumber.length >= 8;

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
          <div className="flex items-stretch">
            <input
              type="text"
              name="email"
              value={emailValue}
              onChange={handleEmailChange}
              className="flex-1 min-w-0 input"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(emailValue)}
              className="w-12 ms-4 shrink-0 flex items-center justify-center bg-[#4F46E5] rounded-lg"
            >
              <Copy className="w-6 h-6 text-white" />
            </button>
            {/* Hueco que reserva la columna del botón de WhatsApp de la fila de celular */}
            <div className="w-12 ms-2 shrink-0" aria-hidden="true" />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-2">{errors.email}</p>
          )}
        </div>
        <div className="flex flex-col">
          <label htmlFor="phone" className="input-label">
            Número de Celular
          </label>
          <div className="flex items-stretch">
            <div className="flex flex-1 min-w-0">
              <p
                ref={codeRef}
                className="rounded-l-lg border-l border-t border-b px-3 border-gray-300 bg-gray-100 flex items-center dark:border-slate-600 dark:bg-slate-700"
              >
                {phoneCode}
              </p>
              <input
                type="text"
                name="phone"
                value={phoneValue}
                onChange={handlePhoneChange}
                className="p-3 border-gray-300 border rounded-r-lg flex-1 min-w-0 focus:outline-none focus:border-[#4F46E5] dark:border-slate-600"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  `${codeRef.current?.textContent || "+00"} ${phoneValue}`,
                )
              }
              className="w-12 ms-4 shrink-0 flex items-center justify-center bg-[#4F46E5] rounded-lg"
            >
              <Copy className="w-6 h-6 text-white" />
            </button>
            {canOpenWhatsapp ? (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Enviar mensaje por WhatsApp"
                aria-label="Enviar mensaje por WhatsApp"
                className="w-12 ms-2 shrink-0 flex items-center justify-center bg-[#25D366] hover:bg-[#1da851] rounded-lg"
              >
                <MessageCircle className="w-6 h-6 text-white" />
              </a>
            ) : (
              <button
                type="button"
                disabled
                title="Ingresa un número de celular válido con código de país"
                aria-label="Enviar mensaje por WhatsApp"
                className="w-12 ms-2 shrink-0 flex items-center justify-center bg-gray-300 rounded-lg cursor-not-allowed dark:bg-slate-600"
              >
                <MessageCircle className="w-6 h-6 text-white" />
              </button>
            )}
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm mt-2">{errors.phone}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};
