import { Copy, MessageCircle } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { Modal } from "../../modals/Modal";
import { useApi } from "../../../hooks/useApi";
import { BaseResponse, Param } from "../../../models";
import { updateTalentContact } from "../../../services/talents.service";
import { TalentContactParams } from "../../../models/params/TalentUpdateParams";
import { handleError, handleResponse } from "../../../utilities/errorHandler";
import { useState, useEffect, useMemo } from "react";
import { Loading } from "../../ui/Loading";
import { useModal } from "../../../context/ModalContext";
import { validateEmail, validatePhone } from "../../../utilities/validation";
import { useParams } from "../../../context/ParamsContext";

const EMPTY_COUNTRIES: Param[] = [];

const splitPhone = (phone: string) => {
  const [first, ...rest] = (phone || "").trim().split(/\s+/);
  return first.startsWith("+")
    ? { code: first, number: rest.join(" ") }
    : { code: "", number: (phone || "").trim() };
};

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
  const [phoneCode, setPhoneCode] = useState("");
  const { paramsByMaestro, loading: loadingParams, error: paramsError } = useParams();
  const countries = paramsByMaestro[12] || EMPTY_COUNTRIES;
  const phoneCodes = useMemo(
    () => Array.from(
      new Set(
        countries
          .map((country) => country.string3?.trim())
          .filter((code): code is string => !!code),
      ),
    ),
    [countries],
  );
  const { closeModal, isModalOpen } = useModal();
  const isOpen = isModalOpen("modalContact");

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
    const originalPhone = splitPhone(phone);
    setPhoneValue(originalPhone.number);
    setPhoneCode(originalPhone.code);
  }, [email, phone, isOpen]);

  // Validar en tiempo real
  useEffect(() => {
    validateFields(emailValue, phoneValue);
  }, [emailValue, phoneValue, phoneCode, phoneCodes]);

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

    if (!phoneCodes.includes(phoneCode)) {
      newErrors.phoneCode = "Seleccione un código de país del catálogo";
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

  // wa.me exige solo dígitos: sin "+", espacios ni guiones
  const whatsappNumber = `${phoneCode}${phoneValue}`.replace(/\D/g, "");
  const canOpenWhatsapp =
    !errors.phone &&
    phoneValue.trim() !== "" &&
    phoneCodes.includes(phoneCode) &&
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

    if (!isValid || !idTalento || loading || loadingParams || paramsError) {
      return;
    }

    const fullPhone = `${phoneCode} ${phoneValue.trim()}`;

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
    const originalPhone = splitPhone(phone);
    setPhoneValue(originalPhone.number);
    setPhoneCode(originalPhone.code);
    setErrors({});
    closeModal("modalContact");
  };

  return (
    <Modal
      id="modalContact"
      title="Métodos de Contacto"
      confirmationLabel="Actualizar"
      busy={loading}
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
              <select
                aria-label="Código de país"
                value={phoneCode}
                onChange={(event) => setPhoneCode(event.target.value)}
                disabled={loadingParams || !!paramsError}
                title={countries.filter((country) => country.string3?.trim() === phoneCode).map((country) => country.string1).join(" / ")}
                className="w-28 sm:w-40 min-w-0 shrink-0 truncate rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 px-3 py-3 text-sm text-gray-700 outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              >
                <option value="">Seleccione</option>
                {phoneCode && !phoneCodes.includes(phoneCode) && (
                  <option value={phoneCode} disabled>{phoneCode} (fuera del catálogo)</option>
                )}
                {phoneCodes.map((code) => (
                  <option key={code} value={code}>
                    {code} — {countries.filter((country) => country.string3?.trim() === code).map((country) => country.string1).join(" / ")}
                  </option>
                ))}
              </select>
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
                  `${phoneCode} ${phoneValue}`,
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
          {paramsError && <p className="text-red-500 text-sm mt-2">No se pudo cargar el catálogo de códigos de país.</p>}
          {errors.phoneCode && <p className="text-red-500 text-sm mt-2">{errors.phoneCode}</p>}
          {errors.phone && (
            <p className="text-red-500 text-sm mt-2">{errors.phone}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};
