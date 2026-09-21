import { ChevronRight, Info, Search, UserSearch } from "lucide-react";
import { FormEvent, useRef } from "react";
import { ExpedienteTalentoItem } from "../../models";
import { iniciales } from "../../utilities/expediente";

interface Props {
  talentos: ExpedienteTalentoItem[];
  loading: boolean;
  buscado: boolean;
  onBuscar: (termino: string) => void;
  onAbrir: (talento: ExpedienteTalentoItem) => void;
}

/**
 * Buscador del expediente.
 *
 * Sin filtros ni paginación a propósito: `SP_TALENTO_CTR_LST` sólo busca por
 * nombre completo, devuelve como máximo 5 talentos (los de contrato más
 * reciente) e ignora la página. Se muestra exactamente eso, dicho en la UI, en
 * vez de simular filtros que el backend no aplica.
 */
export const BuscadorTalentos = ({
  talentos,
  loading,
  buscado,
  onBuscar,
  onAbrir,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (evento: FormEvent) => {
    evento.preventDefault();
    onBuscar(inputRef.current?.value ?? "");
  };

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <form
        onSubmit={handleSubmit}
        className="shrink-0 rounded-lg border border-gray-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="buscar-expediente"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200"
            >
              Búsqueda por talento
            </label>
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
              />
              <input
                ref={inputRef}
                type="text"
                id="buscar-expediente"
                placeholder="Ej: Juan Perez"
                className="input h-10 w-full !py-0 !pl-10"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary mx-0 flex h-10 shrink-0 items-center justify-center gap-2 sm:w-32"
          >
            <Search size={18} strokeWidth={2} />
            Buscar
          </button>
        </div>
        <p className="mt-3 flex items-start gap-2 text-xs text-gray-500 dark:text-slate-400">
          <Info size={14} strokeWidth={1.8} className="mt-0.5 flex-none" />
          Se listan los talentos con contrato cuyo nombre coincide; el buscador
          devuelve como máximo 5, los de contrato más reciente.
        </p>
      </form>

      {talentos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-slate-600 dark:bg-slate-800">
          <UserSearch
            className="h-8 w-8 text-gray-400 dark:text-slate-500"
            strokeWidth={1.5}
          />
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">
            {buscado ? "Sin resultados" : "Busca un talento"}
          </p>
          <p className="max-w-md text-xs text-gray-500 dark:text-slate-400">
            {buscado
              ? "Ningún talento con contrato coincide con esa búsqueda."
              : "Escribe el nombre o apellido del talento para ver sus contratos, movimientos, solicitudes de equipo y ceses."}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th scope="col" className="table-header-cell uppercase">
                    Talento
                  </th>
                  <th scope="col" className="table-header-cell uppercase">
                    Código
                  </th>
                  <th scope="col" className="table-header-cell uppercase text-right">
                    Expediente
                  </th>
                </tr>
              </thead>
              <tbody>
                {talentos.map((talento) => {
                  const nombre = `${talento.nombres} ${talento.apellidos}`.trim();
                  return (
                    <tr key={talento.idTalento} className="table-row">
                      <td className="table-cell">
                        <span className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-slate-700 dark:text-slate-200"
                          >
                            {iniciales(nombre)}
                          </span>
                          <span className="font-semibold">{nombre}</span>
                        </span>
                      </td>
                      <td className="table-cell text-gray-500 dark:text-slate-400">
                        #{talento.idTalento}
                      </td>
                      <td className="table-cell text-right">
                        <button
                          type="button"
                          onClick={() => onAbrir(talento)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-[#0b85c3] transition-colors hover:bg-sky-50 dark:border-slate-600 dark:text-sky-400 dark:hover:bg-sky-400/10"
                        >
                          Ver expediente
                          <ChevronRight size={14} strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-200 px-4 py-3 text-xs text-gray-500 dark:border-slate-700 dark:text-slate-400">
            {talentos.length} talento{talentos.length === 1 ? "" : "s"} con
            contrato
          </div>
        </div>
      )}
    </div>
  );
};
