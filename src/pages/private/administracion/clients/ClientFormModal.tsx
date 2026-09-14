import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { useApi } from "@/core/hooks/useApi";
import { createClient, updateClient } from "@/core/services/administration.service";
import {
  handleError,
  handleResponse,
} from "@/core/utilities/errorHandler";
import {
  BaseResponse,
  ClientAdmin,
  ClientUpsertParams,
  InsertUpdateResponse,
} from "@/core/models";
import { Dialog, DialogContent, DialogTitle } from "@/core/components/ui/shadcn/dialog";
import { Button } from "@/core/components/ui/shadcn/button";
import { Input } from "@/core/components/ui/shadcn/input";
import { Textarea } from "@/core/components/ui/shadcn/textarea";
import { Label } from "@/core/components/ui/shadcn/label";

interface Props {
  mode: "create" | "edit";
  initial?: ClientAdmin | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  ruc: string;
  razonSocial: string;
  direccion: string;
  ubicacion: string;
  direccionExacta: string;
}

const str = (v: unknown): string => (v === null || v === undefined ? "" : String(v));

const buildInitialState = (initial?: ClientAdmin | null): FormState => ({
  ruc: str(initial?.ruc),
  razonSocial: str(initial?.razonSocial),
  direccion: str(initial?.direccion),
  ubicacion: str(initial?.ubicacion),
  direccionExacta: str(initial?.direccionExacta),
});

const textOrNull = (v: string): string | null => {
  const t = v.trim();
  return t === "" ? null : t;
};

export const ClientFormModal = ({ mode, initial, onClose, onSaved }: Props) => {
  const [form, setForm] = useState<FormState>(() => buildInitialState(initial));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(buildInitialState(initial));
  }, [initial]);

  const { loading: creating, fetch: doCreate } = useApi<
    InsertUpdateResponse,
    ClientUpsertParams
  >(createClient, { onError: (e) => handleError(e, enqueueSnackbar) });

  const { loading: updating, fetch: doUpdate } = useApi<
    BaseResponse,
    ClientUpsertParams
  >(updateClient, { onError: (e) => handleError(e, enqueueSnackbar) });

  const loading = creating || updating;

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async () => {
    if (form.ruc.trim() === "") {
      setError("El RUC es obligatorio.");
      return;
    }
    if (form.razonSocial.trim() === "") {
      setError("La razón social es obligatoria.");
      return;
    }
    setError(null);

    const payload: ClientUpsertParams = {
      ruc: form.ruc.trim(),
      razonSocial: form.razonSocial.trim(),
      direccion: textOrNull(form.direccion),
      ubicacion: textOrNull(form.ubicacion),
      direccionExacta: textOrNull(form.direccionExacta),
    };

    const response =
      mode === "create"
        ? await doCreate(payload)
        : await doUpdate({ ...payload, idCliente: initial?.idCliente });

    handleResponse({ response, showSuccessMessage: true, enqueueSnackbar });

    const code = response.data.result?.idMensaje ?? response.data.idMensaje;
    if (code === 2) {
      onSaved();
      onClose();
    }
  };

  const title =
    mode === "create" ? "Nuevo cliente" : `Editar cliente #${initial?.idCliente}`;

  return (
    // Como antes, un clic fuera cierra; ahora también Escape.
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        overlayClassName="bg-black/40"
        className="flex w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] flex-col gap-0 rounded-xl border border-gray-200 p-0 shadow-2xl dark:border-slate-700"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 rounded-t-xl flex-shrink-0 dark:bg-slate-800 dark:border-slate-700">
          <DialogTitle className="font-semibold text-gray-800 dark:text-slate-100">{title}</DialogTitle>
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
            <Field label="RUC *">
              <Input
                type="text"
                value={form.ruc}
                onChange={(e) => set("ruc")(e.target.value)}
              />
            </Field>
            <Field label="Razón social *">
              <Input
                type="text"
                value={form.razonSocial}
                onChange={(e) => set("razonSocial")(e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Dirección">
                <Input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => set("direccion")(e.target.value)}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Ubicación (URL de mapa)">
                <Textarea
                  className="resize-y min-h-[64px]"
                  value={form.ubicacion}
                  onChange={(e) => set("ubicacion")(e.target.value)}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Dirección exacta">
                <Textarea
                  className="resize-y min-h-[64px]"
                  value={form.direccionExacta}
                  onChange={(e) => set("direccionExacta")(e.target.value)}
                />
              </Field>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-2 flex-shrink-0 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
          <Button onClick={onSubmit} disabled={loading} className="mx-1">
            {loading ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/** La etiqueta envuelve al control: queda asociada sin necesitar ids. */
const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <Label className="flex flex-col gap-1">
    <span className="input-label">{label}</span>
    {children}
  </Label>
);

export default ClientFormModal;
