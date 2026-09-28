export type SeccionExpediente =
  | "resumen"
  | "contratos"
  | "movimientos"
  | "equipos"
  | "ceses";

export interface TabExpediente {
  id: SeccionExpediente;
  label: string;
  /** Sin contador en "Resumen": no es una lista. */
  total?: number;
}

interface Props {
  tabs: TabExpediente[];
  activa: SeccionExpediente;
  onChange: (seccion: SeccionExpediente) => void;
}

/** Pestañas del expediente, con el número de registros de cada sección. */
export const ExpedienteTabs = ({ tabs, activa, onChange }: Props) => (
  <div
    role="tablist"
    aria-label="Secciones del expediente"
    className="flex shrink-0 gap-2 overflow-x-auto border-b border-gray-200 dark:border-slate-700"
  >
    {tabs.map((tab) => {
      const seleccionada = tab.id === activa;
      return (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={seleccionada}
          onClick={() => onChange(tab.id)}
          className={`tab flex items-center gap-2 whitespace-nowrap ${
            seleccionada ? "tab-active" : "tab-inactive"
          }`}
        >
          {tab.label}
          {tab.total !== undefined && (
            <span
              className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                seleccionada
                  ? "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300"
                  : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300"
              }`}
            >
              {tab.total}
            </span>
          )}
        </button>
      );
    })}
  </div>
);
