import { Children, ReactNode, useRef, useState } from "react";
import { Check, FileText, Upload, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { cn } from "@/core/lib/utils";
import { Hint } from "@/core/components/ui/Hint";
import { Label } from "@/core/components/ui/shadcn/label";
import { Checkbox } from "@/core/components/ui/shadcn/checkbox";

/*
 * Piezas comunes de los modales de requerimientos (Nuevo RQ y Detalle RQ).
 * Todas las pestañas comparten el mismo cuerpo con scroll, los grupos con
 * título, la etiqueta encima del campo, la cabecera de sección y las tablas,
 * para que el modal se vea igual en cualquier pestaña.
 */

/** Alto único (48 px) de Input, Select y DatePicker en los modales de RQ. */
export const rqControl = "h-12 w-full";

/**
 * Campo bloqueado de Detalle RQ (sin pulsar Editar): se lee como un campo
 * normal sobre fondo gris, sin el 50 % de opacidad que trae `disabled`, y con
 * el cursor de bloqueado. `pointer-events-auto`: el Button (DatePicker) anula
 * los eventos al deshabilitarse y el cursor no llegaba a verse; un botón
 * deshabilitado sigue sin recibir clics.
 */
export const rqReadonly =
  "disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-100 disabled:bg-gray-50 disabled:text-gray-800 dark:disabled:bg-slate-800/60 dark:disabled:text-slate-100";

/** "yyyy-MM-dd…" → "dd/MM/yyyy", sin pasar por Date (no se corre de día). */
export const displayDate = (value?: string | null) => {
  if (!value) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value;
};

/** Hueco de un control que no aplica (p. ej. "Sin duración definida"). */
export const EmptyControl = ({ children }: { children: ReactNode }) => (
  <div className="flex h-12 items-center rounded-lg border border-dashed border-gray-300 px-3 text-sm text-gray-500 dark:border-slate-600 dark:text-slate-400">
    {children}
  </div>
);

/** Clases de las tablas de los modales de RQ (borde en vez de sombra). */
export const rqTable = {
  wrapper:
    "overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800",
  table: "w-full text-left",
  headRow:
    "border-b border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-900/40",
  head: "px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400",
  row: "border-b border-gray-200 last:border-0 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700/40",
  cell: "px-4 py-3 align-middle text-sm text-gray-800 dark:text-slate-100",
  empty: "px-6 py-8 text-center text-sm text-gray-500 dark:text-slate-400",
};

interface TabLabelProps {
  label: string;
  /** Pestaña completa: marca verde. */
  done?: boolean;
  /** Cuántos elementos lleva (vacantes, archivos…); 0 no se muestra. */
  count?: number;
  hasError?: boolean;
}

/** Etiqueta de pestaña con su estado: con errores, completa o cuántos elementos lleva. */
export const RQTabLabel = ({ label, done, count, hasError }: TabLabelProps) => (
  <span className="flex items-center gap-2">
    <span>{label}</span>
    {hasError ? (
      <Hint label="Hay errores en esta sección">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500">
          <span className="sr-only">(con errores)</span>
        </span>
      </Hint>
    ) : done ? (
      <>
        <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" aria-hidden />
        <span className="sr-only">(completa)</span>
      </>
    ) : null}
    {!!count && count > 0 && (
      // group-data: el contador toma el azul de la pestaña activa.
      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-100 px-1.5 text-xs font-semibold text-gray-700 group-data-[state=active]:bg-sky-50 group-data-[state=active]:text-[var(--color-blue)] dark:bg-slate-700 dark:text-slate-200 dark:group-data-[state=active]:bg-sky-400/15 dark:group-data-[state=active]:text-sky-300">
        {count}
      </span>
    )}
  </span>
);

/**
 * Cuerpo de una pestaña: ocupa el alto disponible y hace scroll.
 * `relative`: los inputs ocultos de Radix (absolute) se quedan dentro del
 * scroll en vez de estirar la página.
 */
export const TabBody = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className="relative h-full min-h-0 overflow-y-auto">
    <div className={cn("flex flex-col gap-6 p-6", className)}>{children}</div>
  </div>
);

/**
 * Bloque con etiqueta para lo que no es un campo suelto (Descripción,
 * Modalidad de contrato). La etiqueta se ve igual que la de `Field`: los
 * modales de RQ no llevan títulos de sección en mayúsculas.
 */
export const FormGroup = ({
  title,
  helper,
  className,
  children,
}: {
  title: ReactNode;
  helper?: ReactNode;
  /** P. ej. `flex-1` para que el bloque ocupe el alto que quede. */
  className?: string;
  children: ReactNode;
}) => (
  <section className={cn("flex flex-col gap-1.5", className)}>
    <div className="flex min-h-6 flex-wrap items-baseline gap-x-3 gap-y-1">
      <h3 className="text-sm font-medium text-gray-700 dark:text-slate-200">
        {title}
      </h3>
      {helper && (
        <p className="text-[13px] text-gray-500 dark:text-slate-400">{helper}</p>
      )}
    </div>
    <div className="flex min-h-0 flex-1 flex-col gap-3.5">{children}</div>
  </section>
);

