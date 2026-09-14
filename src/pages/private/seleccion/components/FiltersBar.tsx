import { Search } from "lucide-react";
import { ReactNode } from "react";
import { Client } from "@/core/models/interfaces/Client";
import { Button } from "@/core/components/ui/shadcn/button";
import { AppSelect } from "@/core/components/ui/AppSelect";
import { DatePicker } from "@/core/components/ui/DatePicker";

export interface FiltersState {
  fechaIni: string;
  fechaFin: string;
  idCliente: number | null;
  /** Usuario de selección (USUCRE) elegido por el Admin. Solo Entrevistas. */
  usucre?: string | null;
}

interface Props {
  value: FiltersState;
  onChange: (next: FiltersState) => void;
  onApply: () => void;
  loading?: boolean;
  showClient?: boolean;
  clientes?: Client[];
  /** Filtros extra (p. ej. el buscador de usuario del Admin), dentro de la barra. */
  children?: ReactNode;
}

// Controles de 36px con el foco en el verde del módulo.
const dateCls =
  "h-9 w-40 border-gray-300 px-3 py-0 text-sm text-gray-700 focus-visible:ring-[#009688] dark:border-slate-600 dark:text-slate-200";
const selectCls =
  "h-9 border-gray-300 px-3 py-0 text-sm text-gray-700 focus:ring-[#009688] dark:border-slate-600 dark:text-slate-200";

/** Barra de filtros de una sección: rango de fechas + cliente opcional + aplicar. */
export const FiltersBar = ({
  value,
  onChange,
  onApply,
  loading,
  showClient,
  clientes = [],
  children,
}: Props) => {
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply();
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-end justify-center gap-3 rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/60"
    >
      {/* Cada extremo limita al otro, como hacían min/max en los
          <input type="date">. Una fecha se puede vaciar (volviendo a pulsarla):
          algunas secciones arrancan sin fechas y "vacío" significa sin filtro. */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="seleccion-fecha-ini"
          className="text-xs font-medium text-gray-500 dark:text-slate-400"
        >
          Desde
        </label>
        <DatePicker
          id="seleccion-fecha-ini"
          className={dateCls}
          value={value.fechaIni}
          max={value.fechaFin}
          onChange={(fechaIni) => onChange({ ...value, fechaIni })}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="seleccion-fecha-fin"
          className="text-xs font-medium text-gray-500 dark:text-slate-400"
        >
          Hasta
        </label>
        <DatePicker
          id="seleccion-fecha-fin"
          className={dateCls}
          value={value.fechaFin}
          min={value.fechaIni}
          onChange={(fechaFin) => onChange({ ...value, fechaFin })}
        />
      </div>

      {showClient && (
        <label className="flex flex-col gap-1 min-w-[220px]">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Cliente</span>
          <AppSelect
            aria-label="Cliente"
            value={value.idCliente ?? ""}
            onChange={(v) =>
              onChange({
                ...value,
                idCliente: v ? Number(v) : null,
              })
            }
            options={clientes.map((c) => ({
              value: c.idCliente,
              label: c.razonSocial,
            }))}
            placeholder="Todos los clientes"
            className={selectCls}
          />
        </label>
      )}

      {children}

      <Button
        type="submit"
        disabled={loading}
        className="h-9 bg-[#009688] px-4 py-0 text-sm font-medium hover:bg-[#00796B] disabled:opacity-60"
      >
        <Search size={16} />
        {loading ? "Cargando…" : "Aplicar"}
      </Button>
    </form>
  );
};
