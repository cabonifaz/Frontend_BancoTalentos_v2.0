/**
 * Visor de PDFs generados por el backend (formularios de ingreso, movimiento,
 * cese y solicitud de equipo).
 *
 * La pestaña no apunta directamente al `blob:`: una URL de blob no lleva nombre
 * de archivo, así que el visor del navegador propone su UUID al descargar. En
 * su lugar se escribe una página mínima que muestra el PDF y trae su propio
 * botón Descargar, que sí guarda con el nombre real que arma el backend
 * ("Alicia Oroya - FT-GS-01 Solicitud de Creacion de Usuarios.pdf").
 */

export interface PdfArchivo {
  nombreArchivo: string;
  archivoB64: string;
}

/** El backend manda el nombre sin extensión. */
export const pdfFileName = (nombreArchivo?: string): string => {
  const base = (nombreArchivo || "documento").trim();
  return base.toLowerCase().endsWith(".pdf") ? base : `${base}.pdf`;
};

const ENTIDADES_HTML: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escaparHtml = (texto: string): string =>
  texto.replace(/[&<>"']/g, (caracter) => ENTIDADES_HTML[caracter]);

const decodeBase64ToBlob = (base64: string): Blob => {
  const binario = atob(base64.replace(/\s/g, ""));
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i);
  }
  return new Blob([bytes], { type: "application/pdf" });
};

/** Página mínima: barra con el nombre y botón Descargar, y el PDF debajo. */
const paginaVisor = (blobUrl: string, nombre: string): string => {
  const nombreSeguro = escaparHtml(nombre);
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>${nombreSeguro}</title>
    <style>
      html, body { margin: 0; height: 100%; font-family: system-ui, sans-serif; }
      body { display: flex; flex-direction: column; background: #525659; }
      header {
        display: flex; align-items: center; justify-content: space-between;
        gap: 16px; padding: 8px 16px; background: #1f2937; color: #f9fafb;
      }
      h1 { font-size: 14px; font-weight: 500; margin: 0;
           overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      a { flex: none; background: #0ea5e9; color: #fff; text-decoration: none;
          font-size: 13px; padding: 6px 14px; border-radius: 6px; }
      a:hover { background: #0284c7; }
      iframe { flex: 1; border: 0; width: 100%; }
    </style>
  </head>
  <body>
    <header>
      <h1>${nombreSeguro}</h1>
      <a href="${blobUrl}" download="${nombreSeguro}">Descargar</a>
    </header>
    <iframe src="${blobUrl}" title="${nombreSeguro}"></iframe>
  </body>
</html>`;
};

/** Abre cada PDF en su propia pestaña, con su nombre real. */
export const openPdfFilesInNewTab = (archivos: PdfArchivo[]): void => {
  archivos.forEach((archivo, index) => {
    setTimeout(() => {
      const nombre = pdfFileName(archivo.nombreArchivo);
      // Se envuelve en un File y no en un Blob pelado para que el nombre viaje
      // con el objeto; la URL sigue siendo `blob:.../<uuid>`, así que el nombre
      // bueno lo pone el botón Descargar de la barra.
      const pdfFile = new File([decodeBase64ToBlob(archivo.archivoB64)], nombre, {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(pdfFile);

      const pestana = window.open("", `_blank_${index}`);
      if (!pestana) {
        URL.revokeObjectURL(url);
        return;
      }

      pestana.document.write(paginaVisor(url, nombre));
      pestana.document.close();
      pestana.addEventListener("beforeunload", () => URL.revokeObjectURL(url));
    }, index * 400);
  });
};
