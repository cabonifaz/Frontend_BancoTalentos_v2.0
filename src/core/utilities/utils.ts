import { format, isValid, parse } from "date-fns";
import { createElement, ReactNode } from "react";
import { Star } from "lucide-react";
import { Param } from "../models";

type fileNameType = string | undefined | null;

export class Utils {
  static getPriorityValueFromParams = (values?: Param[]): number => {
    if (!values || values.length === 0) return 0;

    // buscamos el primer item con prioridad (num2 = 1)
    const prioritized = values.find((item) => item.num2 === 1);
    if (prioritized) return prioritized.num1;

    // fallback: usamos el primer valor disponible
    return values[0].num1 ?? 0;
  };

  static getStars = (rating: number): ReactNode[] => {
    const getFilledStar = (key: string): ReactNode => {
      return createElement(Star, {
        color: "#faab34",
        fill: "#faab34",
        className: "h-5 w-5",
        key: key,
      });
    };

    const getOutlinedStar = (key: string): ReactNode => {
      return createElement(Star, {
        color: "#faab34",
        className: "h-5 w-5",
        key: key,
      });
    };

    const stars: ReactNode[] = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        i < rating
          ? getFilledStar(`${i}`)
          : getOutlinedStar(`${i + 5}`),
      );
    }
    return stars;
  };

  static isValidToken = (token?: string): boolean => {
    if (!token) return false;

    const decodedToken = this.decodeJwt(token);
    if (!decodedToken) {
      localStorage.removeItem("token");
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp && decodedToken.exp > currentTime) {
      return true;
    }

    localStorage.removeItem("token");
    return false;
  };

  static removeToken = (): void => {
    localStorage.removeItem("token");
  };

  /**
   * Devuelve las rutas frontend permitidas para el usuario a partir del JWT.
   * El claim `routes` proviene de la base de datos (PARAMETROS, ID_MAESTRO=49) y
   * es la única fuente de autorización de rutas.
   */
  static getUserRoutes = (token?: string): string[] => {
    if (!token) return [];
    const decoded = this.decodeJwt(token);
    const raw = decoded?.routes;
    if (!Array.isArray(raw)) return [];
    return raw.filter((r: unknown): r is string => typeof r === "string");
  };

  static decodeJwt = (token: string): any => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(
            (c) =>
              `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`,
          )
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Error decoding token:", err);
      return null;
    }
  };

  static buildQueryString = (params: Record<string, any>): string => {
    const queryParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    }

    return queryParams.toString();
  };

  static getImageSrc = (base64String: string) => {
    const formato = this.detectarFormatoDesdeBase64(base64String);
    const base64WithPrefix = this.addBase64ImagePrefix(
      base64String,
      formato,
    );

    if (this.isValidImageBase64(base64WithPrefix)) {
      return base64WithPrefix;
    }
    return "/assets/ic_no_image.svg";
  };

  static detectarFormatoDesdeBase64 = (imageBase64String: string) => {
    if (imageBase64String.startsWith("iVBORw0KGgo")) {
      return "png";
    } else if (imageBase64String.startsWith("/9j/4AAQSkZJRg")) {
      return "jpeg";
    }

    return "jpeg";
  };

  static isValidImageBase64 = (base64String: string) => {
    return /^data:image\/(jpeg|png|jpg);base64,[A-Za-z0-9+/=]+$/.test(
      base64String,
    );
  };

  static addBase64ImagePrefix = (
    base64String: string,
    formato: string,
  ) => {
    if (base64String && !base64String.startsWith("data:image/")) {
      return `data:image/${formato};base64,${base64String}`;
    }
    return base64String;
  };

  static splitDateAsNumbers = (date?: string | null) => {
    if (!date?.trim()) {
      return { day: "", month: "", year: "" };
    }

    // DMY Format
    const [day, month, year] = date.split("-");

    return { day: day, month: month, year: year };
  };

  static fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        const pureBase64 = base64String.split(",")[1];

        resolve(pureBase64);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };

  static getFileNameWithoutExtension = (
    fileName: fileNameType,
  ): string => {
    if (!fileName) return "";

    const parts = fileName.split(".");

    if (parts.length === 1) return fileName;

    return parts.slice(0, -1).join(".");
  };

  static formatDateForMonthInput = (date: string | undefined) => {
    if (!date || date === undefined) return "";

    const [day, month, year] = date.split("/");
    return `${month}/${year}`;
  };

  static formatDateForYearInput = (date: string | undefined | null): string => {
    if (!date) return "";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return date.split("/")[2];
    if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date.substring(0, 4);
    return "";
  };

  static openPdfDocument(archivoB64: string) {
    const byteCharacters = atob(archivoB64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");
    URL.revokeObjectURL(url);
  }

  static getFileNameAndExtension = (
    fileName: fileNameType,
  ): { nombreArchivo: string; extensionArchivo: string } => {
    if (!fileName) return { nombreArchivo: "", extensionArchivo: "" };

    const lastDotIndex = fileName.lastIndexOf(".");

    if (lastDotIndex === -1) {
      return { nombreArchivo: fileName, extensionArchivo: "" };
    }

    const nombreArchivo = fileName.slice(0, lastDotIndex);
    const extensionArchivo = fileName.slice(lastDotIndex + 1);

    return { nombreArchivo, extensionArchivo };
  };

  static getTipoArchivoId = (
    extension: string,
    paramsFiles: Param[],
  ): number => {
    const matchedParam = paramsFiles.find(
      (param) =>
        param.string2.toLowerCase() === extension.toLowerCase(),
    );

    if (matchedParam) return matchedParam.num1;
    else
      throw new Error(`Tipo de archivo no soportado: ${extension}, 
        pida al administrador que lo agregue a la lista de tipos de archivo. En parámetros.`);
  };

  static formatDateToDMY = (dateString: string): string => {
    if (!dateString) return "";
    return dateString.split("-").reverse().join("-");
  };

  static formatDateForInput = (dateString: string) => {
    if (!dateString) return "";

    try {
      // Parsear desde formato DD/MM/YYYY
      const date = parse(dateString, "dd/MM/yyyy", new Date());

      // Validar que la fecha sea correcta
      if (!isValid(date)) return "";

      // Formatear a YYYY-MM-DD
      return format(date, "yyyy-MM-dd");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  static formatMonthYear = (
    dateString: string,
    originalFormat = "dd/MM/yyyy",
  ) => {
    if (!dateString) return "";

    try {
      // Parsear desde el formato original (por defecto DD/MM/YYYY)
      const date = parse(dateString, originalFormat, new Date());

      if (!isValid(date)) return dateString;

      // Formatear a MM/YYYY
      return format(date, "MM/yyyy");
    } catch (error) {
      console.error("Error formatting month/year:", error);
      return "";
    }
  };

  static formatDisponibilidad(
    mdIds: string | null | undefined,
  ): string {
    // Cotejar con la tabla maestro
    const modalidades: Record<number, string> = {
      1: "Presencial",
      2: "Remoto",
      3: "Híbrido",
    };

    // Normalizamos: null, undefined, vacío o solo espacios
    if (!mdIds || mdIds.trim() === "") return "No específicado";

    const ids = mdIds.split(",").map((id) => id.trim());

    if (ids.length === 0) return "No específicado";

    const mdNames = ids.map(
      (id) => modalidades[Number(id)] ?? `Desconocida (${id})`,
    );

    return mdNames.join(", ");
  }

  static formatDegree(degree: string | null | undefined): string {
    // Cotejar con la tabla maestra
    const degrees = {
      1: "Bachiller",
      2: "Título",
      3: "Curso",
      4: "Técnico",
      5: "Egresado",
      6: "Estudiante",
    } as Record<number, string>;

    if (!degree || degree.trim() === "") return "No específicado";

    return degrees[Number(degree)] ?? `Grado desc. (${degree})`;
  }

  static formatCoinByNum1(num1: number | undefined) {
    // Cotejar con la tabla maestra PARAMETROS
    const coins = {
      1: {
        string1: "NUEVO SOL",
        string2: "PEN",
        string3: "S/.",
      },
      2: {
        string1: "DÓLAR AMERICANO",
        string2: "USD",
        string3: "$",
      },
      3: {
        string1: "SIN MONEDA",
        string2: "S/M",
        string3: null,
      },
    } as Record<
      number,
      { string1: string; string2: string; string3: string | null }
    >;

    if (!num1) return { ...coins[3], string3: "S/M" };

    return coins[num1] ?? { ...coins[3], string3: "S/M" };
  }

  static formatCoin(coinValue: number): string {
    // Check if the input is a valid finite number
    if (
      typeof coinValue !== "number" ||
      !isFinite(coinValue) ||
      isNaN(coinValue)
    ) {
      return "-";
    }

    // Initialize Intl.NumberFormat with specific options:
    const formatter = new Intl.NumberFormat("en-US", {
      // Use 'decimal' style for regular number formatting (not currency symbol)
      style: "decimal",

      // Ensure there are always exactly 2 digits after the decimal point
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,

      // Ensure thousand separators are used (this is default behavior for 'en-US',
      // but explicitly stating it is good practice if needed)
      useGrouping: true,
    });

    return formatter.format(coinValue);
  }
}
