const LIMA_UTC_OFFSET_HOURS = 5;

export const MIME_ICS = "text/calendar";

export interface IcsInterviewData {
  id: number;
  talento: string;
  perfil: string;
  etapa: string;
  clienteResumen: string;
  fecha: string;
  hora: string;
  durationMinutes: number;
  isPresencial: boolean;
  direccion?: string;
  ubicacion?: string;
  enlaceEntrevista?: string;
  requerimientos: string[];
}


const escapeIcsText = (value: string): string =>
  (value || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

/** Formatea un instante (Date en UTC) como YYYYMMDDTHHMMSSZ. */
const toIcsUtc = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
};

/**
 * Convierte una fecha/hora local de Lima (YYYY-MM-DD + HH:mm) al instante UTC
 * equivalente. Devuelve null si los datos no son parseables.
 */
const limaToUtc = (fecha: string, hora: string): Date | null => {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec((fecha || "").trim());
  const timeMatch = /^(\d{2}):(\d{2})/.exec((hora || "").trim());
  if (!dateMatch || !timeMatch) return null;
  const [, y, mo, d] = dateMatch;
  const [, h, mi] = timeMatch;
  // Lima + 5h = UTC (Perú es UTC-5 todo el año).
  const utcMs = Date.UTC(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h) + LIMA_UTC_OFFSET_HOURS,
    Number(mi),
    0,
  );
  return new Date(utcMs);
};

/**
 * Construye el contenido del archivo .ics para la entrevista. Devuelve null si la
 * fecha/hora no son válidas (no se puede calcular DTSTART).
 */
export const buildInterviewIcs = (data: IcsInterviewData): string | null => {
  const start = limaToUtc(data.fecha, data.hora);
  if (!start) return null;

  const end = new Date(
    start.getTime() + Math.max(1, data.durationMinutes) * 60 * 1000,
  );

  const summary = `Entrevista de selección - ${data.talento} | ${data.perfil}`;

  const descriptionParts = [
    `Etapa: ${data.etapa || "-"}`,
    `Cliente: ${data.clienteResumen || "-"}`,
    `Perfil: ${data.perfil || "-"}`,
  ];
  if (data.requerimientos && data.requerimientos.length > 0) {
    descriptionParts.push(`Requerimientos:`);
    data.requerimientos.forEach((rq) => descriptionParts.push(`- ${rq}`));
  }
  const description = descriptionParts.join("\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TalentBank//Interviews//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-TIMEZONE:America/Lima",
    "BEGIN:VEVENT",
    `UID:interview-${data.id}@talentbank`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
  ];

  // PRESENCIAL → LOCATION = dirección, URL = ubicación (Google Maps).
  // VIRTUAL → sin LOCATION física, URL = enlace de la videollamada.
  if (data.isPresencial) {
    if (data.direccion) lines.push(`LOCATION:${escapeIcsText(data.direccion)}`);
    if (data.ubicacion) lines.push(`URL:${escapeIcsText(data.ubicacion)}`);
  } else if (data.enlaceEntrevista) {
    lines.push(`URL:${escapeIcsText(data.enlaceEntrevista)}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
};

/** Genera el File .ics listo para subir a S3. Devuelve null si no es válido. */
export const buildInterviewIcsFile = (data: IcsInterviewData): File | null => {
  const content = buildInterviewIcs(data);
  if (!content) return null;
  return new File([content], `entrevista-${data.id}.ics`, { type: MIME_ICS });
};
