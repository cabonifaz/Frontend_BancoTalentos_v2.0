export const validateFile = (
  file: File | null,
  allowedExtensions: string[],
): { isValid: boolean; message?: string } => {
  if (!file) {
    return { isValid: false, message: "Por favor, selecciona un archivo." };
  }

  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      message: `Formato de archivo no válido. Los formatos permitidos son: ${allowedExtensions.join(", ")}.`,
    };
  }

  return { isValid: true };
};

export const validateEmail = (
  email: string,
): { isValid: boolean; message?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Por favor, introduce un email válido." };
  }
  return { isValid: true };
};

export const validateCurrency = (
  currencyId: number,
): { isValid: boolean; message?: string } => {
  if (currencyId === 0) {
    return { isValid: false, message: "Por favor, selecciona una moneda." };
  }
  return { isValid: true };
};

export const validateModalidadPago = (
  id: number,
): { isValid: boolean; message?: string } => {
  if (id === 0) {
    return {
      isValid: false,
      message: "Por favor, selecciona una modalidad de pago.",
    };
  }
  return { isValid: true };
};

export const validateSalary = (
  salary: number,
): { isValid: boolean; message?: string } => {
  if (isNaN(salary) || salary < 0) {
    return { isValid: false, message: "Por favor, introduce un monto válido." };
  }
  return { isValid: true };
};

export const validatePhone = (
  phone: string,
): { isValid: boolean; message?: string } => {
  if (!phone.trim()) {
    return {
      isValid: false,
      message: "Por favor, introduce un número de teléfono.",
    };
  }
  return { isValid: true };
};

export const validateLinkedInURL = (
  url: string,
): { isValid: boolean; message?: string } => {
  const linkedinRegex =
    /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+\/?$/;
  if (!linkedinRegex.test(url)) {
    return {
      isValid: false,
      message: "Por favor, introduce una URL válida de LinkedIn.",
    };
  }
  return { isValid: true };
};

export const validateGitHubURL = (
  url: string,
): { isValid: boolean; message?: string } => {
  const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+\/?$/;
  if (!githubRegex.test(url)) {
    return {
      isValid: false,
      message: "Por favor, introduce una URL válida de GitHub.",
    };
  }
  return { isValid: true };
};

export const validateSkill = (
  skillId: number,
): { isValid: boolean; message?: string } => {
  if (skillId === 0) {
    return { isValid: false, message: "Por favor, selecciona una habilidad." };
  }
  return { isValid: true };
};

export const validateYears = (
  years: number,
): { isValid: boolean; message?: string } => {
  if (isNaN(years) || years <= 0) {
    return {
      isValid: false,
      message: "Por favor, introduce un número válido de años de experiencia.",
    };
  }
  return { isValid: true };
};

export const validateText = (
  text: string,
): { isValid: boolean; message?: string } => {
  if (!text.trim()) {
    return { isValid: false, message: "Este campo no puede estar vacío." };
  }
  return { isValid: true };
};

export const validateDates = (
  startDate: string,
  endDate: string,
  isCurrent: boolean,
): { isValid: boolean; message?: string } => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  if (!startDate) {
    return { isValid: false, message: "La fecha de inicio es obligatoria." };
  }

  // fecha de inicio no mayor a la fecha actual
  const [startYear, startMonth] = startDate.split("-").map(Number);
  if (
    startYear > currentYear ||
    (startYear === currentYear && startMonth > currentMonth)
  ) {
    return {
      isValid: false,
      message: "La fecha de inicio no puede ser mayor a la fecha actual.",
    };
  }

  if (!isCurrent) {
    if (!endDate) {
      return { isValid: false, message: "La fecha de fin es obligatoria." };
    }

    const [endYear, endMonth] = endDate.split("-").map(Number);

    // fecha de fin no mayor a la fecha actual
    if (
      endYear > currentYear ||
      (endYear === currentYear && endMonth > currentMonth)
    ) {
      return {
        isValid: false,
        message: "La fecha de fin no puede ser mayor a la fecha actual.",
      };
    }

    // fecha de fin no menor a la fecha de inicio
    if (
      endYear < startYear ||
      (endYear === startYear && endMonth < startMonth)
    ) {
      return {
        isValid: false,
        message: "La fecha de fin no puede ser menor a la fecha de inicio.",
      };
    }
  }

  return { isValid: true };
};

export const validateSelect = (
  value: number,
): { isValid: boolean; message?: string } => {
  if (value === 0) {
    return {
      isValid: false,
      message: "Por favor, selecciona una opción válida.",
    };
  }
  return { isValid: true };
};

export const validateStars = (
  stars: number,
): { isValid: boolean; message?: string } => {
  if (stars < 1 || stars > 5) {
    return {
      isValid: false,
      message: "Por favor, selecciona un número de estrellas entre 1 y 5.",
    };
  }
  return { isValid: true };
};
