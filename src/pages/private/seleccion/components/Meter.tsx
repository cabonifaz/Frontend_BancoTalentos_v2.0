import { fmtNumber, fmtPercent, METER_TRACK, SERIES } from "./chartTheme";

/**
 * Medidor de una razón contra su total.
 *
 * Deliberadamente NO es una torta de dos porciones: para un solo ratio la torta
 * es ruido — dos sectores obligan a comparar ángulos para leer un número que ya
 * está escrito. La pista sin rellenar es un paso claro del mismo hue del relleno,
 * así el estado se lee a lo largo de toda la barra.
 *
 * El relleno se queda en el color de acento: no hay umbral de negocio definido
 * para la tasa de conversión, así que pintarlo de rojo/ámbar inventaría una
 * severidad que nadie ha acordado.
 */
export const Meter = ({
  label,
  value,
  total,
  valueLabel,
  totalLabel,
}: {
  label: string;
  /** Numerador (p. ej. ingresos concretados). */
  value: number;
  /** Denominador (p. ej. entrevistas realizadas). */
  total: number;
  valueLabel: string;
  totalLabel: string;
}) => {
  const ratio = total > 0 ? value / total : NaN;
  const pct = Number.isFinite(ratio) ? Math.min(Math.max(ratio, 0), 1) : 0;

  return (
    <div className="min-w-[280px] flex-1 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">
          {fmtPercent(ratio)}
        </p>
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: METER_TRACK }}
        role="meter"
        aria-valuenow={Number.isFinite(ratio) ? Math.round(pct * 100) : undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct * 100}%`, backgroundColor: SERIES[0] }}
        />
      </div>

      <p className="mt-2 text-xs text-gray-500">
        {fmtNumber(value)} {valueLabel} sobre {fmtNumber(total)} {totalLabel}
      </p>
    </div>
  );
};
