/**
 * Comparación entre la pretensión salarial de un talento y la tarifa del perfil
 * en el tarifario del cliente del RQ. Alimenta el modal "Calcular Riesgo" de la
 * pantalla Asignar Talento.
 *
 * La comparación se hace SIEMPRE en Nuevos Soles. Si algún lado está en otra
 * moneda hace falta un tipo de cambio, que el usuario introduce en el modal (no
 * se hardcodea ninguno).
 */

/** PARAMETROS maestro 2 (TIPO_MONEDA): Nuevos Soles es NUM1 = 1. */
export const MONEDA_SOLES = 1;

/**
 * Forma mínima de una fila de PARAMETROS que necesita este módulo.
 *
 * Se declara aquí en vez de importar `Param` porque los dos frontends lo tienen
 * en rutas distintas y este archivo debe seguir siendo idéntico en ambos.
 */
export interface FilaParametro {
  num1: number;
  num2: number;
  /** Descripción de la fila. Solo se usa para nombrar la modalidad en la cabecera. */
  string1?: string;
}

// ─── Modalidad de facturación del talento (PARAMETROS maestro 3) ────────────
// BT_TALENTO.ID_MODALIDAD_FACTURACION guarda el NUM1 de este maestro; el NUM2
// de esa misma fila dice a qué grupo pertenece.
export const MAESTRO_MODALIDAD_FACT = 3;
/** NUM2 del maestro 3: 1 = Planilla · 2 = Locación de servicios · 3 = Prácticas. */
export const GRUPO_MOD_PLANILLA = 1;

/**
 * ¿El talento va por planilla?
 *
 * Se resuelve contra el maestro y no comparando ids sueltos: hoy planilla son
 * los ids 2 y 3, pero si mañana se añade otro régimen se clasifica solo. Todo
 * lo que no sea planilla —locación de servicios y las dos de prácticas— va por
 * recibo por honorarios.
 */
export const esPlanilla = (
  idModalidadFacturacion: number | null | undefined,
  modalidades: FilaParametro[],
): boolean =>
  !!idModalidadFacturacion &&
  modalidades.some(
    (fila) =>
      fila.num1 === idModalidadFacturacion && fila.num2 === GRUPO_MOD_PLANILLA,
  );

/**
 * Nombre de la modalidad tal como está en el maestro 3, para la cabecera del
 * modal. `null` si el talento no la tiene o la fila no llegó.
 */
export const nombreModalidad = (
  idModalidadFacturacion: number | null | undefined,
  modalidades: FilaParametro[],
): string | null => {
  if (!idModalidadFacturacion) return null;
  const fila = modalidades.find((f) => f.num1 === idModalidadFacturacion);
  return fila?.string1?.trim() || null;
};

// ─── Factor de cargas (PARAMETROS maestro 54, campo NUM2) ───────────────────
export const MAESTRO_FACTOR_PLANILLA = 54;
/** Sin cargas patronales: recibo por honorarios y prácticas. */
export const FACTOR_SIN_CARGAS = 1;

export interface FactorCarga {
  valor: number;
  /**
   * Falso cuando el talento va por planilla pero el parámetro no llegó y se
   * está usando 1.00. Hay que decírselo al usuario: un factor silenciosamente
   * equivocado no falla, solo devuelve veredictos falsos.
   */
  configurado: boolean;
}

/**
 * El factor se lee de STRING1, no de NUM2.
 *
 * `SP_PARAMETROS_LST` devuelve `ISNULL(CAST(P.NUM2 AS INT), 0)`, y SQL Server
 * **trunca** al castear: un 1.46 guardado en NUM2 llega al frontend como 1.
 * Eso no falla por ningún lado — simplemente calcula sin cargas y da veredictos
 * buenos de más. STRING1 sí viaja intacto (`ISNULL(P.STRING1, '')`).
 *
 * NUM2 se mantiene como respaldo, pero exigiendo > 1: un 1 pelado es justo lo
 * que devuelve el truncamiento, y tomarlo por bueno reproduciría el fallo en
 * silencio. Sin valor utilizable se marca `configurado: false` y el modal avisa.
 */
