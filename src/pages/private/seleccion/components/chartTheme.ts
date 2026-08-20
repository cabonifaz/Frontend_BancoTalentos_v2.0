/**
 * Tokens de visualización del módulo Selección.
 *
 * La paleta categórica está VALIDADA (no elegida a ojo) contra la superficie real
 * de las tarjetas (#ffffff) con los seis chequeos de color: banda de luminosidad,
 * piso de croma, separación bajo daltonismo (protan/deutan/tritan), piso de visión
 * normal y contraste. Resultado en ese orden exacto:
 *
 *   banda L      PASS  — las 5 dentro de 0.43–0.77
 *   croma        PASS  — las 5 >= 0.10
 *   CVD          PASS  — peor par adyacente #6D4AC4↔#e9399a ΔE 10.4 (protan)   [objetivo >= 8]
 *   visión normal PASS — peor par adyacente #5C6BC0↔#009688 ΔE 17.8            [piso >= 15]
 *   contraste    PASS  — las 5 >= 3:1 sobre #ffffff
 *
 * EL ORDEN ES EL MECANISMO DE SEGURIDAD, no es estético: reordenar los slots
 * rompe la separación bajo daltonismo. Si hay que tocar la paleta, re-validar.
 * `#C07C0C` es el naranja de marca (#FAAB34) oscurecido: el original queda fuera
 * de la banda de luminosidad (L 0.799) y da 1.92:1 de contraste.
 */

/** Slots categóricos, en orden fijo. Nunca se ciclan ni se generan hues nuevos. */
export const SERIES = [
  "#009688", // 1 — teal de marca
  "#5C6BC0", // 2 — índigo
  "#C07C0C", // 3 — ámbar
  "#e9399a", // 4 — magenta
  "#6D4AC4", // 5 — violeta
] as const;

/**
 * Bucket de cola. Gris acromático a propósito: "Otros" no es una entidad, es el
 * resto agregado, y el gris lo saca del canal de identidad. Es la única entrada
 * que incumple el piso de croma, y lo hace por diseño.
 */
export const OTHER_COLOR = "#525252";
export const OTHER_LABEL = "Otros";

/** Cromo del gráfico: rejilla, ejes y tinta. El texto nunca lleva color de serie. */
export const CHROME = {
  surface: "#ffffff",
  grid: "#e1e0d9",
  axis: "#c3c2b7",
  inkPrimary: "#0b0b0b",
  inkSecondary: "#52525b",
  inkMuted: "#71717a",
} as const;

/** Pista del medidor: paso claro del mismo hue del relleno (teal sobre teal). */
export const METER_TRACK = "#cce9e6";

const NUMBER = new Intl.NumberFormat("es-PE");
const PERCENT = new Intl.NumberFormat("es-PE", {
  style: "percent",
  maximumFractionDigits: 1,
});

export const fmtNumber = (n: number) => NUMBER.format(n);

/** Ratio 0–1 -> "12,5 %". Devuelve "—" si el denominador es 0. */
export const fmtPercent = (ratio: number) =>
  Number.isFinite(ratio) ? PERCENT.format(ratio) : "—";

export const fmtShare = (value: number, total: number) =>
  total > 0 ? fmtPercent(value / total) : "—";

export interface Slice {
  key: string;
  label: string;
  cantidad: number;
  color: string;
  isOther: boolean;
}

/**
 * Pliega una lista a los `n` mayores + "Otros" y le asigna color.
 *
 * El techo de una torta legible son ~6 segmentos: con `n = 5` el sexto es siempre
 * el bucket gris. Los elementos con cantidad 0 se descartan (un sector de área
 * cero no es legible ni tiene hit target).
 *
 * Nota conocida: el color se asigna por posición en el top-N, así que al cambiar
 * un filtro los supervivientes pueden repintarse. Lo aceptamos porque la leyenda
 * lateral nombra cada segmento con su valor, de modo que la identidad nunca
 * descansa sólo en el color.
 */
export const topNWithOther = (
  rows: { id?: number | null; label: string; cantidad: number }[],
  n: number = SERIES.length,
): Slice[] => {
  const clean = rows.filter((r) => r.cantidad > 0);
  const sorted = [...clean].sort((a, b) => b.cantidad - a.cantidad);
  const head = sorted.slice(0, n);
  const tail = sorted.slice(n);

  const slices: Slice[] = head.map((r, i) => ({
    key: r.id != null ? String(r.id) : `${r.label}-${i}`,
    label: r.label,
    cantidad: r.cantidad,
    color: SERIES[i],
    isOther: false,
  }));

  if (tail.length > 0) {
    slices.push({
      key: "__otros__",
      label: `${OTHER_LABEL} (${tail.length})`,
      cantidad: tail.reduce((acc, r) => acc + r.cantidad, 0),
      color: OTHER_COLOR,
      isOther: true,
    });
  }

  return slices;
};

/**
 * Colorea una lista que el backend YA plegó.
 *
 * `SP_BT_SELECCION_ENTREVISTAS` devuelve top 5 + una fila literal 'Otros' con el
 * acumulado del resto, así que aquí no se vuelve a plegar: sólo se reparten los
 * slots, se fuerza el gris en el bucket y se manda al final aunque su acumulado
 * supere a alguna de las cinco primeras.
 */
export const colorizeSlices = (
  rows: { id?: number | null; label: string; cantidad: number }[],
): Slice[] => {
  const clean = rows.filter((r) => r.cantidad > 0);
  const isOther = (label: string) =>
    label.trim().toLowerCase() === OTHER_LABEL.toLowerCase();

  const named = clean.filter((r) => !isOther(r.label));
  const other = clean.filter((r) => isOther(r.label));

  const slices: Slice[] = named.slice(0, SERIES.length).map((r, i) => ({
    key: r.id != null ? String(r.id) : `${r.label}-${i}`,
    label: r.label,
    cantidad: r.cantidad,
    color: SERIES[i],
    isOther: false,
  }));

  // Cualquier excedente sobre los slots disponibles cae al bucket, junto al
  // 'Otros' que ya venía: nunca se genera un hue nuevo para el sobrante.
  const overflow = named.slice(SERIES.length);
  const otherTotal = [...other, ...overflow].reduce(
    (acc, r) => acc + r.cantidad,
    0,
  );

  if (otherTotal > 0) {
    slices.push({
      key: "__otros__",
      label: OTHER_LABEL,
      cantidad: otherTotal,
      color: OTHER_COLOR,
      isOther: true,
    });
  }

  return slices;
};
