import { Education, Experience } from "../../../models";

export const parseDate = (dateStr: string): number => {
  if (!dateStr || dateStr.trim() === "") return 0;

  const parts = dateStr.split("/");
  if (parts.length !== 3) return 0;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return 0;

  return new Date(year, month, day).getTime();
};

// Ordenar experiencias laborales de la más actual (FIN más reciente) a la más antigua
export const sortWorkExperience = (
  experiences: Experience[]
): Experience[] => {
  return [...experiences].sort((a, b) => {
    // 1. Trabajos actuales primero
    if (a.flActualidad && !b.flActualidad) return -1;
    if (!a.flActualidad && b.flActualidad) return 1;

    // 2. Si ambos son actuales, ordenar por fechaInicio descendente
    if (a.flActualidad && b.flActualidad) {
      const dateAInicio = parseDate(a.fechaInicio);
      const dateBInicio = parseDate(b.fechaInicio);
      return dateBInicio - dateAInicio;
    }

    // 3. Si ambos ya finalizaron, ordenar por fechaFin descendente (más reciente primero)
    const dateAFin = parseDate(a.fechaFin);
    const dateBFin = parseDate(b.fechaFin);
    if (dateAFin !== dateBFin) {
      return dateBFin - dateAFin;
    }

    // 4. Si tienen la misma fechaFin, ordenar por fechaInicio descendente
    const dateAInicio = parseDate(a.fechaInicio);
    const dateBInicio = parseDate(b.fechaInicio);
    return dateBInicio - dateAInicio;
  });
};

// Ordenar estudios de la más actual (FIN más reciente) a la más antigua
export const sortEducation = (
  educations: Education[]
): Education[] => {
  return [...educations].sort((a, b) => {
    // 1. Estudios actuales primero
    if (a.flActualidad && !b.flActualidad) return -1;
    if (!a.flActualidad && b.flActualidad) return 1;

    // 2. Si ambos son actuales, ordenar por fechaInicio descendente
    if (a.flActualidad && b.flActualidad) {
      const dateAInicio = parseDate(a.fechaInicio);
      const dateBInicio = parseDate(b.fechaInicio);
      return dateBInicio - dateAInicio;
    }

    // 3. Si ambos finalizaron, ordenar por fechaFin descendente
    const dateAFin = parseDate(a.fechaFin);
    const dateBFin = parseDate(b.fechaFin);
    if (dateAFin !== dateBFin) {
      return dateBFin - dateAFin;
    }

    // 4. Si tienen la misma fechaFin, ordenar por fechaInicio descendente
    const dateAInicio = parseDate(a.fechaInicio);
    const dateBInicio = parseDate(b.fechaInicio);
    return dateBInicio - dateAInicio;
  });
};
