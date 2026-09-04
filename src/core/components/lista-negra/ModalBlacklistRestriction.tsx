import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { Search, X } from "lucide-react";
import { Modal } from "../modals/Modal";
import { Loading } from "../ui/Loading";
import { useModal } from "../../context/ModalContext";
import { useBlacklist } from "../../hooks/lista-negra/useBlacklist";
import { getTalents } from "../../services/talents.service";
import { BlacklistItem, Talent } from "../../models";
import { Client } from "../../models/interfaces/Client";

export const MODAL_BLACKLIST_RESTRICTION = "modalBlacklistRestriction";

interface Props {
  mode: "add" | "edit";
  idTalento: number | null;
  talentName?: string;
  restriction?: BlacklistItem | null;
  /**
   * Habilita el buscador de talentos dentro del modal, para registrar a
   * cualquier talento desde el propio módulo sin pasar por el detalle.
   */
  allowTalentSearch?: boolean;
  /** Listado de clientes, izado al padre para no volver a pedir /fmi/client/list. */
  clientes: Client[];
  onSaved: () => void;
}

const selectClass =
  "w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200";

const fullName = (t: Talent) =>
  `${t.nombres} ${t.apellidoPaterno} ${t.apellidoMaterno ?? ""}`.trim();

/**
 * Modal para agregar o editar una restricción dentro del módulo Lista Negra.
 * - "add": se elige cliente (o TODOS = 0) y motivo. El talento viene dado por
 *   `idTalento`, o se busca dentro del modal si `allowTalentSearch`.
 * - "edit": el cliente es fijo (SP_UPD solo actualiza el motivo).
 */
export const ModalBlacklistRestriction = ({
  mode,
  idTalento,
  talentName,
  restriction,
  allowTalentSearch = false,
  clientes,
  onSaved,
}: Props) => {
  const { closeModal, isModalOpen } = useModal();
  const { createRestriction, updateRestriction, saving } = useBlacklist();

  const [idCliente, setIdCliente] = useState<number | "">("");
  const [motivo, setMotivo] = useState("");

  // Buscador de talentos (solo cuando allowTalentSearch).
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Talent[]>([]);
  const [searching, setSearching] = useState(false);
  const [pickedTalent, setPickedTalent] = useState<Talent | null>(null);

  const isEdit = mode === "edit";
  const isOpen = isModalOpen(MODAL_BLACKLIST_RESTRICTION);

  // Sincroniza el formulario cada vez que cambia el objetivo del modal o se
  // vuelve a abrir (el componente permanece montado entre aperturas).
  useEffect(() => {
    if (!isOpen) return;
    if (isEdit && restriction) {
      setIdCliente(restriction.idCliente);
      setMotivo(restriction.motivo);
    } else {
      setIdCliente("");
      setMotivo("");
    }
    setQuery("");
    setResults([]);
    setPickedTalent(null);
  }, [isOpen, isEdit, restriction]);

  // Búsqueda de talentos con debounce.
  useEffect(() => {
    if (!allowTalentSearch || isEdit || pickedTalent) return;

    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }

    let active = true;
    setSearching(true);
    const timer = setTimeout(() => {
      getTalents({ search: term, nPag: 1 })
        .then(({ data }) => {
          if (!active) return;
          setResults(data.result?.idMensaje === 2 ? data.talents ?? [] : []);
        })
        .catch(() => {
          if (active) setResults([]);
        })
        .finally(() => {
          if (active) setSearching(false);
        });
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, allowTalentSearch, isEdit, pickedTalent]);

  const targetTalentId = pickedTalent?.idTalento ?? idTalento;

  const handleConfirm = async () => {
    if (!motivo.trim()) {
      enqueueSnackbar({ message: "Ingrese el motivo", variant: "warning" });
      return;
    }

    let ok = false;
    if (isEdit && restriction) {
      ok = await updateRestriction({
        idListaNegra: restriction.idListaNegra,
        motivo: motivo.trim(),
      });
    } else {
      if (targetTalentId == null) {
        enqueueSnackbar({ message: "Seleccione un talento", variant: "warning" });
        return;
      }
      if (idCliente === "") {
        enqueueSnackbar({
          message: "Seleccione el cliente a restringir",
          variant: "warning",
        });
        return;
      }
      ok = await createRestriction({
        idTalento: targetTalentId,
        idCliente: Number(idCliente),
        motivo: motivo.trim(),
      });
    }

    if (ok) {
      closeModal(MODAL_BLACKLIST_RESTRICTION);
      onSaved();
    }
  };

  const showTalentSearch = allowTalentSearch && !isEdit;
  const displayName = pickedTalent ? fullName(pickedTalent) : talentName;

  return (
    <Modal
      id={MODAL_BLACKLIST_RESTRICTION}
      title={isEdit ? "Editar restricción" : "Agregar restricción"}
      confirmationLabel={isEdit ? "Guardar" : "Restringir"}
      onConfirm={handleConfirm}
    >
      {saving && <Loading opacity="opacity-60" />}
      <div className="flex flex-col gap-4 mt-2">
        {showTalentSearch ? (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-200">Talento</label>

            {pickedTalent ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 dark:bg-indigo-500/10">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate dark:text-slate-100">
                    {fullName(pickedTalent)}
                  </p>
                  {pickedTalent.puesto && (
                    <p className="text-xs text-[#71717A] truncate dark:text-slate-400">
                      {pickedTalent.puesto}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setPickedTalent(null)}
                  title="Elegir otro talento"
                  className="flex-shrink-0 text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex relative h-10">
                  <Search className="absolute top-2 left-3 text-gray-400 dark:text-slate-500" size={20} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar talento por nombre"
                    className={`${selectClass} pl-10`}
                  />
                </div>

                {query.trim().length >= 2 && (
                  <div className="mt-1 max-h-44 overflow-y-auto rounded-lg border border-gray-200 dark:border-slate-700">
                    {searching ? (
                      <p className="p-3 text-sm text-[#71717A] dark:text-slate-400">Buscando…</p>
                    ) : results.length === 0 ? (
                      <p className="p-3 text-sm text-[#71717A] dark:text-slate-400">
                        Sin resultados.
                      </p>
                    ) : (
                      results.map((t) => (
                        <button
                          key={t.idTalento}
                          type="button"
                          onClick={() => setPickedTalent(t)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 dark:hover:bg-slate-700 dark:border-slate-700"
                        >
                          <p className="text-sm text-gray-800 truncate dark:text-slate-100">
                            {fullName(t)}
                          </p>
                          {t.puesto && (
                            <p className="text-xs text-[#71717A] truncate dark:text-slate-400">
                              {t.puesto}
                            </p>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          displayName && (
            <p className="text-sm text-gray-600 dark:text-slate-300">
              Talento:{" "}
              <span className="font-semibold text-gray-800 dark:text-slate-100">{displayName}</span>
            </p>
          )
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-200">Cliente</label>
          {isEdit ? (
            <input
              type="text"
              value={restriction?.cliente ?? ""}
              disabled
              className={`${selectClass} bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400`}
            />
          ) : (
            <select
              value={idCliente}
              onChange={(e) =>
                setIdCliente(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className={selectClass}
            >
              <option value="">Elija un cliente</option>
              <option value={0}>TODOS LOS CLIENTES</option>
              {clientes.map((c) => (
                <option key={c.idCliente} value={c.idCliente}>
                  {c.razonSocial}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-200">Motivo</label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Describa el motivo de la restricción"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none dark:border-slate-600"
          />
        </div>
      </div>
    </Modal>
  );
};
