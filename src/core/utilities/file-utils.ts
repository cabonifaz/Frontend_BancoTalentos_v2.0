import { Param } from "../models";

export const downloadAnyFile = (file64: string, ext: string) => {
  // Limpiar la cadena base64
  const cleanBase64 = file64.replace(/\s/g, "");

  // Decodificamos base64 -> bytes
  const byteCharacters = atob(cleanBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  // Creamos un blob genérico
  const blob = new Blob([byteArray]);

  // Creamos URL temporal
  const url = URL.createObjectURL(blob);

  // Simulamos descarga
  const a = document.createElement("a");
  a.href = url;
  a.download = `archivo.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Liberamos la URL temporal
  URL.revokeObjectURL(url);
};

export const allowedFileExtensions = (filesFromParams: Param[]) => {
  const extensions = filesFromParams.map((p) => `.${p.string2}`);
  return extensions.join(", ");
};
