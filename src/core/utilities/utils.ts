import { format, isValid, parse } from "date-fns";
import { createElement, ReactNode } from "react";

type fileNameType = string | undefined | null;

enum TipoArchivo {
  PDF = 1,
  WORD = 2,
  EXCEL = 3,
}

export class Utils {
  static getStars = (rating: number): ReactNode[] => {
    const getFilledStar = (key: string): ReactNode => {
      return createElement("img", {
        src: "/assets/ic_fill_star.svg",
        alt: "filled star icon",
        className: "h-5 w-5",
        key: key,
      });
    };

    const getOutlinedStar = (key: string): ReactNode => {
      return createElement("img", {
        src: "/assets/ic_outline_star.svg",
        alt: "outlined star icon",
        className: "h-5 w-5",
        key: key,
      });
    };

    const stars: ReactNode[] = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        i < rating ? getFilledStar(`${i}`) : getOutlinedStar(`${i + 5}`),
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

  static decodeJwt = (token: string): any => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
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
    const base64WithPrefix = this.addBase64ImagePrefix(base64String, formato);

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

  static addBase64ImagePrefix = (base64String: string, formato: string) => {
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

  static getFileNameWithoutExtension = (fileName: fileNameType): string => {
    if (!fileName) return "";

    const parts = fileName.split(".");

    if (parts.length === 1) return fileName;

    return parts.slice(0, -1).join(".");
  };

  static formatDateForMonthInput = (date: string | undefined) => {
    if (!date || date === undefined) return "";

    const [month, year] = date.split("/");
    return `${year}-${month}-01`;
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

  static getTipoArchivoId = (extension: string): number => {
    switch (extension.toLowerCase()) {
      case "pdf":
        return TipoArchivo.PDF;
      case "doc":
      case "docx":
        return TipoArchivo.WORD;
      case "xls":
      case "xlsx":
        return TipoArchivo.EXCEL;
      default:
        throw new Error(`Tipo de archivo no soportado: ${extension}`);
    }
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
}
