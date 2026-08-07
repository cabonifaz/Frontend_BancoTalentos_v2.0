import { useEffect, useRef, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { getUsersAdmin } from "../../../../core/services/apiService";
import { handleError } from "../../../../core/utilities/errorHandler";
import { UserAdmin } from "../../../../core/models";

interface Props {
  /** IDs ya asignados en el otro slot: se ocultan para evitar duplicados. */
  excludeIds?: number[];
  onSelect: (user: UserAdmin) => void;
  onCancel: () => void;
}

/**
 * Combo buscable de usuarios ACTIVOS (reusa el listado del módulo de Usuarios).
 * SUPERADMIN incluido. Filtra por usuario/nombre/email conforme se escribe.
 */
export const UserSearchSelect = ({ excludeIds = [], onSelect, onCancel }: Props) => {
  const [term, setTerm] = useState("");
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await getUsersAdmin({
          filtro: term.trim() || undefined,
          idEstado: 1,
          pagina: 1,
        });
        setUsers(data.registros ?? []);
      } catch (e) {
        handleError(e as Error, enqueueSnackbar);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [term]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => inputRef.current?.focus(), []);

  const visibles = users.filter((u) => !excludeIds.includes(u.idUsuario));

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="relative border-b border-gray-100">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar usuario por nombre o correo…"
          className="w-full bg-transparent py-2.5 pl-9 pr-9 text-sm outline-none"
        />
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:bg-gray-100"
          aria-label="Cancelar"
        >
          <X size={15} />
        </button>
      </div>

      <div className="max-h-56 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
            <Loader2 size={15} className="animate-spin" /> Buscando…
          </div>
        ) : visibles.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-400">
            No se encontraron usuarios.
          </div>
        ) : (
          visibles.map((u) => (
            <button
              key={u.idUsuario}
              type="button"
              onClick={() => onSelect(u)}
              className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-[#009688]/10 transition-colors"
            >
              <span className="text-sm font-medium text-gray-800">
                {`${u.nombres ?? ""} ${u.apellidos ?? ""}`.trim() || `@${u.usuario}`}
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
  );
};

export default UserSearchSelect;
