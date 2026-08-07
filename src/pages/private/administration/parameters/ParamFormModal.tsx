import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { useApi } from "../../../../core/hooks/useApi";
import { createParam, updateParam } from "../../../../core/services/apiService";
import {
  handleError,
  handleResponse,
} from "../../../../core/utilities/errorHandler";
import {
  BaseResponse,
  InsertUpdateResponse,
  ParamItem,
  ParamUpsertParams,
} from "../../../../core/models";

interface Props {
  mode: "create" | "edit";
  /** En edición, el parámetro a editar. */
  initial?: ParamItem | null;
  /** En alta, el maestro al que se agrega por defecto. */
  defaultMaestro?: number;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  idMaestro: string;
  descripcion: string;
  idSubMaestro: string;
  num1: string;
  num2: string;
  num3: string;
  string1: string;
  string2: string;
  string3: string;
  date1: string;
  date2: string;
  date3: string;
}

const str = (v: unknown): string => (v === null || v === undefined ? "" : String(v));

/** ISO de una fecha (yyyy-MM-dd) para el input date; ignora la parte horaria. */
const toDateInput = (v: string | null): string => (v ? v.slice(0, 10) : "");

const buildInitialState = (
  mode: "create" | "edit",
  initial?: ParamItem | null,
  defaultMaestro?: number,
): FormState => {
  if (mode === "edit" && initial) {
    return {
      idMaestro: str(initial.idMaestro),
      descripcion: str(initial.descripcion),
      idSubMaestro: str(initial.idSubMaestro),
      num1: str(initial.num1),
      num2: str(initial.num2),
      num3: str(initial.num3),
      string1: str(initial.string1),
      string2: str(initial.string2),
      string3: str(initial.string3),
      date1: toDateInput(initial.date1),
      date2: toDateInput(initial.date2),
      date3: toDateInput(initial.date3),
    };
  }
  return {
    idMaestro: defaultMaestro ? str(defaultMaestro) : "",
    descripcion: "",
    idSubMaestro: "",
    num1: "",
    num2: "",
    num3: "",
    string1: "",
    string2: "",
    string3: "",
    date1: "",
    date2: "",
    date3: "",
  };
};

const numOrNull = (v: string): number | null => {
  const t = v.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isNaN(n) ? null : n;
};

const textOrNull = (v: string): string | null => {
  const t = v.trim();
  return t === "" ? null : t;
};

export const ParamFormModal = ({
  mode,
  initial,
  defaultMaestro,
  onClose,
  onSaved,
}: Props) => {
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(mode, initial, defaultMaestro),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(buildInitialState(mode, initial, defaultMaestro));
  }, [mode, initial, defaultMaestro]);

  const { loading: creating, fetch: doCreate } = useApi<
    InsertUpdateResponse,
    ParamUpsertParams
  >(createParam, { onError: (e) => handleError(e, enqueueSnackbar) });

  const { loading: updating, fetch: doUpdate } = useApi<
    BaseResponse,
    ParamUpsertParams
  >(updateParam, { onError: (e) => handleError(e, enqueueSnackbar) });

  const loading = creating || updating;

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async () => {
    const idMaestroNum = numOrNull(form.idMaestro);
    if (idMaestroNum === null || idMaestroNum <= 0) {
      setError("El ID del maestro es obligatorio.");
      return;
    }
    setError(null);

    const payload: ParamUpsertParams = {
      idMaestro: idMaestroNum,
      descripcion: textOrNull(form.descripcion),
      idSubMaestro: numOrNull(form.idSubMaestro),
      num1: numOrNull(form.num1),
      num2: numOrNull(form.num2),
      num3: numOrNull(form.num3),
      string1: textOrNull(form.string1),
      string2: textOrNull(form.string2),
      string3: textOrNull(form.string3),
      date1: textOrNull(form.date1),
      date2: textOrNull(form.date2),
      date3: textOrNull(form.date3),
    };

    const response =
      mode === "create"
        ? await doCreate(payload)
        : await doUpdate({ ...payload, idParametro: initial?.idParametro });

    handleResponse({ response, showSuccessMessage: true, enqueueSnackbar });

    const code =
      response.data.result?.idMensaje ?? response.data.idMensaje;
    if (code === 2) {
      onSaved();
      onClose();
    }
  };

  const title =
    mode === "create" ? "Nuevo parámetro" : `Editar parámetro #${initial?.idParametro}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 rounded-t-xl flex-shrink-0">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="ID Maestro *">
              <input
                type="number"
                className="input w-full"
                value={form.idMaestro}
                onChange={(e) => set("idMaestro")(e.target.value)}
              />
            </Field>
            <Field label="ID Sub-maestro">
              <input
                type="number"
                className="input w-full"
                value={form.idSubMaestro}
                onChange={(e) => set("idSubMaestro")(e.target.value)}
              />
            </Field>
            <div className="sm:col-span-3">
              <Field label="Descripción">
                <input
                  type="text"
                  className="input w-full"
                  value={form.descripcion}
                  onChange={(e) => set("descripcion")(e.target.value)}
                />
              </Field>
            </div>

            <Field label="NUM1">
              <input type="number" className="input w-full" value={form.num1} onChange={(e) => set("num1")(e.target.value)} />
            </Field>
            <Field label="NUM2">
              <input type="number" className="input w-full" value={form.num2} onChange={(e) => set("num2")(e.target.value)} />
            </Field>
            <Field label="NUM3">
              <input type="number" className="input w-full" value={form.num3} onChange={(e) => set("num3")(e.target.value)} />
            </Field>

            <Field label="STRING1">
              <input type="text" className="input w-full" value={form.string1} onChange={(e) => set("string1")(e.target.value)} />
            </Field>
            <Field label="STRING2">
              <input type="text" className="input w-full" value={form.string2} onChange={(e) => set("string2")(e.target.value)} />
            </Field>
            <Field label="STRING3">
              <input type="text" className="input w-full" value={form.string3} onChange={(e) => set("string3")(e.target.value)} />
            </Field>

            <Field label="DATE1">
              <input type="date" className="input w-full" value={form.date1} onChange={(e) => set("date1")(e.target.value)} />
            </Field>
            <Field label="DATE2">
              <input type="date" className="input w-full" value={form.date2} onChange={(e) => set("date2")(e.target.value)} />
            </Field>
            <Field label="DATE3">
              <input type="date" className="input w-full" value={form.date3} onChange={(e) => set("date3")(e.target.value)} />
            </Field>
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className={`btn ${loading ? "btn-disabled" : "btn-primary"}`}
          >
            {loading ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <span className="input-label">{label}</span>
    {children}
  </div>
);

export default ParamFormModal;
