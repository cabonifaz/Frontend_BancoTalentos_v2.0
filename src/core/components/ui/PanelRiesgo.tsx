import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  Info,
  X,
} from "lucide-react";
import {
  BANDA_ESTADO,
  BANDA_NEUTRA,
  COLORES_COMPONENTE,
  COLOR_ESTADO,
  DESCRIPCION_ESTADO,
  ETIQUETA_ESTADO,
  ETIQUETA_ENCAJE,
  FACTOR_SIN_CARGAS,
  GRUPO_FACT_PLANILLA,
  GRUPO_FACT_RXH,
  TOLERANCIA_MAX,
  TOLERANCIA_MIN,
  TOLERANCIA_OBSERVABLE,
  aSoles,
  construirRango,
  MAESTRO_FACTOR_PLANILLA,
  MAESTRO_MODALIDAD_FACT,
  construirBanda,
  desglosarBanda,
  bandaRequiereTipoCambio,
  encajeEnBanda,
  esPlanilla,
  esSoles,
  factorCarga,
  formatearEje,
  grupoBanda,
  marcasEje,
  margenPorcentaje,
  nombreModalidad,
  puntoEquilibrio,
  formatearMonto,
  maxToleranciaPermitida,
  pisoEnSoles,
} from "../../utilities/riesgoTalento";
// isolatedModules: los tipos se importan aparte para que no queden como import
// en tiempo de ejecución.
import type {
  Banda,
  ComponenteBanda,
  EstadoRiesgo,
  EstiloEstado,
  FilaBanda,
  RangoPretension,
} from "../../utilities/riesgoTalento";
import { useParams } from "../../context/ParamsContext";
import { Tabs } from "./Tabs";

/**
 * Todo lo que hace falta para emitir un veredicto, desacoplado de su origen.
 *
 * Lo rellena tanto Asignar Talento (a partir del talento y su RQ) como la
 * calculadora libre (a partir de un formulario). Con un unico motor de calculo
 * y pintado las dos vistas no pueden divergir: si manana cambia el criterio de
 * Observable, cambia en las dos a la vez.
 */
export interface DatosRiesgo {
  /** Pretension en planilla, tal como se registro (sin convertir). */
  montoInicialPlanilla?: number | null;
  montoFinalPlanilla?: number | null;
  idMonedaPlan?: number | null;

  /** Pretension por recibo por honorarios. */
  montoInicialRxH?: number | null;
  montoFinalRxH?: number | null;
  idMonedaRxh?: number | null;

  /** NUM1 del maestro 3: decide el factor de cargas y que fila de banda manda. */
  idModalidadFacturacion?: number | null;

  /** Tarifa del perfil, en su moneda. */
  tarifa?: number | null;
  idMonedaTarifa?: number | null;
  /** Nombre de la moneda de la tarifa, para mostrarla cuando no se convierte. */
  monedaTarifa?: string;
  /** Tipo de cambio de partida; el usuario puede pisarlo. */
  tipoCambioSugerido?: number | null;

  /** Banda salarial del RQ: una fila por grupo de modalidad. */
  banda?: FilaBanda[];
}

interface Props {
  datos: DatosRiesgo;
}

const ICONO_ESTADO: Record<EstadoRiesgo, typeof CheckCircle2> = {
  APTO: CheckCircle2,
  OBSERVABLE: CircleAlert,
  RIESGO: AlertTriangle,
};

/** Gris de eje/grilla: un paso por encima de la superficie, sin peso visual. */
const COLOR_GRILLA = "#e4e4e7";
const COLOR_EQUILIBRIO = "#3f3f46";
const COLOR_BANDA = "#d4d4d8";
const COLOR_BRUTO = COLORES_COMPONENTE[0];
const COLOR_CARGAS = COLORES_COMPONENTE[1];

// Ancho fijo de la columna de rótulos. Se declara una vez porque la grilla y
// los rótulos del eje van en una capa aparte y tienen que alinearse al píxel
// con los carriles.
const ANCHO_ROTULO = 96;
const SEPARACION = 12;
const SANGRIA_IZQ = ANCHO_ROTULO + SEPARACION;

/** Una cifra de la fila de resumen: rótulo pequeño arriba, valor destacado abajo. */
const Celda = ({
  rotulo,
  valor,
  nota,
  colorValor,
  titulo,
}: {
  rotulo: string;
  valor: string;
  nota?: string;
  colorValor?: string;
  /** El detalle del cálculo, para quien lo busque, sin ocupar sitio. */
  titulo?: string;
}) => (
  <div className="flex-1 min-w-[130px]" title={titulo}>
    <p className="text-[11px] leading-4 uppercase tracking-wide text-gray-400">
      {rotulo}
    </p>
    <p
      className={`mt-0.5 text-lg leading-7 font-semibold tabular-nums ${
        colorValor || "text-gray-900"
      }`}
    >
      {valor}
    </p>
    {nota && <p className="text-xs leading-4 text-gray-500">{nota}</p>}
  </div>
);

