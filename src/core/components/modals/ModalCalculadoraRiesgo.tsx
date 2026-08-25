import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { RotateCcw, X } from "lucide-react";
import { PanelRiesgo } from "../ui/PanelRiesgo";
import type { DatosRiesgo } from "../ui/PanelRiesgo";
import {
  GRUPO_FACT_PLANILLA,
  GRUPO_FACT_RXH,
  MAESTRO_MODALIDAD_FACT,
  MONEDA_SOLES,
} from "../../utilities/riesgoTalento";
import type { FilaBanda } from "../../utilities/riesgoTalento";
import { useParams } from "../../context/ParamsContext";

interface Props {
  onClose: () => void;
}

/** Los cinco conceptos de la banda, con el campo de `FilaBanda` que alimentan. */
const CONCEPTOS = [
  { etiqueta: "Básico", min: "minBaseAmount", max: "maxBaseAmount" },
  {
    etiqueta: "Movilidad",
    min: "minTravelAllowance",
    max: "maxTravelAllowance",
  },
  { etiqueta: "Mensual", min: "minMonthlyAmount", max: "maxMonthlyAmount" },
  {
    etiqueta: "Trimestral",
    min: "minQuarterlyAmount",
    max: "maxQuarterlyAmount",
  },
  {
    etiqueta: "Semestral",
    min: "minSemiAnnualAmount",
    max: "maxSemiAnnualAmount",
  },
] as const;

type Importes = Record<string, string>;

interface Formulario {
  idModalidadFacturacion: number;
  tarifa: string;
  idMonedaTarifa: number;
  planMin: string;
  planMax: string;
  idMonedaPlan: number;
  rxhMin: string;
  rxhMax: string;
  idMonedaRxh: number;
  bandaPlanilla: Importes;
  idMonedaBandaPlanilla: number;
  bandaRxh: Importes;
  idMonedaBandaRxh: number;
}

const VACIO: Formulario = {
  idModalidadFacturacion: 0,
  tarifa: "",
  idMonedaTarifa: MONEDA_SOLES,
  planMin: "",
  planMax: "",
  idMonedaPlan: MONEDA_SOLES,
  rxhMin: "",
  rxhMax: "",
  idMonedaRxh: MONEDA_SOLES,
  bandaPlanilla: {},
  idMonedaBandaPlanilla: MONEDA_SOLES,
  bandaRxh: {},
  idMonedaBandaRxh: MONEDA_SOLES,
};

// Solo en este navegador: la calculadora es un borrador para tantear
// escenarios, y perderlo al cerrar el modal obliga a reescribirlo todo.
const CLAVE_BORRADOR = "calculadoraRiesgo";

const leerBorrador = (): Formulario => {
  try {
    const guardado = localStorage.getItem(CLAVE_BORRADOR);
    if (!guardado) return VACIO;
    // Se mezcla sobre VACIO para que un borrador viejo, de antes de que
    // existiera algún campo, no deje propiedades sin definir.
    return { ...VACIO, ...JSON.parse(guardado) };
  } catch {
    return VACIO;
  }
};

const numero = (texto: string): number => {
  const valor = Number((texto ?? "").replace(",", "."));
  return Number.isFinite(valor) && valor > 0 ? valor : 0;
};

/**
 * Pasa los importes escritos de un grupo a la forma que espera el motor.
 *
 * Se enumeran los diez campos a mano en vez de recorrer CONCEPTOS: asignarlos
 * por clave obligaba a castear la fila a un diccionario, y ese cast apagaba
 * justo la comprobacion que evita equivocarse de campo.
 */
const aFilaBanda = (
  idGrupoModalidad: number,
  importes: Importes,
  currencyType: number,
): FilaBanda => ({
  idGrupoModalidad,
  currencyType,
  minBaseAmount: numero(importes.minBaseAmount),
  maxBaseAmount: numero(importes.maxBaseAmount),
  minTravelAllowance: numero(importes.minTravelAllowance),
  maxTravelAllowance: numero(importes.maxTravelAllowance),
  minMonthlyAmount: numero(importes.minMonthlyAmount),
  maxMonthlyAmount: numero(importes.maxMonthlyAmount),
  minQuarterlyAmount: numero(importes.minQuarterlyAmount),
  maxQuarterlyAmount: numero(importes.maxQuarterlyAmount),
  minSemiAnnualAmount: numero(importes.minSemiAnnualAmount),
  maxSemiAnnualAmount: numero(importes.maxSemiAnnualAmount),
});

const Campo = ({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: ReactNode;
}) => (
  <label className="flex flex-col gap-1 flex-1 min-w-[110px]">
    <span className="text-[11px] leading-4 uppercase tracking-wide text-gray-400">
      {etiqueta}
    </span>
    {children}
  </label>
);