export const GroupDivider = () => (
  <hr className="border-gray-200 dark:border-slate-700" />
);

interface FieldProps {
  label: ReactNode;
  htmlFor?: string;
  required?: boolean;
  /** Va a la derecha de la etiqueta (p. ej. "Autogenerar" o un interruptor). */
  aside?: ReactNode;
  helper?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}

/** Campo con la etiqueta encima y el error debajo. */
export const Field = ({
  label,
  htmlFor,
  required,
  aside,
  helper,
  error,
  className,
  children,
}: FieldProps) => (
  <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
    <div className="flex min-h-6 items-center justify-between gap-3">
      <Label
        htmlFor={htmlFor}
        className="text-sm font-medium text-gray-700 dark:text-slate-200"
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Label>
      {aside}
    </div>
    {children}
    {error ? (
      <p className="text-[13px] text-red-500 dark:text-red-400">{error}</p>
    ) : (
      helper && (
        <p className="text-[13px] text-gray-500 dark:text-slate-400">{helper}</p>
      )
    )}
  </div>
);

/** Cabecera de sección: título y ayuda a la izquierda, acciones a la derecha. */
export const SectionHeader = ({
  title,
  helper,
  actions,
}: {
  title: ReactNode;
  helper?: ReactNode;
  actions?: ReactNode;
}) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div className="flex flex-col gap-1">
      <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100">
        {title}
      </h3>
      {helper && (
        <p className="text-sm text-gray-500 dark:text-slate-400">{helper}</p>
      )}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

const iconTones = {
  muted: "text-gray-500 dark:text-slate-400",
  blue: "text-[var(--color-blue)] dark:text-sky-400",
  red: "text-red-500 dark:text-red-400",
};

/** Botón de solo icono de las filas (ver, editar, eliminar…). */
export const IconAction = ({
  icon: Icon,
  label,
  onClick,
  tone = "muted",
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  tone?: keyof typeof iconTones;
  disabled?: boolean;
}) => (
  <Hint label={label}>
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-slate-700",
        iconTones[tone]
      )}
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden />
    </button>
  </Hint>
);