/**
 * Contenido de una pestaña. La altura mínima evita que el modal salte de
 * tamaño al cambiar de panel, que es lo que hace incómodo comparar dos vistas.
 */
const Panel = ({ children }: { children: ReactNode }) => (
  <div className="pt-4 pb-1 min-h-[248px]">{children}</div>
);

/**
 * Aclaración de cómo leer el panel. El título ya lo pone la pestaña: repetirlo
 * dentro sería decir dos veces lo mismo.
 */
const NotaPanel = ({ children }: { children: ReactNode }) => (
  <p className="text-xs text-gray-400 mb-3">{children}</p>
);

/** Aviso de dato ausente dentro de un panel, con dónde se registra. */
const PanelVacio = ({ children }: { children: ReactNode }) => (
  <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 text-xs text-gray-500">
    <Info className="w-4 h-4 min-w-4 text-gray-400 mt-0.5" />
    <span>{children}</span>
  </div>
);

/** Entrada de leyenda. El color nunca va solo: siempre lleva su etiqueta. */
const Leyenda = ({
  color,
  texto,
  forma = "cuadro",
  opacidad,
  titulo,
}: {
  color: string;
  texto: string;
  forma?: "cuadro" | "marca";
  opacidad?: number;
  /** El porqué del número, para no gastar una línea de texto en contarlo. */
  titulo?: string;
}) => (
  <span
    className="inline-flex items-center gap-1.5 text-xs text-gray-500"
    title={titulo}
  >
    <span
      className={
        forma === "marca"
          ? "inline-block w-1 h-3.5 rounded-full"
          : "inline-block w-2.5 h-2.5 rounded-sm"
      }
      style={{ backgroundColor: color, opacity: opacidad }}
    />
    {texto}
  </span>
);

interface Segmento {
  color: string;
  valor: number;
}

/**
 * Barra apilada sobre una escala compartida. Sirve tanto para abrir la banda
 * del RQ en sus conceptos como para abrir la tarifa en costo y margen: en los
 * dos casos lo que importa es de qué se compone un total.
 */
const BarraApilada = ({
  etiqueta,
  segmentos,
  total,
  escalaMax,
}: {
  etiqueta: string;
  segmentos: Segmento[];
  total: number;
  escalaMax: number;
}) => {
  const visibles = segmentos.filter((s) => s.valor > 0);
  return (
    <div className="flex items-center gap-3 py-0.5">
      <span
        className="text-[13px] leading-[18px] font-medium text-gray-700"
        style={{ width: ANCHO_ROTULO, flex: `0 0 ${ANCHO_ROTULO}px` }}
      >
        {etiqueta}
      </span>
      <div className="flex-1 flex gap-0.5">
        {visibles.map((segmento, i) => (
          <div
            key={i}
            className="h-[22px]"
            style={{
              width: `${escalaMax > 0 ? (segmento.valor / escalaMax) * 100 : 0}%`,
              backgroundColor: segmento.color,
              borderTopLeftRadius: i === 0 ? 4 : 0,
              borderBottomLeftRadius: i === 0 ? 4 : 0,
              borderTopRightRadius: i === visibles.length - 1 ? 4 : 0,
              borderBottomRightRadius: i === visibles.length - 1 ? 4 : 0,
            }}
          />
        ))}
      </div>
      <span
        className="text-right text-[13px] font-semibold text-gray-900 tabular-nums"
        style={{ width: 78, flex: "0 0 78px" }}
      >
        {formatearEje(total)}
      </span>
    </div>
  );
};

interface FilaProps {
  titulo: string;
  rango: RangoPretension;
  /**
   * Punto de equilibrio en bruto (tarifa / factor de cargas) de ESTA modalidad.
   * El carril se dibuja en bruto para que pretensión, banda y tarifa sean
   * comparables entre sí sobre un mismo eje.
   */
  equilibrio: number | null;
  /** Zona sombreada: lo que el RQ autorizó pagar para esta modalidad. */
  banda: Banda;
  escalaMax: number;
  /** Marca la modalidad de facturación que realmente aplica a este talento. */
  esLaDelTalento: boolean;
}

/**
 * Una modalidad: el rango de pretensión dibujado sobre el mismo eje que su
 * banda y su equilibrio. Las dos filas comparten escala, que es lo que hace
 * comparables las barras entre sí.
 */
