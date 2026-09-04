import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { fmtNumber, fmtShare, Slice } from "./chartTheme";
import { useChartChrome } from "./useChartChrome";

/**
 * Torta (dona) de composición: cuánto aporta cada parte al total.
 *
 * Sólo es la forma correcta cuando la pregunta es "de qué se compone el total"
 * de un vistazo, y con <= 6 segmentos — por eso los datos entran ya plegados con
 * `topNWithOther`. Para comparar magnitudes parecidas o rankear, la barra sigue
 * siendo mejor: por eso las secciones ofrecen ambas vistas.
 *
 * La leyenda lateral lleva nombre + valor + % de cada segmento, así que hace de
 * vista de tabla: ningún valor queda detrás del hover.
 */

interface TooltipPayloadItem {
  payload?: Slice;
}

const DonutTooltip = ({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  total: number;
}) => {
  const slice = active ? payload?.[0]?.payload : undefined;
  if (!slice) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
          style={{ backgroundColor: slice.color }}
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-gray-800 dark:text-slate-100">{slice.label}</span>
      </div>
      <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
        <span className="font-semibold text-gray-900 dark:text-slate-50">
          {fmtNumber(slice.cantidad)}
        </span>{" "}
        · {fmtShare(slice.cantidad, total)} del total
      </p>
    </div>
  );
};

export const DonutChart = ({
  slices,
  totalLabel,
  unitLabel,
}: {
  slices: Slice[];
  /** Rótulo bajo el número central. */
  totalLabel: string;
  /** Cabecera de la columna de valores en la leyenda. */
  unitLabel: string;
}) => {
  const chrome = useChartChrome();
  const total = slices.reduce((acc, s) => acc + s.cantidad, 0);

  return (
    <div className="flex h-full flex-col gap-4 md:flex-row md:items-center">
      {/* Dona + número central */}
      <div className="relative h-full min-h-[220px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="cantidad"
              nameKey="label"
              innerRadius="62%"
              outerRadius="88%"
              startAngle={90}
              endAngle={-270}
              /* El trazo del color de superficie ES la separación de 2px entre
                 sectores. No es un borde: no añade tinta con peso de dato. */
              stroke={chrome.surface}
              strokeWidth={2}
              isAnimationActive={false}
            >
              {slices.map((s) => (
                <Cell key={s.key} fill={s.color} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip total={total} />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Total al centro. Cifras proporcionales: es un número suelto grande. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-gray-900 dark:text-slate-50">
            {fmtNumber(total)}
          </span>
          <span className="text-xs text-gray-500 dark:text-slate-400">{totalLabel}</span>
        </div>
      </div>

      {/* Leyenda con valores: canal de identidad + vista de tabla */}
      <div className="max-h-full w-full overflow-y-auto md:w-[260px] md:flex-shrink-0">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Composición por segmento: {unitLabel} y porcentaje del total
          </caption>
          <thead>
            <tr className="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">
              <th scope="col" className="pb-1 text-left font-medium">
                Segmento
              </th>
              <th scope="col" className="pb-1 text-right font-medium">
                {unitLabel}
              </th>
              <th scope="col" className="pb-1 text-right font-medium">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {slices.map((s) => (
              <tr key={s.key} className="border-t border-gray-100 dark:border-slate-700">
                <th
                  scope="row"
                  className="py-1.5 pr-2 text-left font-normal text-gray-700 dark:text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                      style={{ backgroundColor: s.color }}
                      aria-hidden="true"
                    />
                    <span className="truncate" title={s.label}>
                      {s.label}
                    </span>
                  </span>
                </th>
                <td className="py-1.5 text-right tabular-nums text-gray-900 dark:text-slate-50">
                  {fmtNumber(s.cantidad)}
                </td>
                <td className="py-1.5 pl-2 text-right tabular-nums text-gray-500 dark:text-slate-400">
                  {fmtShare(s.cantidad, total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