const Importe = ({
  valor,
  onChange,
  placeholder = "0.00",
}: {
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <input
    type="number"
    min="0"
    step="0.01"
    value={valor}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    className="p-2 border border-gray-300 rounded-lg text-sm text-right outline-none focus:border-gray-400 w-full"
  />
);

const Selector = ({
  valor,
  onChange,
  opciones,
  vacio,
}: {
  valor: number;
  onChange: (v: number) => void;
  opciones: { valor: number; texto: string }[];
  vacio?: string;
}) => (
  <select
    value={valor}
    onChange={(e) => onChange(Number(e.target.value))}
    className="p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-gray-400 cursor-pointer w-full"
  >
    {vacio && <option value={0}>{vacio}</option>}
    {opciones.map((opcion) => (
      <option key={opcion.valor} value={opcion.valor}>
        {opcion.texto}
      </option>
    ))}
  </select>
);

const TituloBloque = ({ children }: { children: ReactNode }) => (
  <h3 className="text-[13px] leading-[18px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
    {children}
  </h3>
);

/**
 * La misma calculadora de riesgo, pero sin talento ni RQ detrás: todo se
 * escribe a mano.
 *
 * Sirve para tantear un escenario antes de que exista el registro — negociar
 * una pretensión, ver qué banda haría falta para que un perfil salga rentable.
 * No guarda nada en base de datos; el último formulario queda en el navegador.
 *
 * El veredicto sale del mismo {@link PanelRiesgo} que usa Asignar Talento, así
 * que las dos vistas no pueden dar resultados distintos.
 */
export const ModalCalculadoraRiesgo = ({ onClose }: Props) => {
  const { paramsByMaestro } = useParams();
  const [form, setForm] = useState<Formulario>(leerBorrador);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(form));
    } catch {
      // Modo privado o almacenamiento lleno: se pierde el borrador, nada más.
    }
  }, [form]);

  const set = <K extends keyof Formulario>(campo: K, valor: Formulario[K]) =>
    setForm((actual) => ({ ...actual, [campo]: valor }));

  const limpiar = () => setForm(VACIO);

  const setBanda = (
    grupo: "bandaPlanilla" | "bandaRxh",
    campo: string,
    valor: string,
  ) =>
    setForm((actual) => ({
      ...actual,
      [grupo]: { ...actual[grupo], [campo]: valor },
    }));

  const monedas = (paramsByMaestro[2] ?? []).map((moneda) => ({
    valor: moneda.num1,
    texto: moneda.string1,
  }));
  const modalidades = (paramsByMaestro[MAESTRO_MODALIDAD_FACT] ?? []).map(
    (modalidad) => ({ valor: modalidad.num1, texto: modalidad.string1 }),
  );

  const datos: DatosRiesgo = useMemo(
    () => ({
      montoInicialPlanilla: numero(form.planMin),
      montoFinalPlanilla: numero(form.planMax),
      idMonedaPlan: form.idMonedaPlan,
      montoInicialRxH: numero(form.rxhMin),
      montoFinalRxH: numero(form.rxhMax),
      idMonedaRxh: form.idMonedaRxh,
      idModalidadFacturacion: form.idModalidadFacturacion,
      tarifa: numero(form.tarifa),
      idMonedaTarifa: form.idMonedaTarifa,
      banda: [
        aFilaBanda(
          GRUPO_FACT_PLANILLA,
          form.bandaPlanilla,
          form.idMonedaBandaPlanilla,
        ),
        aFilaBanda(GRUPO_FACT_RXH, form.bandaRxh, form.idMonedaBandaRxh),
      ],
    }),
    [form],
  );

  const hayTarifa = numero(form.tarifa) > 0;
  const hayPretension =
    numero(form.planMin) > 0 ||
    numero(form.planMax) > 0 ||
    numero(form.rxhMin) > 0 ||
    numero(form.rxhMax) > 0;

  const filaBanda = (grupo: "bandaPlanilla" | "bandaRxh") => (
    <div className="grid grid-cols-[88px_1fr_1fr] gap-x-2 gap-y-1.5 items-center">
      <span />
      <span className="text-[11px] leading-4 uppercase tracking-wide text-gray-400 text-right pr-2">
        Mínimo
      </span>
      <span className="text-[11px] leading-4 uppercase tracking-wide text-gray-400 text-right pr-2">
        Máximo
      </span>
      {CONCEPTOS.map((concepto) => (
        <div key={concepto.etiqueta} className="contents">
          <span className="text-[13px] text-gray-600">{concepto.etiqueta}</span>
          <Importe
            valor={form[grupo][concepto.min] ?? ""}
            onChange={(v) => setBanda(grupo, concepto.min, v)}
          />
          <Importe
            valor={form[grupo][concepto.max] ?? ""}
            onChange={(v) => setBanda(grupo, concepto.max, v)}
          />
        </div>
      ))}
    </div>
  );

  return (
    // Mismo nivel que el resto de modales de la pantalla: por debajo del rail
    // del sidebar (z-40) y del logo de Fractal (z-[42]).
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Calculadora de riesgo
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Sin talento ni requerimiento: los datos se escriben a mano.
            </p>
          </div>
          <div className="flex items-center gap-1">
            {/* Repetido tambien en el pie: el formulario es largo y llegar al
                boton de abajo obliga a recorrer todo el modal. */}
            <button
              type="button"
              onClick={limpiar}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              title="Vaciar todos los campos"
            >
              <RotateCcw className="w-4 h-4" />
              Limpiar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-6">
          {/* ── TARIFA Y MODALIDAD ─────────────────────────────────────── */}
          <div className="pb-4 border-b border-gray-100">
            <TituloBloque>Tarifa del perfil</TituloBloque>
            <div className="flex flex-wrap gap-3">
              <Campo etiqueta="Tarifa mensual">
                <Importe
                  valor={form.tarifa}
                  onChange={(v) => set("tarifa", v)}
                />
              </Campo>
              <Campo etiqueta="Moneda">
                <Selector
                  valor={form.idMonedaTarifa}
                  onChange={(v) => set("idMonedaTarifa", v)}
                  opciones={monedas}
                />
              </Campo>
              <Campo etiqueta="Modalidad del talento">
                <Selector
                  valor={form.idModalidadFacturacion}
                  onChange={(v) => set("idModalidadFacturacion", v)}
                  opciones={modalidades}
                  vacio="Sin definir"
                />
              </Campo>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              La modalidad decide si se aplican cargas patronales y qué carril
              manda en el veredicto.
            </p>
          </div>

          {/* ── PRETENSIÓN ─────────────────────────────────────────────── */}
          <div className="py-4 border-b border-gray-100">
            <TituloBloque>Pretensión del talento</TituloBloque>
            <div className="flex flex-wrap gap-3 mb-3">
              <Campo etiqueta="Planilla · mínimo">
                <Importe
                  valor={form.planMin}
                  onChange={(v) => set("planMin", v)}
                />
              </Campo>
              <Campo etiqueta="Planilla · máximo">
                <Importe
                  valor={form.planMax}
                  onChange={(v) => set("planMax", v)}
                />
              </Campo>
              <Campo etiqueta="Moneda">
                <Selector
                  valor={form.idMonedaPlan}
                  onChange={(v) => set("idMonedaPlan", v)}
                  opciones={monedas}
                />
              </Campo>
            </div>
            <div className="flex flex-wrap gap-3">
              <Campo etiqueta="Honorarios · mínimo">
                <Importe
                  valor={form.rxhMin}
                  onChange={(v) => set("rxhMin", v)}
                />
              </Campo>
              <Campo etiqueta="Honorarios · máximo">
                <Importe
                  valor={form.rxhMax}
                  onChange={(v) => set("rxhMax", v)}
                />
              </Campo>
              <Campo etiqueta="Moneda">
                <Selector
                  valor={form.idMonedaRxh}
                  onChange={(v) => set("idMonedaRxh", v)}
                  opciones={monedas}
                />
              </Campo>
            </div>
          </div>

          {/* ── BANDA DEL RQ ───────────────────────────────────────────── */}
          <div className="py-4 border-b border-gray-100">
            <TituloBloque>Banda del RQ</TituloBloque>
            <p className="text-xs text-gray-400 mb-3">
              Opcional. Se mensualiza sola: el trimestral se divide entre 3 y el
              semestral entre 6.
            </p>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[13px] font-medium text-gray-700">
                    Planilla
                  </span>
                  <div className="w-28">
                    <Selector
                      valor={form.idMonedaBandaPlanilla}
                      onChange={(v) => set("idMonedaBandaPlanilla", v)}
                      opciones={monedas}
                    />
                  </div>
                </div>
                {filaBanda("bandaPlanilla")}
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[13px] font-medium text-gray-700">
                    Recibo por honorarios
                  </span>
                  <div className="w-28">
                    <Selector
                      valor={form.idMonedaBandaRxh}
                      onChange={(v) => set("idMonedaBandaRxh", v)}
                      opciones={monedas}
                    />
                  </div>
                </div>
                {filaBanda("bandaRxh")}
              </div>
            </div>
          </div>
        </div>

        {/* ── RESULTADO ────────────────────────────────────────────────── */}
        {hayTarifa && hayPretension ? (
          <PanelRiesgo datos={datos} />
        ) : (
          <div className="px-6 pt-4">
            <div className="p-4 rounded-lg bg-gray-50 text-sm text-gray-500">
              Escribe la tarifa del perfil y al menos una pretensión para ver el
              veredicto.
            </div>
          </div>
        )}

        <div className="flex justify-between items-center gap-3 px-6 py-6">
          <button
            type="button"
            onClick={limpiar}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline-gray mx-0"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