export const factorCarga = (
  talentoEnPlanilla: boolean,
  parametrosFactor: FilaParametro[],
): FactorCarga => {
  if (!talentoEnPlanilla) {
    return { valor: FACTOR_SIN_CARGAS, configurado: true };
  }

  for (const fila of parametrosFactor) {
    const desdeTexto = Number((fila.string1 ?? "").trim().replace(",", "."));
    if (Number.isFinite(desdeTexto) && desdeTexto > 1) {
      return { valor: desdeTexto, configurado: true };
    }
  }

  const fila = parametrosFactor.find((p) => p.num2 > 1);
  return fila
    ? { valor: fila.num2, configurado: true }
    : { valor: FACTOR_SIN_CARGAS, configurado: false };
};

/**
 * Cuánto puede la pretensión acercarse a la tarifa por debajo antes de dejar de
 * ser "Apto". Es el "o casi lo mismo" del criterio de Observable.
 *
 * Es el valor con el que abre el modal; desde ahí el usuario lo mueve con la
 * barra entre {@link TOLERANCIA_MIN} y {@link TOLERANCIA_MAX}.
 */
export const TOLERANCIA_OBSERVABLE = 0.05; // 5%

/** Límites de la barra de tolerancia, en puntos porcentuales. */
export const TOLERANCIA_MIN = 0;
export const TOLERANCIA_MAX = 25;

export type EstadoRiesgo = "APTO" | "OBSERVABLE" | "RIESGO";

export interface RangoPretension {
  /** Extremo bajo, ya convertido a soles. */
  inicial: number;
  /** Extremo alto, ya convertido a soles. Igual a `inicial` si solo hay un dato. */
  final: number;
  /** Falso cuando el talento no tiene ningún monto registrado en esa modalidad. */
  tieneDatos: boolean;
  /** Verdadero si hay montos pero falta el tipo de cambio para poder compararlos. */
  faltaTipoCambio: boolean;
  /** Nulo si no hay datos o falta el tipo de cambio. */
  estado: EstadoRiesgo | null;
}

const num = (valor?: number | null): number =>
  typeof valor === "number" && Number.isFinite(valor) ? valor : 0;

/**
 * Extremos del rango tal como vienen (sin convertir). Si el talento solo tiene
 * uno de los dos montos, el rango colapsa a ese único valor.
 * Devuelve `null` cuando no hay ningún dato.
 */
const extremos = (
  montoInicial?: number | null,
  montoFinal?: number | null,
): { bajo: number; alto: number } | null => {
  const i = num(montoInicial);
  const f = num(montoFinal);
  if (i <= 0 && f <= 0) return null;
  const a = i > 0 ? i : f;
  const b = f > 0 ? f : i;
  return { bajo: Math.min(a, b), alto: Math.max(a, b) };
};

/**
 * Una moneda ausente (0/null) se trata como soles: es el caso de talentos
 * antiguos cargados antes de que el campo existiera, y exigirles un tipo de
 * cambio bloquearía el modal sin motivo.
 */
export const esSoles = (idMoneda?: number | null): boolean =>
  !idMoneda || idMoneda === MONEDA_SOLES;

/**
 * Convierte un monto a soles. Devuelve `null` cuando hace falta un tipo de
 * cambio y no se ha introducido uno válido.
 */
export const aSoles = (
  monto: number,
  idMoneda: number | null | undefined,
  tipoCambio: number | null,
): number | null => {
  if (esSoles(idMoneda)) return monto;
  if (!tipoCambio || tipoCambio <= 0) return null;
  return monto * tipoCambio;
};

/**
 * Decide el estado comparando el rango contra la tarifa. Ambos ya en soles.
 *
 * - RIESGO: hasta el piso de lo que pide supera la tarifa.
 * - APTO: todo su rango queda cómodamente por debajo de la tarifa.
 * - OBSERVABLE: el resto — la tarifa cae dentro del rango, o el techo del rango
 *   la roza por debajo (dentro de la tolerancia).
 *
 * @param tolerancia fracción (0.05 = 5%). Con 0, Apto exige simplemente estar
 *                   por debajo de la tarifa; pedir justo la tarifa sigue siendo
 *                   Observable.
 */
export const evaluarEstado = (
  tarifa: number,
  inicial: number,
  final: number,
  tolerancia: number = TOLERANCIA_OBSERVABLE,
): EstadoRiesgo => {
  if (inicial > tarifa) return "RIESGO";
  if (final < tarifa * (1 - tolerancia)) return "APTO";
  return "OBSERVABLE";
};

/**
 * Arma y evalúa el rango de una modalidad.
 *
 * Si el talento solo tiene uno de los dos extremos, el rango colapsa a ese único
 * valor y la comparación se hace contra él (no se inventa el otro extremo).
 */
