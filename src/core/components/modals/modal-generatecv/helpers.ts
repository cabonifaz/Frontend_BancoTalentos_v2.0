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

export const sortWorkExperience = (
  experiences: Experience[]
): Experience[] => {
  return [...experiences].sort((a, b) => {
    // 1. Los trabajos actuales (flActualidad = true) siempre van primero
    if (a.flActualidad && !b.flActualidad) return -1;
    if (!a.flActualidad && b.flActualidad) return 1;

    // 2. Si ambos son actuales, ordenar por fecha de inicio (el más reciente primero)
    if (a.flActualidad && b.flActualidad) {
      const dateAInicio = parseDate(a.fechaInicio);
      const dateBInicio = parseDate(b.fechaInicio);
      return dateBInicio - dateAInicio;
    }

    // 3. Para trabajos finalizados, usar fechaFin para comparar
    const dateAFin = parseDate(a.fechaFin);
    const dateBFin = parseDate(b.fechaFin);

    // Si las fechas de fin son diferentes, ordenar por fecha de fin
    // Timestamp mayor = fecha más reciente = debe ir primero (return negativo si A > B)
    if (dateAFin !== dateBFin) {
      return dateBFin - dateAFin; // Si B > A, retorna positivo (B va después, A primero) ✓
    }

    // 4. Si las fechas de fin son iguales, ordenar por fecha de inicio
    const dateAInicio = parseDate(a.fechaInicio);
    const dateBInicio = parseDate(b.fechaInicio);
    return dateBInicio - dateAInicio; // Más reciente primero
  });
};

export const sortEducation = (
  educations: Education[]
): Education[] => {
  return [...educations].sort((a, b) => {
    // 1. Los estudios actuales (flActualidad = true) siempre van primero
    if (a.flActualidad && !b.flActualidad) return -1;
    if (!a.flActualidad && b.flActualidad) return 1;

    // 2. Si ambos son actuales, ordenar por fecha de inicio (el más reciente primero)
    if (a.flActualidad && b.flActualidad) {
      const dateAInicio = parseDate(a.fechaInicio);
      const dateBInicio = parseDate(b.fechaInicio);
      return dateBInicio - dateAInicio;
    }

    // 3. Para estudios finalizados, usar fechaFin para comparar
    const dateAFin = parseDate(a.fechaFin);
    const dateBFin = parseDate(b.fechaFin);

    // Si las fechas de fin son diferentes, ordenar por fecha de fin
    if (dateAFin !== dateBFin) {
      return dateBFin - dateAFin; // Más reciente primero
    }

    // 4. Si las fechas de fin son iguales, ordenar por fecha de inicio
    const dateAInicio = parseDate(a.fechaInicio);
    const dateBInicio = parseDate(b.fechaInicio);
    return dateBInicio - dateAInicio; // Más reciente primero
  });
};
