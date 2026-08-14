import { format, subDays } from "date-fns";

export const ISO = "yyyy-MM-dd";

/** Rango por defecto: últimos 30 días (incluyendo hoy). */
export const defaultRange = (): { fechaIni: string; fechaFin: string } => {
  const hoy = new Date();
  return {
    fechaIni: format(subDays(hoy, 29), ISO),
    fechaFin: format(hoy, ISO),
  };
};

/** Etiqueta legible yyyy-MM -> "MMM yyyy" para la serie temporal. */
export const periodLabel = (periodo: string): string => {
  const [y, m] = periodo.split("-");
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const idx = Number(m) - 1;
  return idx >= 0 && idx < 12 ? `${meses[idx]} ${y}` : periodo;
};
