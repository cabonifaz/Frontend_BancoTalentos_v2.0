import { Search } from "lucide-react";
import { ReactNode } from "react";
import { Client } from "../../../../core/models/interfaces/Client";

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

const inputCls =
  "h-9 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 focus:border-[#009688] focus:outline-none focus:ring-1 focus:ring-[#009688] dark:border-slate-600 dark:text-slate-200";

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
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Desde</span>
        <input
          type="date"
          className={inputCls}
          value={value.fechaIni}
          max={value.fechaFin}
          onChange={(e) => onChange({ ...value, fechaIni: e.target.value })}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Hasta</span>
        <input
          type="date"
          className={inputCls}
          value={value.fechaFin}
          min={value.fechaIni}
          onChange={(e) => onChange({ ...value, fechaFin: e.target.value })}
        />
      </label>

      {showClient && (
        <label className="flex flex-col gap-1 min-w-[220px]">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Cliente</span>
          <select
            className={inputCls}
            value={value.idCliente ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                idCliente: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">Todos los clientes</option>
            {clientes.map((c) => (
              <option key={c.idCliente} value={c.idCliente}>
                {c.razonSocial}
              </option>
            ))}
          </select>
        </label>
      )}

      {children}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#009688] px-4 text-sm font-medium text-white transition-colors hover:bg-[#00796B] disabled:opacity-60"
      >
        <Search size={16} />
        {loading ? "Cargando…" : "Aplicar"}
      </button>
    </form>
  );
};