/** Requisito de una vacante (Carreras / Habilidades) con su contador. */
export const RequirementChip = ({
  icon: Icon,
  label,
  count,
  hint,
  onClick,
  muted,
}: {
  icon: LucideIcon;
  label: string;
  count: number;
  hint: string;
  onClick: () => void;
  /** Aún no se puede usar (vacante sin perfil o sin guardar). */
  muted?: boolean;
}) => (
  <Hint label={hint}>
    <button
      type="button"
      aria-label={`${hint} (${count})`}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-gray-200 bg-white px-2.5 text-[13px] transition-colors hover:border-[var(--color-blue)] hover:text-[var(--color-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-slate-600 dark:bg-slate-800 dark:hover:border-sky-400 dark:hover:text-sky-300",
        muted
          ? "text-gray-400 dark:text-slate-500"
          : "text-gray-700 dark:text-slate-200"
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span>{label}</span>
      <span
        className={cn(
          "font-bold",
          muted ? "text-gray-400 dark:text-slate-500" : "text-gray-900 dark:text-slate-50"
        )}
      >
        {count}
      </span>
    </button>
  </Hint>
);

/** Opción marcable simple (casilla + texto), como "Autogenerar" de Datos RQ. */
export const CheckOption = ({
  checked,
  onCheckedChange,
  disabled,
  children,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  children: ReactNode;
}) => (
  <label
    className={cn(
      "flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200",
      // Bloqueada se sigue leyendo (sin opacidad): solo deja de responder.
      disabled ? "cursor-not-allowed" : "cursor-pointer"
    )}
  >
    <Checkbox
      checked={checked}
      disabled={disabled}
      className="disabled:cursor-not-allowed disabled:opacity-100"
      onCheckedChange={(value) => onCheckedChange(value === true)}
    />
    <span>{children}</span>
  </label>
);

/**
 * Recuadro de bandas salariales de Gestión. Sin modalidades marcadas invita a
 * elegir una y ocupa el alto que queda (no deja un hueco vacío); con ellas
 * muestra una BandSection por modalidad, separadas por una línea.
 */
export const BandPanel = ({
  emptyText,
  children,
}: {
  emptyText: string;
  children?: ReactNode;
}) =>
  // toArray descarta null/false: son las modalidades sin marcar.
  Children.toArray(children).length > 0 ? (
    <div className="flex flex-col divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800">
      {children}
    </div>
  ) : (
    <div className="flex min-h-[10rem] flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center dark:border-slate-600 dark:bg-slate-800/60">
      <Wallet className="h-6 w-6 text-gray-400 dark:text-slate-500" aria-hidden />
      <p className="text-sm text-gray-500 dark:text-slate-400">{emptyText}</p>
    </div>
  );

/** Banda de una modalidad dentro de BandPanel: su nombre y sus campos. */
export const BandSection = ({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) => (
  <section>
    <h4 className="px-4 pt-4 text-[15px] font-semibold text-gray-800 dark:text-slate-100">
      {title}
    </h4>
    {children}
  </section>
);

/** "PDF · 245 KB" a partir del nombre y el tamaño (0 = desconocido). */
export const fileMeta = (name: string, size?: number) => {
  const ext = name.includes(".") ? name.split(".").pop()!.toUpperCase() : "";
  let weight = "";
  if (size && size > 0) {
    weight =
      size < 1024 * 1024
        ? `${Math.max(1, Math.round(size / 1024))} KB`
        : `${(size / 1024 / 1024).toFixed(1)} MB`;
  }
  return [ext, weight].filter(Boolean).join(" · ");
};

/** Lista de archivos con borde; cada fila es un <FileRow>. */
export const FileList = ({ children }: { children: ReactNode }) => (
  <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800">
    {children}
  </ul>
);

export const FileRow = ({
  name,
  meta,
  tag,
  control,
  actions,
}: {
  name: string;
  meta?: string;
  tag?: ReactNode;
  /** Tipo del archivo: select o texto. */
  control: ReactNode;
  actions: ReactNode;
}) => (
  <li className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3 md:grid-cols-[2.5rem_minmax(0,1fr)_17.5rem_4.75rem]">
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-[var(--color-blue)] dark:bg-sky-400/10 dark:text-sky-300">
      <FileText className="h-5 w-5" aria-hidden />
    </span>
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-medium text-gray-800 dark:text-slate-100">
          {name}
        </span>
        {tag}
      </div>
      {meta && (
        <span className="text-xs text-gray-500 dark:text-slate-400">{meta}</span>
      )}
    </div>
    <div className="col-span-3 row-start-2 md:col-span-1 md:row-start-auto">
      {control}
    </div>
    <div className="col-start-3 row-start-1 flex items-center justify-end gap-1 md:col-start-auto md:row-start-auto">
      {actions}
    </div>
  </li>
);

/**
 * Zona para soltar o elegir archivos. Solo deja pasar las extensiones de
 * `accept` (".pdf, .docx"), también al arrastrar, donde el navegador no filtra.
 */
export const FileDropzone = ({
  accept,
  onFiles,
  compact = false,
}: {
  accept: string;
  onFiles: (files: File[]) => void;
  compact?: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const allowed = accept
    .split(",")
    .map((ext) => ext.trim().toLowerCase())
    .filter(Boolean);

  const take = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const all = Array.from(list);
    const valid = all.filter(
      (f) =>
        allowed.length === 0 ||
        allowed.some((ext) => f.name.toLowerCase().endsWith(ext))
    );
    const rejected = all.length - valid.length;
    if (rejected > 0) {
      enqueueSnackbar({
        message:
          rejected === 1
            ? "Un archivo tiene un formato no permitido y no se agregó."
            : `${rejected} archivos tienen un formato no permitido y no se agregaron.`,
        variant: "warning",
      });
    }
    if (valid.length > 0) onFiles(valid);
  };

  const open = () => inputRef.current?.click();

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Agregar archivos"
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          take(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer rounded-lg border-[1.5px] border-dashed bg-gray-50 text-gray-700 transition-colors hover:border-[var(--color-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-sky-400",
          dragging
            ? "border-[var(--color-blue)] bg-sky-50 dark:border-sky-400 dark:bg-sky-400/10"
            : "border-gray-300 dark:border-slate-600",
          compact
            ? "items-center gap-3 px-5 py-4"
            : "flex-col items-center gap-2 p-7 text-center"
        )}
      >
        <Upload
          className={cn(
            "text-gray-500 dark:text-slate-400",
            compact ? "h-5 w-5" : "h-6 w-6"
          )}
          aria-hidden
        />
        <span className="text-[15px]">
          Arrastra {compact ? "archivos" : "los archivos"} aquí o{" "}
          <span className="font-semibold text-[var(--color-blue)] dark:text-sky-400">
            elige archivos
          </span>
        </span>
        {!compact && (
          <span className="text-[13px] text-gray-500 dark:text-slate-400">
            Puedes subir varios a la vez.
          </span>
        )}
      </div>
      {/* Fuera de la zona: su clic no debe volver a abrir el selector. */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => {
          take(e.target.files);
          e.target.value = "";
        }}
      />
    </>
  );
};