export const construirRango = (
  montoInicial: number | null | undefined,
  montoFinal: number | null | undefined,
  idMoneda: number | null | undefined,
  tarifaSoles: number | null,
  tipoCambio: number | null,
  tolerancia: number = TOLERANCIA_OBSERVABLE,
): RangoPretension => {
  const crudos = extremos(montoInicial, montoFinal);

  if (crudos === null) {
    return {
      inicial: 0,
      final: 0,
      tieneDatos: false,
      faltaTipoCambio: false,
      estado: null,
    };
  }

  const { bajo: bajoOriginal, alto: altoOriginal } = crudos;

  const bajo = aSoles(bajoOriginal, idMoneda, tipoCambio);
  const alto = aSoles(altoOriginal, idMoneda, tipoCambio);

  if (bajo === null || alto === null || tarifaSoles === null) {
    return {
      inicial: bajoOriginal,
      final: altoOriginal,
      tieneDatos: true,
      faltaTipoCambio: true,
      estado: null,
    };
  }

  return {
    inicial: bajo,
    final: alto,
    tieneDatos: true,
    faltaTipoCambio: false,
    estado: evaluarEstado(tarifaSoles, bajo, alto, tolerancia),
  };
};

/** Paleta de estado (dataviz). Nunca se usa el color solo: siempre icono + etiqueta. */
export const COLOR_ESTADO: Record<EstadoRiesgo, string> = {
  APTO: "#0ca30c",
  OBSERVABLE: "#fab219",
  RIESGO: "#d03b3b",
};

export const ETIQUETA_ESTADO: Record<EstadoRiesgo, string> = {
  APTO: "Apto",
  OBSERVABLE: "Observable",
  RIESGO: "Riesgo",
};

/**
 * Estilos de la franja de estado que va bajo la cabecera del modal.
 *
 * `acento` sirve para dos cosas: el icono sobre la franja y la etiqueta de
 * estado de cada barra. Los tonos son más oscuros que los del badge porque el
 * texto va sobre el fondo teñido, no sobre blanco.
 */
export interface EstiloEstado {
  fondo: string;
  titulo: string;
  detalle: string;
  acento: string;
}

export const BANDA_ESTADO: Record<EstadoRiesgo, EstiloEstado> = {
  APTO: {
    fondo: "bg-green-100",
    titulo: "text-green-900",
    detalle: "text-green-800",
    acento: "text-green-700",
  },
  OBSERVABLE: {
    fondo: "bg-amber-100",
    titulo: "text-amber-900",
    detalle: "text-amber-800",
    acento: "text-amber-700",
  },
  RIESGO: {
    fondo: "bg-red-100",
    titulo: "text-red-900",
    detalle: "text-red-800",
    acento: "text-red-600",
  },
};

/** Cuando no hay veredicto todavía (falta el tipo de cambio). */
export const BANDA_NEUTRA: EstiloEstado = {
  fondo: "bg-gray-100",
  titulo: "text-gray-900",
  detalle: "text-gray-600",
  acento: "text-gray-400",
};

/** Cómo se lee la posición en la celda de diferencia. */
export const ETIQUETA_POSICION: Record<Distancia["posicion"], string> = {
  ENCIMA: "encima",
  DEBAJO: "debajo",
  DENTRO: "dentro del rango",
};

export const DESCRIPCION_ESTADO: Record<EstadoRiesgo, string> = {
  APTO: "La tarifa del perfil cubre con holgura lo que pide el talento.",
  OBSERVABLE: "Lo que pide el talento se acerca a la tarifa del perfil.",
  RIESGO: "El talento pide más que la tarifa del perfil.",
};

export const formatearMonto = (monto: number): string =>
  new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monto);

/**
 * Piso de una modalidad ya convertido a soles: lo mínimo que pide el talento.
 * `null` si no hay datos o si falta el tipo de cambio para convertirlo.
 */
export const pisoEnSoles = (
  montoInicial: number | null | undefined,
  montoFinal: number | null | undefined,
  idMoneda: number | null | undefined,
  tipoCambio: number | null,
): number | null => {
  const crudos = extremos(montoInicial, montoFinal);
  if (crudos === null) return null;
  return aSoles(crudos.bajo, idMoneda, tipoCambio);
};

/**
 * Tope de la barra de tolerancia, en puntos porcentuales.
 *
 * El umbral de Observable es `tarifa × (1 − tolerancia)`, así que subir la
 * tolerancia lo empuja hacia abajo. Se impide que baje de lo que pide el
 * talento: pasado ese punto el control deja de tener efecto —el veredicto ya
 * no puede cambiar— y la línea se dibuja en una zona que no separa nada.
 *
 * Se redondea hacia abajo para que el umbral nunca cruce el piso ni por
 * decimales.
 */
