import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { useApi } from "../../../../core/hooks/useApi";
import { useParams } from "../../../../core/context/ParamsContext";
import {
  PERFIL,
  TIPO_MONEDA,
  TIPO_TARIFA,
} from "../../../../core/utilities/constants";
import { createTariff, updateTariff } from "../../../../core/services/administration.service";
import {
  handleError,
  handleResponse,
} from "../../../../core/utilities/errorHandler";
import {
  BaseResponse,
  Tariff,
  TariffUpsertParams,
} from "../../../../core/models";

interface Option {
  value: number;
  label: string;
}

interface Props {
  mode: "create" | "edit";
  initial: Tariff | null;
  /** Clientes ya cargados por la sección (no se piden al abrir el modal). */
  clients: Option[];
  /** Tarifas ya listadas: para validar la combinación única cliente + perfil. */
  existing: Tariff[];
  onClose: () => void;
  onSaved: () => void;
}

const byLabel = (a: Option, b: Option) => a.label.localeCompare(b.label);

export const TariffFormModal = ({ mode, initial, clients, existing, onClose, onSaved }: Props) => {
  const { paramsByMaestro } = useParams();

  const perfilOptions = useMemo<Option[]>(
    () =>
      (paramsByMaestro[Number(PERFIL)] ?? [])
        .map((p) => ({ value: p.num1, label: p.string1 }))
        .sort(byLabel),
    [paramsByMaestro],
  );
  const monedaOptions = useMemo<Option[]>(
    () =>
      (paramsByMaestro[Number(TIPO_MONEDA)] ?? [])
        .map((p) => ({ value: p.num1, label: p.string2 || p.string1 }))
        .sort(byLabel),
    [paramsByMaestro],
  );
  const tipoTarifaOptions = useMemo<Option[]>(
    () =>
      (paramsByMaestro[Number(TIPO_TARIFA)] ?? [])
        .map((p) => ({ value: p.num1, label: p.string1 }))
        .sort(byLabel),
    [paramsByMaestro],
  );

  const [form, setForm] = useState({
    idCliente: initial ? String(initial.idCliente) : "",
    idPerfil: initial ? String(initial.idPerfil) : "",
    idMoneda: initial ? String(initial.idMoneda) : "",
    idTipoTarifa: initial ? String(initial.idTipoTarifa) : "",
    tarifa: initial ? String(initial.tarifa) : "",
    tipoCambio:
      initial && initial.tipoCambio !== null && initial.tipoCambio !== undefined
        ? String(initial.tipoCambio)
        : "",
  });
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const { loading: saving, fetch: doSave } = useApi<BaseResponse, TariffUpsertParams>(
    mode === "create" ? createTariff : updateTariff,
    { onError: (e) => handleError(e, enqueueSnackbar) },
  );

  // Combinación cliente + perfil ya existente (ignora la propia tarifa al editar).
  const isDuplicate = useMemo(() => {
    if (form.idCliente === "" || form.idPerfil === "") return false;
    return existing.some(
      (t) =>
        t.idCliente === Number(form.idCliente) &&
        t.idPerfil === Number(form.idPerfil) &&
        t.idTarifario !== initial?.idTarifario,
    );
  }, [existing, form.idCliente, form.idPerfil, initial]);

  const onSubmit = async () => {
    if (
      form.idCliente === "" ||
      form.idPerfil === "" ||
      form.idMoneda === "" ||
      form.idTipoTarifa === ""
    ) {
      setError("Cliente, perfil, moneda y tipo de tarifa son obligatorios.");
      return;
    }
    const tarifa = Number(form.tarifa);
    if (form.tarifa.trim() === "" || Number.isNaN(tarifa) || tarifa <= 0) {
      setError("La tarifa debe ser un número mayor a 0.");
      return;
    }
    if (isDuplicate) {
      setError("Ya existe una tarifa para ese cliente y perfil.");
      return;
    }
    setError(null);

    const payload: TariffUpsertParams = {
      idTarifario: initial?.idTarifario,
      idCliente: Number(form.idCliente),
      idPerfil: Number(form.idPerfil),
      idMoneda: Number(form.idMoneda),
      idTipoTarifa: Number(form.idTipoTarifa),
      tarifa,
      tipoCambio: form.tipoCambio.trim() === "" ? null : Number(form.tipoCambio),
    };

    const response = await doSave(payload);
    handleResponse({ response, showSuccessMessage: true, enqueueSnackbar });
    if ((response.data.result?.idMensaje ?? response.data.idMensaje) === 2) {
      onSaved();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 rounded-t-xl flex-shrink-0 dark:bg-slate-800 dark:border-slate-700">
          <h2 className="font-semibold text-gray-800 dark:text-slate-100">
            {mode === "create" ? "Nueva tarifa" : "Editar tarifa"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors dark:hover:bg-slate-700"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Cliente *">
              <Select value={form.idCliente} onChange={set("idCliente")} options={clients} />
            </Field>
            <Field label="Perfil *">
              <Select value={form.idPerfil} onChange={set("idPerfil")} options={perfilOptions} />
            </Field>
            <Field label="Moneda *">
              <Select value={form.idMoneda} onChange={set("idMoneda")} options={monedaOptions} />
            </Field>
            <Field label="Tipo de tarifa *">
              <Select
                value={form.idTipoTarifa}
                onChange={set("idTipoTarifa")}
                options={tipoTarifaOptions}
              />
            </Field>
            <Field label="Tarifa *">
              <input
                type="number"
                min={0}
                step="0.01"
                className="input w-full"
                value={form.tarifa}
                onChange={(e) => set("tarifa")(e.target.value)}
              />
            </Field>
            <Field label="Tipo de cambio (opcional)">
              <input
                type="number"
                min={0}
                step="0.001"
                className="input w-full"
                value={form.tipoCambio}
                onChange={(e) => set("tipoCambio")(e.target.value)}
              />
            </Field>
          </div>

          {isDuplicate && (
            <p className="text-amber-600 text-sm mt-4">
              Ya existe una tarifa para ese cliente y perfil.
            </p>
          )}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-2 flex-shrink-0 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving || isDuplicate}
            className={`btn ${saving || isDuplicate ? "btn-disabled" : "btn-primary"}`}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Select = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
}) => (
  <select className="input w-full" value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="">Seleccione…</option>
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

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

export default TariffFormModal;
