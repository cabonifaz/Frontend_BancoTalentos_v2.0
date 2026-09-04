/** Subida directa a S3 vía URL pre-firmada. Compartido por todos los módulos
 * que suben archivos (talentos, requerimientos, entrevistas, administración). */


/**
 * 2) Sube el archivo directamente a S3 usando la URL pre-firmada.
 *
 * `contentType` DEBE ser el que devolvió el backend al firmar. La firma de S3
 * incluye la cabecera Content-Type, así que si aquí se manda otra cosa el PUT
 * falla con 403 SignatureDoesNotMatch. Usar `file.type` es justo lo que rompía:
 * el navegador lo deja vacío para extensiones que el sistema operativo no
 * reconoce, y ese vacío no coincide con lo que se firmó. Se mantiene como valor
 * por defecto sólo para las llamadas que aún no reciben el tipo del backend.
 *
 * Se envuelve el `fetch` con un `AbortController` + timeout para garantizar que
 * la promesa SIEMPRE se resuelva o rechace. Sin esto, si el PUT/preflight se
 * estanca (CORS mal configurado en prod, CDN/WAF intermedio, red colgada), el
 * `fetch` nunca termina, el `finally` de quien llama nunca corre y el overlay de
 * carga (fixed inset-0) queda pegado dejando la página "congelada". Con el abort,
 * el estancamiento se convierte en un error normal que cada modal captura.
 */
export const uploadFileToS3 = async (
  url: string,
  file: File,
  contentType?: string,
  timeoutMs = 60000,
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": contentType || file.type },
      body: file,
      signal: controller.signal,
    });
  } catch (err) {
    // Un fallo de red aquí casi nunca es "no hay internet": el navegador lanza
    // TypeError cuando el bucket rechaza el preflight CORS del origen de BDT.
    // Sin este mensaje el error llega como "Failed to fetch" y no se distingue.
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(
        `La subida a S3 no respondió en ${timeoutMs / 1000}s y se canceló.`,
      );
    }
    throw new Error(
      "No se pudo contactar con S3. Revisa la configuración CORS del bucket " +
        "para el origen de esta aplicación (método PUT y cabecera Content-Type).",
    );
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Traduce una respuesta de S3 que no es 2xx a un mensaje legible.
 *
 * S3 responde con un XML (`<Code>SignatureDoesNotMatch</Code>`) que hasta ahora
 * se descartaba, dejando sólo un "Error subiendo el archivo" que no dice nada.
 */

/**
 * Traduce una respuesta de S3 que no es 2xx a un mensaje legible.
 *
 * S3 responde con un XML (`<Code>SignatureDoesNotMatch</Code>`) que hasta ahora
 * se descartaba, dejando sólo un "Error subiendo el archivo" que no dice nada.
 */
export const describeS3Error = async (response: Response): Promise<string> => {
  let code = "";
  try {
    const body = await response.text();
    code = body.match(/<Code>([^<]+)<\/Code>/)?.[1] ?? "";
  } catch {
    // Cuerpo ilegible (respuesta opaca): nos quedamos con el status.
  }
  return code
    ? `Error subiendo el archivo a S3 (${response.status} ${code})`
    : `Error subiendo el archivo a S3 (código ${response.status})`;
};

/** 3) Confirma en el backend para registrar el archivo en BD. */