export const maxToleranciaPermitida = (
  tarifaSoles: number | null,
  pisoSoles: number | null,
): number => {
  if (tarifaSoles === null || tarifaSoles <= 0 || pisoSoles === null) {
    return TOLERANCIA_MAX;
  }
  const margen = Math.floor((1 - pisoSoles / tarifaSoles) * 100);
  return Math.max(TOLERANCIA_MIN, Math.min(TOLERANCIA_MAX, margen));
};

// ─── Banda salarial del RQ (REQUERIMIENTO_FACTURACION) ─────────────────────

/** NUM1 del maestro 32 — OJO: numeración distinta del grupo del maestro 3. */
export const GRUPO_FACT_RXH = 1;
export const GRUPO_FACT_PLANILLA = 2;

/**
 * Una fila de la banda, con la forma que ya tiene `RQFacturacion` en los dos
 * frontends. Se declara estructuralmente por lo mismo que {@link FilaParametro}.
 */
export interface FilaBanda {
  idGrupoModalidad: number;
  currencyType?: number | null;
  minBaseAmount?: number;
  maxBaseAmount?: number;
  minTravelAllowance?: number;
  maxTravelAllowance?: number;
  minMonthlyAmount?: number;
  maxMonthlyAmount?: number;
  minQuarterlyAmount?: number;
  maxQuarterlyAmount?: number;
  minSemiAnnualAmount?: number;
  maxSemiAnnualAmount?: number;
}

export interface Banda {
  /** Extremos mensualizados y en soles. */
  min: number;
  max: number;
  /** Falso si el RQ no tiene banda para el grupo del talento. */
  tieneDatos: boolean;
  faltaTipoCambio: boolean;
}

/**
 * Los cinco componentes tienen periodicidades distintas, así que no se suman
 * crudos: se llevan todos a su equivalente mensual antes de comparar con una
 * tarifa mensual.
 */
const mensualizar = (
  base?: number,
  movilidad?: number,
  mensual?: number,
  trimestral?: number,
  semestral?: number,
): number =>
  num(base) +
  num(movilidad) +
  num(mensual) +
  num(trimestral) / 3 +
  num(semestral) / 6;

/** Qué fila de la banda le toca a un talento según su modalidad. */
export const grupoBanda = (talentoEnPlanilla: boolean): number =>
  talentoEnPlanilla ? GRUPO_FACT_PLANILLA : GRUPO_FACT_RXH;

/**
 * ¿Hay alguna fila de la banda en moneda extranjera y con importes?
 *
 * Se pregunta aparte de {@link construirBanda} porque decide si se PIDE el tipo
 * de cambio, y por eso no puede depender de él: si se usara el `faltaTipoCambio`
 * de la banda ya construida, el input desaparecería en cuanto se escribiera un
 * valor y no habría forma de corregir una tasa mal tecleada.
 *
 * Todo se evalúa siempre en soles, así que una banda en dólares sin tipo de
 * cambio no es comparable con nada.
 */
export const bandaRequiereTipoCambio = (
  filas: FilaBanda[] | null | undefined,
): boolean =>
  (filas ?? []).some(
    (fila) =>
      !esSoles(fila.currencyType) &&
      (mensualizar(
        fila.minBaseAmount,
        fila.minTravelAllowance,
        fila.minMonthlyAmount,
        fila.minQuarterlyAmount,
        fila.minSemiAnnualAmount,
      ) > 0 ||
        mensualizar(
          fila.maxBaseAmount,
          fila.maxTravelAllowance,
          fila.maxMonthlyAmount,
          fila.maxQuarterlyAmount,
          fila.maxSemiAnnualAmount,
        ) > 0),
  );

/**
 * Arma la banda de un grupo de modalidad.
 *
 * El grupo se pasa explícito y no se deduce del talento porque el modal dibuja
 * las DOS modalidades, y cada carril tiene que llevar su propia banda: la de
 * planilla y la de recibo por honorarios son filas distintas del RQ.
 *
 * La banda queda en BRUTO: no lleva el factor de cargas, porque expresa lo que
 * se autorizó pagar, no lo que cuesta.
 */
