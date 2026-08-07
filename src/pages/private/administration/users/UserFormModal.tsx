import { useMemo, useRef, useState } from "react";
import { UploadCloud, X, Check } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { useApi } from "../../../../core/hooks/useApi";
import { useParams } from "../../../../core/context/ParamsContext";
import { MAESTRO_ROLES, ROL_SUPERADMIN } from "../../../../core/utilities/constants";
import {
  generateUserSignatureUploadUrl,
  updateUserAdmin,
  uploadFileToS3,
} from "../../../../core/services/apiService";
import {
  handleError,
  handleResponse,
} from "../../../../core/utilities/errorHandler";
import {
  BaseResponse,
  UserAdmin,
  UserUpsertParams,
} from "../../../../core/models";

interface Props {
  initial: UserAdmin;
  onClose: () => void;
  onSaved: () => void;
}

const str = (v: unknown): string => (v === null || v === undefined ? "" : String(v));
const textOrNull = (v: string): string | null => (v.trim() === "" ? null : v.trim());

export const UserFormModal = ({ initial, onClose, onSaved }: Props) => {
  const { paramsByMaestro } = useParams();

  // Catálogo de roles (maestro 1) SIN el rol SUPERADMIN (nunca asignable).
  const roleOptions = useMemo(
    () =>
      (paramsByMaestro[MAESTRO_ROLES] ?? [])
        .filter((r) => r.num1 !== ROL_SUPERADMIN)
        .map((r) => ({ value: r.num1, label: r.string1 })),
    [paramsByMaestro],
  );

  const [form, setForm] = useState({
    nombres: str(initial.nombres),
    apellidos: str(initial.apellidos),
    email: str(initial.email),
    cargo: str(initial.cargo),
    telefono: str(initial.telefono),
    idTipoRol: initial.idRol ? String(initial.idRol) : "",
  });
  const [error, setError] = useState<string | null>(null);

  // Firma: se sube directo a S3 (URL pre-firmada). Solo se envía `path` si el PUT dio 200.
  const [firmaPath, setFirmaPath] = useState<string | null>(null);
  const [uploadingFirma, setUploadingFirma] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { loading: saving, fetch: doUpdate } = useApi<
    BaseResponse,
    UserUpsertParams
  >(updateUserAdmin, { onError: (e) => handleError(e, enqueueSnackbar) });

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onFirmaSelected = async (file: File | null) => {
    if (!file) return;
    setUploadingFirma(true);
    try {
      const { data } = await generateUserSignatureUploadUrl({
        idUsuario: initial.idUsuario,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
      });
      if (data.result?.idMensaje !== 2 || !data.url || !data.path) {
        enqueueSnackbar(data.result?.mensaje ?? "No se pudo preparar la carga", {
          variant: "error",
        });
        return;
      }
      const s3Response = await uploadFileToS3(data.url, file);
      // El éxito lo determina SOLO el status HTTP devuelto por S3.
      if (s3Response.ok) {
        setFirmaPath(data.path);
        enqueueSnackbar("Firma cargada", { variant: "success" });
      } else {
        enqueueSnackbar("Error al subir la firma a S3", { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Error al subir la firma", { variant: "error" });
    } finally {
      setUploadingFirma(false);
    }
  };

  const onSubmit = async () => {
    if (form.nombres.trim() === "" || form.apellidos.trim() === "") {
      setError("Nombres y apellidos son obligatorios.");
      return;
    }
    if (form.idTipoRol === "") {
      setError("El rol es obligatorio.");
      return;
    }
    setError(null);

    const payload: UserUpsertParams = {
      idUsuario: initial.idUsuario,
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      email: textOrNull(form.email),
      cargo: textOrNull(form.cargo),
      telefono: textOrNull(form.telefono),
      firma: firmaPath, // null = conserva la firma actual
      idTipoRol: Number(form.idTipoRol),
    };

    const response = await doUpdate(payload);
    handleResponse({ response, showSuccessMessage: true, enqueueSnackbar });
    if ((response.data.result?.idMensaje ?? response.data.idMensaje) === 2) {
      onSaved();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 rounded-t-xl flex-shrink-0">
          <h2 className="font-semibold text-gray-800">
            Editar usuario · @{initial.usuario}
          </h2>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombres *">
              <input className="input w-full" value={form.nombres} onChange={(e) => set("nombres")(e.target.value)} />
            </Field>
            <Field label="Apellidos *">
              <input className="input w-full" value={form.apellidos} onChange={(e) => set("apellidos")(e.target.value)} />
            </Field>
            <Field label="Email">
              <input type="email" className="input w-full" value={form.email} onChange={(e) => set("email")(e.target.value)} />
            </Field>
            <Field label="Cargo">
              <input className="input w-full" value={form.cargo} onChange={(e) => set("cargo")(e.target.value)} />
            </Field>
            <Field label="Teléfono">
              <input
                type="tel"
                inputMode="numeric"
                maxLength={9}
                className="input w-full"
                value={form.telefono}
                onChange={(e) => set("telefono")(e.target.value.replace(/\D/g, "").slice(0, 9))}
              />
            </Field>
            <Field label="Rol *">
              <select
                className="input w-full"
                value={form.idTipoRol}
                onChange={(e) => set("idTipoRol")(e.target.value)}
              >
                <option value="">Seleccione…</option>
                {roleOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Firma */}
          <div className="mt-5">
            <span className="input-label">Firma</span>
            <div className="mt-1 flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFirma}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <UploadCloud size={16} />
                {uploadingFirma ? "Subiendo…" : "Subir firma"}
              </button>
              {firmaPath ? (
                <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                  <Check size={15} /> Firma lista
                </span>
              ) : initial.firma ? (
                <span className="text-sm text-gray-400">Tiene una firma cargada</span>
              ) : (
                <span className="text-sm text-gray-300">Sin firma</span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFirmaSelected(e.target.files?.[0] ?? null)}
              />
            </div>
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
            disabled={saving || uploadingFirma}
            className={`btn ${saving || uploadingFirma ? "btn-disabled" : "btn-primary"}`}
          >
            {saving ? "Guardando…" : "Guardar"}
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

export default UserFormModal;