const FilaModalidad = ({
  titulo,
  rango,
  equilibrio,
  banda,
  escalaMax,
  esLaDelTalento,
}: FilaProps) => {
  const pct = (valor: number) =>
    escalaMax > 0 ? Math.min(100, (valor / escalaMax) * 100) : 0;

  const inicioPct = pct(rango.inicial);
  const finPct = pct(rango.final);
  // Ancho mínimo para que un rango de un solo valor siga siendo visible.
  const anchoPct = Math.max(finPct - inicioPct, 1.5);
  const color = rango.estado ? COLOR_ESTADO[rango.estado] : COLOR_GRILLA;
  const comparable = rango.tieneDatos && !rango.faltaTipoCambio;

  const encaje =
    comparable && banda.tieneDatos && !banda.faltaTipoCambio
      ? encajeEnBanda(rango.final, banda)
      : null;

  return (
    <div className="py-1.5">
      <div className="flex items-center gap-3">
        <span
          className="text-[13px] leading-[18px] font-medium text-gray-700"
          style={{ width: ANCHO_ROTULO, flex: `0 0 ${ANCHO_ROTULO}px` }}
        >
          {titulo}
          {esLaDelTalento && (
            <>
              <br />
              <span className="text-[11px] leading-4 font-normal text-gray-400">
                la del talento
              </span>
            </>
          )}
        </span>

        <div className="flex-1">
          {!comparable ? (
            <p className="text-xs text-gray-400 italic">
              {!rango.tieneDatos
                ? "Sin pretensión registrada en esta modalidad."
                : `Falta el tipo de cambio (pide ${formatearMonto(rango.inicial)}${
                    rango.final !== rango.inicial
                      ? ` – ${formatearMonto(rango.final)}`
                      : ""
                  } en moneda extranjera).`}
            </p>
          ) : (
            <div className="relative h-[22px]">
              {/* Carril: la escala completa, recesivo */}
              <div
                className="absolute inset-y-[7px] left-0 right-0 rounded"
                style={{ backgroundColor: "#f4f4f5" }}
              />
              {/* Banda aprobada por el RQ: el fondo contra el que se lee todo */}
              {banda.tieneDatos && !banda.faltaTipoCambio && (
                <div
                  className="absolute inset-y-0 rounded-[3px]"
                  style={{
                    left: `${pct(banda.min)}%`,
                    width: `${Math.max(pct(banda.max) - pct(banda.min), 0.8)}%`,
                    backgroundColor: COLOR_BANDA,
                    opacity: 0.9,
                  }}
                />
              )}
              {/* Rango de pretensión */}
              <div
                className="absolute rounded"
                style={{
                  top: 3,
                  bottom: 3,
                  left: `${inicioPct}%`,
                  width: `${anchoPct}%`,
                  backgroundColor: color,
                }}
              />
              {/* Punto de equilibrio: lo máximo pagable en bruto sin perder.
                  Es la ÚNICA marca del carril. El umbral de Observable vivía
                  aquí también, pero eran dos líneas casi pegadas que sólo se
                  distinguían por color, y sólo se mueve al tocar la tolerancia
                  — que ahora tiene su propia pestaña, donde está escrita. */}
              {equilibrio !== null && (
                <div
                  className="absolute w-1 rounded-full"
                  style={{
                    top: -2,
                    bottom: -2,
                    left: `calc(${pct(equilibrio)}% - 2px)`,
                    backgroundColor: COLOR_EQUILIBRIO,
                    boxShadow: "0 0 0 2px #ffffff",
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* La banda existe pero está en moneda extranjera y aún no hay tipo de
          cambio: sin este aviso el carril se dibuja sin zona sombreada y se
          lee como un RQ al que nunca le cargaron la banda. */}
      {banda.tieneDatos && banda.faltaTipoCambio && (
        <p
          className="text-[11px] leading-4 text-amber-700 mt-1"
          style={{ marginLeft: SANGRIA_IZQ }}
        >
          La banda del RQ está en moneda extranjera; falta el tipo de cambio
          para dibujarla.
        </p>
      )}

      {/* Sólo en la modalidad que NO es la del talento. En la suya, esta línea
          repetiría palabra por palabra las celdas «Pide (bruto)» y «Margen» y
          la franja de veredicto, que están a la vista justo encima. */}
      {comparable && !esLaDelTalento && (
        <p
          className="text-[11px] leading-4 text-gray-500 mt-1"
          style={{ marginLeft: SANGRIA_IZQ }}
        >
          Pide{" "}
          <span className="font-medium text-gray-700">
            S/ {formatearMonto(rango.inicial)}
            {rango.final !== rango.inicial &&
              ` – ${formatearMonto(rango.final)}`}
          </span>
          {/* El estado se escribe porque es lo que dice el color de la barra, y
              el color nunca va solo. En la fila del talento lo dice la franja. */}
          {rango.estado && ` · ${ETIQUETA_ESTADO[rango.estado]}`}
          {encaje && ` · ${ETIQUETA_ENCAJE[encaje.posicion]}`}
        </p>
      )}
    </div>
  );
};

/**
 * Compara la pretensión salarial del talento (planilla y RxH) contra la tarifa
 * de su perfil en el tarifario del cliente del RQ, y contra la banda salarial
 * que el propio RQ autorizó pagar.
 *
 * La comparación es siempre en Nuevos Soles. Si la tarifa o la pretensión están
 * en otra moneda, se pide el tipo de cambio en lugar de asumir uno.
 */
export const PanelRiesgo = ({ datos }: Props) => {
  const { paramsByMaestro } = useParams();
  const prellenado =
    datos.tipoCambioSugerido && datos.tipoCambioSugerido > 0
      ? String(datos.tipoCambioSugerido)
      : "";
  const [tipoCambioTexto, setTipoCambioTexto] = useState(prellenado);
  // Tolerancia en puntos porcentuales. Es la frontera entre Apto y Observable:
  // cuánto puede el techo de la pretensión acercarse al equilibrio por debajo
  // antes de dejar de considerarse holgado.
  const [toleranciaPct, setToleranciaPct] = useState(
    TOLERANCIA_OBSERVABLE * 100,
  );

  const tipoCambio = useMemo(() => {
    const valor = Number(tipoCambioTexto.replace(",", "."));
    return Number.isFinite(valor) && valor > 0 ? valor : null;
  }, [tipoCambioTexto]);

  // El input solo aparece si algo NO está en soles: en el caso normal el
  // usuario no ve fricción alguna.
  const requiereTipoCambio =
    !esSoles(datos.idMonedaTarifa) ||
    (!esSoles(datos.idMonedaPlan) &&
      !!(datos.montoInicialPlanilla || datos.montoFinalPlanilla)) ||
    (!esSoles(datos.idMonedaRxh) &&
      !!(datos.montoInicialRxH || datos.montoFinalRxH)) ||
    // La banda trae su propia moneda por grupo, independiente de las de
    // arriba: un RQ con tarifa en soles puede tener la banda en dólares, y sin
    // pedir el cambio la banda desaparecía del gráfico sin decir por qué.
    bandaRequiereTipoCambio(datos.banda);

  const tarifaSoles = useMemo(() => {
    if (!datos.tarifa) return null;
    return aSoles(datos.tarifa, datos.idMonedaTarifa, tipoCambio);
  }, [datos.tarifa, datos.idMonedaTarifa, tipoCambio]);

  const modalidades = paramsByMaestro[MAESTRO_MODALIDAD_FACT] ?? [];

  // La modalidad decide dos cosas: el factor de cargas y qué fila de la banda
  // del RQ aplica. Se resuelve contra el maestro 3, no comparando ids sueltos.
  const talentoEnPlanilla = esPlanilla(
    datos.idModalidadFacturacion,
    modalidades,
  );
  const talentoEsRxH = !talentoEnPlanilla;

  // Cada modalidad tiene SU factor, no el del talento: en planilla el bruto
  // arrastra cargas patronales y por honorarios no. Usar uno solo para las dos
  // filas movía el equilibrio de recibo por honorarios a donde no está.
  const factorPlanilla = factorCarga(
    true,
    paramsByMaestro[MAESTRO_FACTOR_PLANILLA] ?? [],
  );
  const equilibrioPlanilla = puntoEquilibrio(tarifaSoles, factorPlanilla.valor);
  const equilibrioRxH = puntoEquilibrio(tarifaSoles, FACTOR_SIN_CARGAS);

  // Cada carril lleva la banda de SU grupo: el RQ aprueba importes distintos
  // para planilla y para recibo por honorarios.
  const bandaPlanilla = useMemo(
    () => construirBanda(datos.banda, GRUPO_FACT_PLANILLA, tipoCambio),
    [datos.banda, tipoCambio],
  );
  const bandaRxH = useMemo(
    () => construirBanda(datos.banda, GRUPO_FACT_RXH, tipoCambio),
    [datos.banda, tipoCambio],
  );

  // Lo mínimo que pide el talento en cada modalidad. Se calcula aparte de los
  // rangos —y no a partir de ellos— porque el tope de la tolerancia sale de
  // aquí y los rangos ya dependen de la tolerancia: usarlos crearía un ciclo.
  const pisoPlanilla = useMemo(
    () =>
      pisoEnSoles(
        datos.montoInicialPlanilla,
        datos.montoFinalPlanilla,
        datos.idMonedaPlan,
        tipoCambio,
      ),
    [datos, tipoCambio],
  );
  const pisoRxH = useMemo(
    () =>
      pisoEnSoles(
        datos.montoInicialRxH,
        datos.montoFinalRxH,
        datos.idMonedaRxh,
        tipoCambio,
      ),
    [datos, tipoCambio],
  );

  // El umbral de Observable no puede bajar de lo que pide el talento en NINGÚN
  // carril, así que la barra se topa en el más restrictivo. Se aplica también
  // al valor en uso: si el tope baja (cambia el tipo de cambio, por ejemplo) la
  // posición guardada no se queda por encima de lo permitido.
  const toleranciaTope = Math.min(
    maxToleranciaPermitida(equilibrioPlanilla, pisoPlanilla),
    maxToleranciaPermitida(equilibrioRxH, pisoRxH),
  );
  const toleranciaEfectivaPct = Math.min(toleranciaPct, toleranciaTope);
  const tolerancia = toleranciaEfectivaPct / 100;

  const planilla = useMemo(
    () =>
      construirRango(
        datos.montoInicialPlanilla,
        datos.montoFinalPlanilla,
        datos.idMonedaPlan,
        equilibrioPlanilla,
        tipoCambio,
        tolerancia,
      ),
    [datos, equilibrioPlanilla, tipoCambio, tolerancia],
  );

  const rxh = useMemo(
    () =>
      construirRango(
        datos.montoInicialRxH,
        datos.montoFinalRxH,
        datos.idMonedaRxh,
        equilibrioRxH,
        tipoCambio,
        tolerancia,
      ),
    [datos, equilibrioRxH, tipoCambio, tolerancia],
  );

  // Una sola escala para las dos filas: si cada barra tuviera la suya, dos
  // longitudes iguales representarían importes distintos.
  const escalaMax = useMemo(() => {
    const valores = [equilibrioPlanilla ?? 0, equilibrioRxH ?? 0];
    [bandaPlanilla, bandaRxH].forEach((b) => {
      if (b.tieneDatos && !b.faltaTipoCambio) valores.push(b.max);
    });
    [planilla, rxh].forEach((r) => {
      if (r.tieneDatos && !r.faltaTipoCambio) valores.push(r.final);
    });
    const maximo = Math.max(...valores);
    return maximo > 0 ? maximo * 1.15 : 0;
  }, [
    equilibrioPlanilla,
    equilibrioRxH,
    bandaPlanilla,
    bandaRxH,
    planilla,
    rxh,
  ]);

  const marcas = useMemo(() => marcasEje(escalaMax), [escalaMax]);

  const sinPretension = !planilla.tieneDatos && !rxh.tieneDatos;

  // El veredicto que manda es el de la modalidad de facturación del talento.
  // Si esa no tiene datos se cae a la otra, para no dejar la franja vacía
  // teniendo información que sí sirve.
  const preferida = talentoEsRxH ? rxh : planilla;
  const alterna = talentoEsRxH ? planilla : rxh;
  const principal = preferida.tieneDatos ? preferida : alterna;
  const principalEsRxH = principal === rxh;
  const tituloPrincipal = principalEsRxH ? "recibo por honorarios" : "planilla";
  const factorPrincipal = principalEsRxH
    ? FACTOR_SIN_CARGAS
    : factorPlanilla.valor;
  const equilibrioPrincipal = principalEsRxH
    ? equilibrioRxH
    : equilibrioPlanilla;
  const bandaPrincipal = principalEsRxH ? bandaRxH : bandaPlanilla;

  const IconoPrincipal = principal.estado
    ? ICONO_ESTADO[principal.estado]
    : Info;
  // OJO: `bandaPrincipal` es la banda salarial del RQ. Esto es otra cosa: los
  // colores de la franja de estado. Nombres distintos a propósito.
  const estiloFranja: EstiloEstado = principal.estado
    ? BANDA_ESTADO[principal.estado]
    : BANDA_NEUTRA;

  const comparable = principal.tieneDatos && !principal.faltaTipoCambio;
  const margen = comparable
    ? margenPorcentaje(equilibrioPrincipal, principal.final)
    : null;
  const encaje =
    comparable && bandaPrincipal.tieneDatos && !bandaPrincipal.faltaTipoCambio
      ? encajeEnBanda(principal.final, bandaPrincipal)
      : null;

  // El peor caso: el talento pide el techo de su rango. Es el que decide.
  const costoMin = principal.inicial * factorPrincipal;
  const costoMax = principal.final * factorPrincipal;
  const margenSoles =
    tarifaSoles !== null && comparable ? tarifaSoles - costoMax : null;

  // El desglose de la banda se muestra para el grupo del talento; si ese grupo
  // no tiene banda pero el otro sí, se enseña ese y se dice cuál es.
  const grupoDesglose = bandaPrincipal.tieneDatos
    ? grupoBanda(!principalEsRxH)
    : bandaPlanilla.tieneDatos
      ? GRUPO_FACT_PLANILLA
      : GRUPO_FACT_RXH;
  const bandaDesglose =
    grupoDesglose === GRUPO_FACT_PLANILLA ? bandaPlanilla : bandaRxH;
  const componentes: ComponenteBanda[] = bandaDesglose.tieneDatos
    ? desglosarBanda(datos.banda, grupoDesglose, tipoCambio)
    : [];
  const mostrarDesglose =
    componentes.length > 0 && !bandaDesglose.faltaTipoCambio;

  const escalaCosto = Math.max(costoMax, tarifaSoles ?? 0);

  const detalleFranja = [
    margen !== null ? `deja ${margen.toFixed(1)}% de margen` : null,
    encaje
      ? ETIQUETA_ENCAJE[encaje.posicion].replace(/^por /, "queda por ")
      : null,
  ]
    .filter(Boolean)
    .join(" y ");

  // Con veredicto de Riesgo la tolerancia no pinta nada: el talento ya pide por
  // encima del punto de equilibrio, el tope sale 0 y la barra queda inerte.
  // Mostrarla invitaría a mover un control que no puede cambiar el resultado.
  const mostrarTolerancia = principal.estado !== "RIESGO";

  // Las demás pestañas son fijas aunque alguna no tenga datos: si aparecieran y
  // desaparecieran según el tipo de cambio, la pestaña abierta cambiaría sola de
  // contenido bajo el cursor. Cuando falta el dato, el panel lo explica.
  const pestanas = [
    {
      label: "Dónde cae",
      children: (
        <Panel>
          <NotaPanel>
            Todo en bruto, para que sea comparable con la banda del RQ.
          </NotaPanel>

          <div className="relative">
            {/* Grilla: se ancla a las mismas sangrías que los carriles para
                que las marcas del eje caigan donde deben. */}
            {marcas.map((marca) => (
              <div
                key={marca}
                className="absolute top-0 bottom-0 w-px"
                style={{
                  left: `calc(${SANGRIA_IZQ}px + (100% - ${SANGRIA_IZQ}px) * ${
                    escalaMax > 0 ? marca / escalaMax : 0
                  })`,
                  backgroundColor: COLOR_GRILLA,
                }}
              />
            ))}

            <div className="relative">
              <FilaModalidad
                titulo="Planilla"
                rango={planilla}
                equilibrio={equilibrioPlanilla}
                banda={bandaPlanilla}
                escalaMax={escalaMax}
                esLaDelTalento={talentoEnPlanilla}
              />
              <FilaModalidad
                titulo="Recibo por honorarios"
                rango={rxh}
                equilibrio={equilibrioRxH}
                banda={bandaRxH}
                escalaMax={escalaMax}
                esLaDelTalento={talentoEsRxH}
              />
            </div>
          </div>

          {/* Rótulos del eje, con la misma sangría que la grilla. */}
          <div
            className="relative h-4 mt-1"
            style={{ marginLeft: SANGRIA_IZQ }}
          >
            {marcas.map((marca) => (
              <span
                key={marca}
                className="absolute text-[11px] leading-4 text-gray-400 tabular-nums"
                style={{
                  left: `${escalaMax > 0 ? (marca / escalaMax) * 100 : 0}%`,
                }}
              >
                {formatearEje(marca)}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
            <Leyenda
              color={COLOR_BANDA}
              opacidad={0.9}
              texto="Banda aprobada del RQ"
              titulo="Lo que el RQ autorizó pagar, mensualizado"
            />
            <Leyenda
              color={COLOR_EQUILIBRIO}
              forma="marca"
              texto="Punto de equilibrio"
              titulo={`Lo máximo pagable en bruto sin perder dinero. Cada modalidad tiene el suyo porque sus cargas son distintas: planilla es la tarifa ÷ ${factorPlanilla.valor}, honorarios no lleva cargas.`}
            />
          </div>
        </Panel>
      ),
    },
    {
      label: "Banda del RQ",
      children: (
        <Panel>
          {mostrarDesglose ? (
            <>
              <NotaPanel>
                Mensualizada: trimestral ÷ 3, semestral ÷ 6.
                {grupoDesglose !== grupoBanda(!principalEsRxH) &&
                  ` El RQ solo tiene banda para ${
                    grupoDesglose === GRUPO_FACT_PLANILLA
                      ? "planilla"
                      : "recibo por honorarios"
                  }; es la que se muestra.`}
              </NotaPanel>
              <BarraApilada
                etiqueta="Mínimo"
                total={bandaDesglose.min}
                escalaMax={bandaDesglose.max}
                segmentos={componentes.map((c) => ({
                  color: c.color,
                  valor: c.min,
                }))}
              />
              <BarraApilada
                etiqueta="Máximo"
                total={bandaDesglose.max}
                escalaMax={bandaDesglose.max}
                segmentos={componentes.map((c) => ({
                  color: c.color,
                  valor: c.max,
                }))}
              />
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                {componentes.map((c) => (
                  <Leyenda
                    key={c.etiqueta}
                    color={c.color}
                    texto={`${c.etiqueta} ${formatearEje(c.min)}${
                      c.max !== c.min ? ` – ${formatearEje(c.max)}` : ""
                    }`}
                  />
                ))}
              </div>
            </>
          ) : (
            <PanelVacio>
              {bandaDesglose.faltaTipoCambio
                ? `La banda de ${tituloPrincipal} está en moneda extranjera. Escribe el tipo de cambio de arriba para verla: todo se evalúa en soles.`
                : `Este RQ no tiene banda salarial registrada para ${tituloPrincipal}. Se registra en el detalle del RQ, pestaña Gestión; sin ella el veredicto sale solo de la tarifa del perfil.`}
            </PanelVacio>
          )}
        </Panel>
      ),
    },
    {
      label: "A dónde va la tarifa",
      children: (
        <Panel>
          {comparable && tarifaSoles !== null ? (
            <>
              <NotaPanel>
                Peor caso: el talento pide el techo de su rango.
              </NotaPanel>
              <BarraApilada
                etiqueta="Costo"
                total={costoMax}
                escalaMax={escalaCosto}
                segmentos={[
                  { color: COLOR_BRUTO, valor: principal.final },
                  { color: COLOR_CARGAS, valor: costoMax - principal.final },
                ]}
              />
              <BarraApilada
                etiqueta="Tarifa"
                total={tarifaSoles}
                escalaMax={escalaCosto}
                segmentos={[
                  {
                    color: COLOR_GRILLA,
                    valor: Math.min(costoMax, tarifaSoles),
                  },
                  {
                    color: principal.estado
                      ? COLOR_ESTADO[principal.estado]
                      : COLOR_ESTADO.OBSERVABLE,
                    valor: Math.max(tarifaSoles - costoMax, 0),
                  },
                ]}
              />
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                <Leyenda
                  color={COLOR_BRUTO}
                  texto={`Bruto al talento ${formatearEje(principal.final)}`}
                />
                {costoMax > principal.final && (
                  <Leyenda
                    color={COLOR_CARGAS}
                    texto={`Cargas ${formatearEje(costoMax - principal.final)}`}
                  />
                )}
                <Leyenda
                  color={
                    margenSoles !== null && margenSoles < 0
                      ? COLOR_ESTADO.RIESGO
                      : principal.estado
                        ? COLOR_ESTADO[principal.estado]
                        : COLOR_ESTADO.OBSERVABLE
                  }
                  texto={
                    margenSoles !== null && margenSoles < 0
                      ? `Pérdida ${formatearEje(Math.abs(margenSoles))}`
                      : `Margen ${formatearEje(margenSoles ?? 0)}`
                  }
                />
              </div>
            </>
          ) : (
            <PanelVacio>
              Falta el tipo de cambio para poder repartir la tarifa entre costo
              y margen.
            </PanelVacio>
          )}
        </Panel>
      ),
    },
    ...(!mostrarTolerancia
      ? []
      : [
          {
            label: "Tolerancia",
            children: (
              <Panel>
                <NotaPanel>
                  Cuánto puede acercarse la pretensión al punto de equilibrio
                  antes de dejar de considerarse holgada.
                </NotaPanel>

                <div className="flex items-baseline justify-between mb-2">
                  <label
                    htmlFor="tolerancia-riesgo"
                    className="text-sm text-gray-700"
                  >
                    Tolerancia para considerarlo Observable
                  </label>
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">
                    {toleranciaEfectivaPct}%
                  </span>
                </div>
                <input
                  id="tolerancia-riesgo"
                  type="range"
                  min={TOLERANCIA_MIN}
                  max={toleranciaTope}
                  step={1}
                  value={toleranciaEfectivaPct}
                  disabled={toleranciaTope <= TOLERANCIA_MIN}
                  onChange={(e) => setToleranciaPct(Number(e.target.value))}
                  className="w-full accent-[var(--color-primary)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{TOLERANCIA_MIN}%</span>
                  <span>{toleranciaTope}%</span>
                </div>

                {equilibrioPrincipal !== null && (
                  <>
                    <div className="flex items-baseline justify-between gap-3 text-[13px] leading-5 py-1.5 mt-2 border-t border-gray-200">
                      <span className="text-gray-500">Pedir menos de</span>
                      <span className="font-semibold text-gray-900 tabular-nums">
                        S/{" "}
                        {formatearMonto(equilibrioPrincipal * (1 - tolerancia))}{" "}
                        → Apto
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-3 text-[13px] leading-5 py-1.5 border-t border-gray-100">
                      <span className="text-gray-500">
                        De ahí hasta S/ {formatearMonto(equilibrioPrincipal)}
                      </span>
                      <span className="font-semibold text-gray-900">
                        Observable
                      </span>
                    </div>
                  </>
                )}

                {toleranciaTope < TOLERANCIA_MAX && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    {toleranciaTope <= TOLERANCIA_MIN
                      ? "No hay margen que ajustar: el talento ya pide igual o más que el punto de equilibrio."
                      : `Tope ${toleranciaTope}%: más allá, el umbral caería por debajo de lo que pide el talento.`}
                  </p>
                )}
              </Panel>
            ),
          },
        ]),
  ];

  if (sinPretension) {
    return (
      <div className="px-6 pb-6">
        <div className="flex items-start gap-2 p-4 rounded-lg bg-gray-50 text-sm text-gray-600">
          <Info className="w-5 h-5 min-w-5 text-gray-400 mt-0.5" />
          <span>No hay expectativa salarial con la cual comparar.</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── VEREDICTO ──────────────────────────────────────────────────
                Franja a todo el ancho bajo la cabecera: da el resultado sin
                gastar un bloque entero, y el color tiñe el modal entero de un
                vistazo. El icono y la etiqueta acompañan siempre al color. */}
      <div
        className={`flex items-center flex-wrap gap-x-2.5 gap-y-1 px-6 py-3 ${estiloFranja.fondo}`}
        title={principal.estado ? DESCRIPCION_ESTADO[principal.estado] : ""}
      >
        <IconoPrincipal className={`w-5 h-5 min-w-5 ${estiloFranja.acento}`} />
        <span className={`text-base font-semibold ${estiloFranja.titulo}`}>
          {principal.estado
            ? ETIQUETA_ESTADO[principal.estado]
            : "Sin comparar"}
        </span>
        <span className={`text-sm ${estiloFranja.detalle}`}>
          · {detalleFranja || `en ${tituloPrincipal}, la modalidad del talento`}
        </span>
      </div>

      <div className="px-6 pb-6">
        {/* Las cuatro cifras que se usan para decidir quedan FUERA de las
                  pestañas: son el resumen y tienen que seguir a la vista sea
                  cual sea el panel abierto. */}
        <div className="flex flex-wrap gap-x-6 gap-y-4 py-4 border-b border-gray-100">
          <Celda
            rotulo="Pide (bruto)"
            valor={`${principal.faltaTipoCambio ? "" : "S/ "}${formatearMonto(
              principal.inicial,
            )}${
              principal.final !== principal.inicial
                ? ` – ${formatearMonto(principal.final)}`
                : ""
            }`}
            nota={`en ${tituloPrincipal}`}
          />
          <Celda
            rotulo="Costo empresa"
            valor={
              comparable
                ? `S/ ${formatearMonto(costoMin)}${
                    costoMax !== costoMin
                      ? ` – ${formatearMonto(costoMax)}`
                      : ""
                  }`
                : "—"
            }
            /* Tres casos, no dos. «Sin cargas patronales» a secas salía
                     tanto cuando el talento va por honorarios —donde es cierto—
                     como cuando va por planilla pero el factor no llegó, que es
                     un fallo de configuración disfrazado de dato. */
            nota={
              principalEsRxH
                ? "sin cargas patronales"
                : factorPlanilla.configurado
                  ? "con cargas patronales"
                  : "sin cargas: falta el factor"
            }
            titulo={
              principalEsRxH
                ? "Recibo por honorarios: lo que se paga es lo que cuesta."
                : factorPlanilla.configurado
                  ? `Factor ${factorPlanilla.valor} sobre lo que pide el talento.`
                  : "No se pudo leer el factor de cargas; se está calculando sin ellas."
            }
          />
          <Celda
            rotulo="Tarifa del perfil"
            valor={
              tarifaSoles !== null
                ? `S/ ${formatearMonto(tarifaSoles)}`
                : `${datos.monedaTarifa || ""} ${formatearMonto(
                    datos.tarifa ?? 0,
                  )}`
            }
            nota={
              !esSoles(datos.idMonedaTarifa) && tarifaSoles !== null
                ? `orig. ${datos.monedaTarifa ?? ""} ${formatearMonto(
                    datos.tarifa ?? 0,
                  )}`
                : "mensual · soles"
            }
          />
          <Celda
            rotulo="Margen"
            valor={margen !== null ? `${margen.toFixed(1)}%` : "—"}
            colorValor={
              principal.estado
                ? BANDA_ESTADO[principal.estado].acento
                : undefined
            }
            nota={
              margenSoles !== null
                ? `S/ ${formatearMonto(margenSoles)} en el peor caso`
                : undefined
            }
          />
        </div>

        {/* Los avisos también quedan fuera: invalidan todos los paneles,
                  no solo el que esté abierto. */}
        {!factorPlanilla.configurado && (
          <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-900 mt-4">
            <Info className="w-5 h-5 min-w-5 mt-0.5" />
            <span>
              No se pudo leer el factor de cargas de planilla (parámetro{" "}
              {MAESTRO_FACTOR_PLANILLA}); se está calculando sin cargas, así que
              el margen de planilla sale mejor de lo que realmente es.
            </span>
          </div>
        )}

        {requiereTipoCambio && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 mt-4">
            <label
              htmlFor="tipo-cambio-riesgo"
              className="text-sm text-amber-900"
            >
              Tipo de cambio (soles por 1 unidad de moneda extranjera)
            </label>
            <input
              id="tipo-cambio-riesgo"
              type="number"
              step="0.001"
              min="0"
              value={tipoCambioTexto}
              onChange={(e) => setTipoCambioTexto(e.target.value)}
              placeholder="3.750"
              className="input w-28 mx-0"
            />
          </div>
        )}

        <div className="mt-4">
          <Tabs
            key={mostrarTolerancia ? "con-tolerancia" : "sin-tolerancia"}
            tabs={pestanas}
          />
        </div>
      </div>
    </>
  );
};