export const construirBanda = (
  filas: FilaBanda[] | null | undefined,
  grupo: number,
  tipoCambio: number | null,
): Banda => {
  const vacia: Banda = {
    min: 0,
    max: 0,
    tieneDatos: false,
    faltaTipoCambio: false,
  };

  const fila = (filas ?? []).find((f) => f.idGrupoModalidad === grupo);
  if (!fila) return vacia;

  const minBruto = mensualizar(
    fila.minBaseAmount,
    fila.minTravelAllowance,
    fila.minMonthlyAmount,
    fila.minQuarterlyAmount,
    fila.minSemiAnnualAmount,
  );
  const maxBruto = mensualizar(
    fila.maxBaseAmount,
    fila.maxTravelAllowance,
    fila.maxMonthlyAmount,
    fila.maxQuarterlyAmount,
    fila.maxSemiAnnualAmount,
  );
  if (minBruto <= 0 && maxBruto <= 0) return vacia;

  const min = aSoles(minBruto, fila.currencyType, tipoCambio);
  const max = aSoles(maxBruto, fila.currencyType, tipoCambio);
  if (min === null || max === null) {
    return {
      min: Math.min(minBruto, maxBruto),
      max: Math.max(minBruto, maxBruto),
      tieneDatos: true,
      faltaTipoCambio: true,
    };
  }

  return {
    min: Math.min(min, max),
    max: Math.max(min, max),
    tieneDatos: true,
    faltaTipoCambio: false,
  };
};

/**
 * Paleta categórica de 5 tonos, la misma que usa el módulo Selección. No es la
 * de estado: aquí los colores solo distinguen conceptos, no califican nada.
 */
export const COLORES_COMPONENTE = [
  "#009688",
  "#5C6BC0",
  "#C07C0C",
  "#e9399a",
  "#6D4AC4",
];

export interface ComponenteBanda {
  etiqueta: string;
  color: string;
  /** Ya mensualizado y en soles. */
  min: number;
  max: number;
}

/**
 * La banda abierta en sus cinco conceptos.
 *
 * Un solo número —"3,400 a 4,750"— no deja ver de dónde sale ni contra qué
 * campo del RQ contrastarlo, y como cada concepto tiene su periodicidad la
 * suma tampoco es evidente. Todo sale ya mensualizado, igual que el total.
 */
export const desglosarBanda = (
  filas: FilaBanda[] | null | undefined,
  grupo: number,
  tipoCambio: number | null,
): ComponenteBanda[] => {
  const fila = (filas ?? []).find((f) => f.idGrupoModalidad === grupo);
  if (!fila) return [];

  const crudos: { etiqueta: string; min: number; max: number }[] = [
    {
      etiqueta: "Básico",
      min: num(fila.minBaseAmount),
      max: num(fila.maxBaseAmount),
    },
    {
      etiqueta: "Movilidad",
      min: num(fila.minTravelAllowance),
      max: num(fila.maxTravelAllowance),
    },
    {
      etiqueta: "Mensual",
      min: num(fila.minMonthlyAmount),
      max: num(fila.maxMonthlyAmount),
    },
    {
      etiqueta: "Trimestral",
      min: num(fila.minQuarterlyAmount) / 3,
      max: num(fila.maxQuarterlyAmount) / 3,
    },
    {
      etiqueta: "Semestral",
      min: num(fila.minSemiAnnualAmount) / 6,
      max: num(fila.maxSemiAnnualAmount) / 6,
    },
  ];

  return crudos
    .map((componente, i) => {
      const min = aSoles(componente.min, fila.currencyType, tipoCambio);
      const max = aSoles(componente.max, fila.currencyType, tipoCambio);
      return {
        etiqueta: componente.etiqueta,
        color: COLORES_COMPONENTE[i % COLORES_COMPONENTE.length],
        min: min ?? componente.min,
        max: max ?? componente.max,
      };
    })
    // Un concepto que el RQ dejó en cero no aporta nada y sí gasta un color de
    // la leyenda, así que no se dibuja.
    .filter((componente) => componente.min > 0 || componente.max > 0);
};

// ─── Eje ───────────────────────────────────────────────────────────────────

/**
 * Marcas del eje en pasos redondos (1, 2, 2.5 o 5 por magnitud).
 *
 * Sin eje las barras solo se pueden comparar entre sí; con él se puede leer
 * cuánto vale cada una.
 */
