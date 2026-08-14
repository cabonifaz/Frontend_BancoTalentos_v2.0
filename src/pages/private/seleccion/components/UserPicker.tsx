import { Loader2, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getSeleccionUsuarios,
  SelectionUser,
} from "../../../../core/services/seleccion.service";

interface Props {
  value: SelectionUser | null;
  onChange: (user: SelectionUser | null) => void;
}

/**
 * Combo buscable de usuarios de selección (solo Admin). Busca contra
 * /seleccion/usuarios con debounce; al elegir uno filtra el total/serie a ese
 * usuario. Mostrar un chip con "X" para volver a "Todos".
 */
export const UserPicker = ({ value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [users, setUsers] = useState<SelectionUser[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await getSeleccionUsuarios(term.trim(), {
          signal: controller.signal,
        });
        if (data.baseResponse?.idTipoMensaje === 2) setUsers(data.data ?? []);
        else setUsers([]);
      } catch {
        /* abortado o error: se ignora */
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [term, open]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={boxRef} className="relative flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500">Usuario de selección</span>

      {value ? (
        <div className="flex h-9 items-center gap-2 rounded-lg border border-[#009688]/40 bg-[#009688]/5 px-3 text-sm text-gray-700">
          <span className="max-w-[180px] truncate">
            {value.nombre || `@${value.usuario}`}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-full p-0.5 text-gray-400 hover:bg-gray-200"
            aria-label="Quitar filtro de usuario"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={term}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setTerm(e.target.value);
              setOpen(true);
            }}
            placeholder="Buscar usuario…"
            className="h-9 w-[240px] rounded-lg border border-gray-300 pl-8 pr-3 text-sm text-gray-700 focus:border-[#009688] focus:outline-none focus:ring-1 focus:ring-[#009688]"
          />
        </div>
      )}

      {open && !value && (
        <div className="absolute top-full z-20 mt-1 w-[280px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="max-h-56 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-5 text-sm text-gray-400">
                <Loader2 size={15} className="animate-spin" /> Buscando…
              </div>
            ) : users.length === 0 ? (
              <div className="py-5 text-center text-sm text-gray-400">
                Sin resultados.
              </div>
            ) : (
              users.map((u) => (
                <button
                  key={`${u.idUsuario}-${u.usuario}`}
                  type="button"
                  onClick={() => {
                    onChange(u);
                    setOpen(false);
                    setTerm("");
                  }}
                  className="flex w-full flex-col items-start px-3 py-2 text-left transition-colors hover:bg-[#009688]/10"
                >
                  <span className="text-sm font-medium text-gray-800">
                    {u.nombre || `@${u.usuario}`}
                  </span>
                  <span className="text-xs text-gray-400">
                    @{u.usuario}
                    {u.email ? ` · ${u.email}` : ""}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
