import { useMemo, useRef, useState } from "react";
import { UploadCloud, X, Check } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { useApi } from "../../../../core/hooks/useApi";
import { useParams } from "../../../../core/context/ParamsContext";
import { MAESTRO_ROLES, ROL_SUPERADMIN } from "../../../../core/utilities/constants";
import {
  createUserAdmin,
  describeS3Error,
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
  InsertUpdateResponse,
  UserAdmin,
  UserCreateParams,
  UserUpsertParams,
} from "../../../../core/models";

interface Props {
  /** null/omitido = alta; con valor = edición. */
  initial?: UserAdmin | null;
  onClose: () => void;
  onSaved: () => void;
}

const CLAVE_MIN = 12;

const str = (v: unknown): string => (v === null || v === undefined ? "" : String(v));
const textOrNull = (v: string): string | null => (v.trim() === "" ? null : v.trim());

export const UserFormModal = ({ initial, onClose, onSaved }: Props) => {
  const isCreate = !initial;
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
    nombres: str(initial?.nombres),
    apellidos: str(initial?.apellidos),
    usuario: str(initial?.usuario),
    clave: "",
    email: str(initial?.email),
    cargo: str(initial?.cargo),
    telefono: str(initial?.telefono),
    idTipoRol: initial?.idRol ? String(initial.idRol) : "",
  });
  const [error, setError] = useState<string | null>(null);

  // Firma (solo edición): se sube directo a S3. El path solo viaja si el PUT dio 200.
  const [firmaPath, setFirmaPath] = useState<string | null>(null);
  const [uploadingFirma, setUploadingFirma] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { loading: creating, fetch: doCreate } = useApi<
    InsertUpdateResponse,
    UserCreateParams
  >(createUserAdmin, { onError: (e) => handleError(e, enqueueSnackbar) });

  const { loading: updating, fetch: doUpdate } = useApi<
    BaseResponse,
    UserUpsertParams
  >(updateUserAdmin, { onError: (e) => handleError(e, enqueueSnackbar) });

  const saving = creating || updating;

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onFirmaSelected = async (file: File | null) => {
    if (!file || !initial) return;
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
      // El content-type tiene que ser el que el backend firmó, no `file.type`:
      // eran distintos cuando el navegador no reconocía la extensión y S3
      // rechazaba el PUT con SignatureDoesNotMatch.
      const s3Response = await uploadFileToS3(
        data.url,
        file,
        data.contentType ?? undefined,
      );
      // El éxito lo determina SOLO el status HTTP devuelto por S3.
      if (s3Response.ok) {
        setFirmaPath(data.path);
        enqueueSnackbar("Firma cargada", { variant: "success" });
      } else {
        enqueueSnackbar(await describeS3Error(s3Response), { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Error al subir la firma", { variant: "error" });
    } finally {
      setUploadingFirma(false);
    }
  };

  const validate = (): boolean => {
    if (form.nombres.trim() === "" || form.apellidos.trim() === "") {
      setError("Nombres y apellidos son obligatorios.");
      return false;
    }
    if (form.idTipoRol === "") {
      setError("El rol es obligatorio.");
      return false;
    }
    if (isCreate) {
      if (form.usuario.trim() === "") {
        setError("El nombre de usuario es obligatorio.");
        return false;
      }
      if (form.clave.length < CLAVE_MIN) {
        setError(`La contraseña debe tener al menos ${CLAVE_MIN} caracteres.`);
        return false;
      }
      if (form.email.trim() === "" || !form.email.includes("@")) {
        setError("El email es obligatorio y debe ser válido.");
        return false;
      }
      if (form.telefono.trim() === "") {
        setError("El teléfono es obligatorio.");
        return false;
      }
    } else if (form.clave !== "" && form.clave.length < CLAVE_MIN) {
      // En edición la clave es opcional; si se ingresa, respeta el mínimo.
      setError(`La contraseña debe tener al menos ${CLAVE_MIN} caracteres.`);
      return false;
    }
    setError(null);
    return true;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    let ok = false;
    if (isCreate) {
      const payload: UserCreateParams = {
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        usuario: form.usuario.trim(),
        clave: form.clave,
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        cargo: textOrNull(form.cargo),
        idTipoRol: Number(form.idTipoRol),
      };
      const response = await doCreate(payload);
      handleResponse({ response, showSuccessMessage: true, enqueueSnackbar });
      ok = (response.data.result?.idMensaje ?? response.data.idMensaje) === 2;
    } else {
      const payload: UserUpsertParams = {
        idUsuario: initial!.idUsuario,
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        email: textOrNull(form.email),
        cargo: textOrNull(form.cargo),
        telefono: textOrNull(form.telefono),
        firma: firmaPath, // null = conserva la firma actual
        clave: textOrNull(form.clave), // null = no cambia la contraseña
        idTipoRol: Number(form.idTipoRol),
      };
      const response = await doUpdate(payload);
      handleResponse({ response, showSuccessMessage: true, enqueueSnackbar });
      ok = (response.data.result?.idMensaje ?? response.data.idMensaje) === 2;
    }

    if (ok) {
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
            {isCreate ? "Nuevo usuario" : `Editar usuario · @${initial!.usuario}`}
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

            {isCreate && (
              <>
                <Field label="Usuario *">
                  <input
                    className="input w-full"
                    value={form.usuario}
                    onChange={(e) => set("usuario")(e.target.value.trim())}
                    autoComplete="off"
                  />
                </Field>
                <Field label={`Contraseña * (mín. ${CLAVE_MIN})`}>
                  <input
                    type="password"
                    className="input w-full"
                    value={form.clave}
                    onChange={(e) => set("clave")(e.target.value)}
                    autoComplete="new-password"
                  />
                </Field>
              </>
            )}

            {!isCreate && (
              <Field label={`Nueva contraseña (opcional, mín. ${CLAVE_MIN})`}>
                <input
                  type="password"
                  className="input w-full"
                  value={form.clave}
                  onChange={(e) => set("clave")(e.target.value)}
                  placeholder="Dejar en blanco para no cambiarla"
                  autoComplete="new-password"
                />
              </Field>
            )}

            <Field label={isCreate ? "Email *" : "Email"}>
              <input type="email" className="input w-full" value={form.email} onChange={(e) => set("email")(e.target.value)} />
            </Field>
            <Field label={isCreate ? "Teléfono *" : "Teléfono"}>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={9}
                className="input w-full"
                value={form.telefono}
                onChange={(e) => set("telefono")(e.target.value.replace(/\D/g, "").slice(0, 9))}
              />
            </Field>
            <Field label="Cargo">
              <input className="input w-full" value={form.cargo} onChange={(e) => set("cargo")(e.target.value)} />
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

          {/* Firma: solo en edición (el alta no tiene ID todavía para la ruta S3). */}
          {!isCreate && (
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
                ) : initial!.firma ? (
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
          )}

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
            {saving ? "Guardando…" : isCreate ? "Crear" : "Guardar"}
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