export const marcasEje = (max: number, objetivo = 4): number[] => {
  if (!(max > 0) || objetivo <= 0) return [];
  const crudo = max / objetivo;
  const magnitud = Math.pow(10, Math.floor(Math.log10(crudo)));
  const paso =
    [1, 2, 2.5, 5, 10].map((m) => m * magnitud).find((p) => p >= crudo) ??
    10 * magnitud;

  const marcas: number[] = [];
  // `<= max` y no `< max`: la última marca puede caer justo en el tope.
  for (let valor = 0; valor <= max; valor += paso) marcas.push(valor);
  return marcas;
};

/** Los rótulos del eje van sin decimales: son referencias, no importes. */
export const formatearEje = (valor: number): string =>
  new Intl.NumberFormat("es-PE", { maximumFractionDigits: 0 }).format(valor);

export type PosicionBanda = "DEBAJO" | "DENTRO" | "ENCIMA";

export interface EncajeBanda {
  posicion: PosicionBanda;
  /** 0–1 cuando cae dentro; null si la banda es puntual o queda fuera. */
  fraccion: number | null;
}

/** Dónde cae la pretensión respecto de lo que el RQ autorizó pagar. */
export const encajeEnBanda = (
  pretension: number,
  banda: Banda,
): EncajeBanda => {
  if (pretension < banda.min) return { posicion: "DEBAJO", fraccion: null };
  if (pretension > banda.max) return { posicion: "ENCIMA", fraccion: null };
  const ancho = banda.max - banda.min;
  return {
    posicion: "DENTRO",
    fraccion: ancho > 0 ? (pretension - banda.min) / ancho : null,
  };
};

export const ETIQUETA_ENCAJE: Record<PosicionBanda, string> = {
  DEBAJO: "por debajo de la banda del RQ",
  DENTRO: "dentro de la banda del RQ",
  ENCIMA: "por encima de la banda del RQ",
};

// ─── Margen ────────────────────────────────────────────────────────────────

/**
 * Punto de equilibrio: el bruto máximo que se puede pagar sin perder dinero.
 *
 * Dividir la tarifa por el factor deja tarifa y pretensión en la MISMA unidad
 * (bruto), que es lo que permite dibujarlas en un solo carril junto a la banda.
 */
export const puntoEquilibrio = (
  tarifaSoles: number | null,
  factor: number,
): number | null =>
  tarifaSoles === null || factor <= 0 ? null : tarifaSoles / factor;

/**
 * Margen sobre la tarifa, en porcentaje.
 *
 * Equivale a `(tarifa − costo) / tarifa`, pero expresado en bruto: dividir
 * numerador y denominador por el factor da la misma cifra sin arrastrar el
 * costo por toda la UI.
 */
export const margenPorcentaje = (
  equilibrio: number | null,
  brutoPagado: number,
): number | null =>
  equilibrio === null || equilibrio <= 0
    ? null
    : (1 - brutoPagado / equilibrio) * 100;

/** Dónde queda la pretensión respecto de la tarifa, y por cuánto. */
export interface Distancia {
  /** Monto absoluto en soles. 0 cuando la tarifa cae dentro del rango. */
  monto: number;
  /** El mismo monto como porcentaje de la tarifa. */
  porcentaje: number;
  posicion: "ENCIMA" | "DEBAJO" | "DENTRO";
}

/**
 * La cifra accionable: cuánto separa lo que pide el talento de la tarifa.
 *
 * Se mide contra el extremo del rango que está en juego — el piso cuando pide de
 * más, el techo cuando pide de menos — porque es el que decide el veredicto.
 */
export const calcularDistancia = (
  tarifa: number,
  rango: Pick<RangoPretension, "inicial" | "final">,
): Distancia => {
  const pct = (monto: number) => (tarifa > 0 ? (monto / tarifa) * 100 : 0);

  if (rango.inicial > tarifa) {
    const monto = rango.inicial - tarifa;
    return { monto, porcentaje: pct(monto), posicion: "ENCIMA" };
  }
  if (rango.final < tarifa) {
    const monto = tarifa - rango.final;
    return { monto, porcentaje: pct(monto), posicion: "DEBAJO" };
  }
  return { monto: 0, porcentaje: 0, posicion: "DENTRO" };
};

export const textoDistancia = (distancia: Distancia): string => {
  if (distancia.posicion === "DENTRO") {
    return "La tarifa cae dentro del rango que pide";
  }
  const direccion =
    distancia.posicion === "ENCIMA"
      ? "por encima de la tarifa"
      : "por debajo de la tarifa";
  return `S/ ${formatearMonto(distancia.monto)} ${direccion} (${distancia.porcentaje.toFixed(1)}%)`;
};

