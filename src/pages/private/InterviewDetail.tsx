import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Dashboard } from "./Dashboard";

// ─── Types ────────────────────────────────────────────────────────────────────

type InterviewEstado =
  | "Registrado"
  | "Pendiente"
  | "En Proceso"
  | "Finalizado"
  | "Cancelado";

interface InterviewFormData {
  talento: string;
  tituloRQ: string;
  cliente: string;
  fecha: string;
  estado: InterviewEstado;
  calificacion: number;
  recomendado: boolean;
  notasPersonales: string;
  notasExperiencia: string;
  notasIdiomas: string;
  notasEducacion: string;
}

interface UploadedFile {
  id: number;
  name: string;
  size: string;
  date: string;
  type: "pdf" | "img" | "doc";
}

// ─── Mock seed data (used when editing an existing interview) ─────────────────

const MOCK_DETAIL: InterviewFormData = {
  talento: "Juan Pérez",
  tituloRQ: "Senior Backend Engineer",
  cliente: "TechSolutions Inc.",
  fecha: "2023-10-25",
  estado: "Finalizado",
  calificacion: 4,
  recomendado: true,
  notasPersonales: "",
  notasExperiencia: "",
  notasIdiomas: "",
  notasEducacion: "",
};

const MOCK_FILES: UploadedFile[] = [
  {
    id: 1,
    name: "CV_JuanPerez_2025.pdf",
    size: "2.4 MB",
    date: "24 Oct 2023",
    type: "pdf",
  },
  {
    id: 2,
    name: "Portafolio_Diseño.pdf",
    size: "15.8 MB",
    date: "24 Oct 2023",
    type: "doc",
  },
  {
    id: 3,
    name: "Certificado_Inglés.jpg",
    size: "850 KB",
    date: "25 Oct 2023",
    type: "img",
  },
];

const EMPTY: InterviewFormData = {
  talento: "",
  tituloRQ: "",
  cliente: "",
  fecha: "",
  estado: "Pendiente",
  calificacion: 0,
  recomendado: false,
  notasPersonales: "",
  notasExperiencia: "",
  notasIdiomas: "",
  notasEducacion: "",
};

const ESTADOS: InterviewEstado[] = [
  "Registrado",
  "Pendiente",
  "En Proceso",
  "Finalizado",
  "Cancelado",
];

const RATING_LABELS: Record<number, string> = {
  1: "Muy Malo",
  2: "Malo",
  3: "Regular",
  4: "Muy Bueno",
  5: "Excelente",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FileIcon({ type }: { type: UploadedFile["type"] }) {
  const cfg = {
    pdf: { bg: "bg-red-100 text-red-600", label: "PDF" },
    img: { bg: "bg-green-100 text-green-600", label: "IMG" },
    doc: { bg: "bg-blue-100 text-blue-600", label: "DOC" },
  }[type];
  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold shrink-0 ${cfg.bg}`}
    >
      {cfg.label}
    </span>
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="focus:outline-none transition-transform hover:scale-110"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-7 h-7"
            fill={(hovered || value) >= star ? "#FACC15" : "none"}
            stroke={(hovered || value) >= star ? "#FACC15" : "#D1D5DB"}
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557L3.04 10.384c-.38-.325-.176-.948.322-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

// ─── SectionCard helper ───────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  children,
  iconColor = "text-[var(--color-blue)]",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  iconColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-5">
        <span className={iconColor}>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InterviewDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;

  const [form, setForm] = useState<InterviewFormData>(
    isEditing ? { ...MOCK_DETAIL } : { ...EMPTY },
  );
  const [files, setFiles] = useState<UploadedFile[]>(
    isEditing ? [...MOCK_FILES] : [],
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof InterviewFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    // TODO: call API
    navigate("/dashboard/entrevistas");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    const type: UploadedFile["type"] =
      ext === "pdf" ? "pdf" : ext === "jpg" || ext === "png" ? "img" : "doc";
    setFiles((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        date: new Date().toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        type,
      },
    ]);
    e.target.value = "";
  };

  const removeFile = (fid: number) =>
    setFiles((prev) => prev.filter((f) => f.id !== fid));

  // ── SVG icons (inline to avoid asset deps) ──
  const IconDoc = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z"
      />
    </svg>
  );
  const IconPencil = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
      />
    </svg>
  );
  const IconStar = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557L3.04 10.384c-.38-.325-.176-.948.322-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
      />
    </svg>
  );
  const IconFolder = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25A2.25 2.25 0 0 0 4.5 16.5h6.75a2.25 2.25 0 0 0 2.25-2.25v-.75"
      />
    </svg>
  );

  return (
    <Dashboard>
      <div className="p-4 mx-4 xl:mx-16 pb-12">
        {/* ── Top bar ── */}
        <div className="flex items-start justify-between gap-4 my-4">
          <div>
            {/* Back link */}
            <button
              type="button"
              onClick={() => navigate("/dashboard/entrevistas")}
              className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline mb-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Volver a Entrevistas
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Detalle de Entrevista" : "Nueva Entrevista"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEditing
                ? "Edita los detalles, notas y evaluaciones del candidato."
                : "Completa los datos para registrar la entrevista."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-6">
            <button
              type="button"
              onClick={() => navigate("/dashboard/entrevistas")}
              className="btn btn-outline-gray px-5 py-2 text-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-blue px-5 py-2 text-sm flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Guardar Cambios
            </button>
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
          {/* ── Left column ── */}
          <div className="flex flex-col gap-4">
            {/* Información General */}
            <SectionCard icon={IconDoc} title="Información General">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label block mb-1">Talento</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={form.talento}
                    onChange={(e) => set("talento", e.target.value)}
                    placeholder="Nombre del talento"
                  />
                </div>
                <div>
                  <label className="input-label block mb-1">Título RQ</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={form.tituloRQ}
                    onChange={(e) => set("tituloRQ", e.target.value)}
                    placeholder="Ej: Senior Backend Engineer"
                  />
                </div>
                <div>
                  <label className="input-label block mb-1">Cliente</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={form.cliente}
                    onChange={(e) => set("cliente", e.target.value)}
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div>
                  <label className="input-label block mb-1">Fecha</label>
                  <input
                    type="date"
                    className="input w-full"
                    value={form.fecha}
                    onChange={(e) => set("fecha", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="input-label block mb-1">
                    Estado de la Entrevista
                  </label>
                  <select
                    className="dropdown"
                    value={form.estado}
                    onChange={(e) =>
                      set("estado", e.target.value as InterviewEstado)
                    }
                  >
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* Notas */}
            <SectionCard
              icon={IconPencil}
              title="Notas de la Entrevista"
              iconColor="text-[var(--color-primary)]"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <label className="input-label block mb-1">
                    Notas Personales
                  </label>
                  <textarea
                    rows={3}
                    className="input w-full resize-none"
                    placeholder="Impresiones generales sobre la personalidad y actitud..."
                    value={form.notasPersonales}
                    onChange={(e) => set("notasPersonales", e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label block mb-1">
                    Notas Experiencia Laboral
                  </label>
                  <textarea
                    rows={3}
                    className="input w-full resize-none"
                    placeholder="Detalles relevantes sobre roles previos y logros..."
                    value={form.notasExperiencia}
                    onChange={(e) => set("notasExperiencia", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label block mb-1">
                      Notas Idiomas
                    </label>
                    <textarea
                      rows={3}
                      className="input w-full resize-none"
                      placeholder="Nivel de fluidez y vocabulario técnico..."
                      value={form.notasIdiomas}
                      onChange={(e) => set("notasIdiomas", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="input-label block mb-1">
                      Notas Educación
                    </label>
                    <textarea
                      rows={3}
                      className="input w-full resize-none"
                      placeholder="Formación académica y certificaciones..."
                      value={form.notasEducacion}
                      onChange={(e) => set("notasEducacion", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-4">
            {/* Evaluación */}
            <SectionCard
              icon={IconStar}
              title="Evaluación"
              iconColor="text-[var(--color-orange)]"
            >
              <p className="text-xs text-gray-400 text-center mb-3">
                Calificación General
              </p>
              <StarRating
                value={form.calificacion}
                onChange={(v) => set("calificacion", v)}
              />
              <p className="text-center text-sm font-medium text-gray-700 mt-2 mb-4 min-h-[1.25rem]">
                {form.calificacion > 0 ? (
                  <>
                    {form.calificacion}/5{" "}
                    <span className="text-gray-400 font-normal">
                      {RATING_LABELS[form.calificacion]}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400 font-normal text-xs">
                    Sin calificar
                  </span>
                )}
              </p>

              <hr className="border-gray-100 mb-4" />

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="input-checkbox mt-0.5"
                  checked={form.recomendado}
                  onChange={(e) => set("recomendado", e.target.checked)}
                />
                <div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Recomendado para contratación
                  </p>
                  <p className="text-xs text-gray-400">
                    Marcar si el candidato cumple con el perfil
                  </p>
                </div>
              </label>
            </SectionCard>

            {/* Archivos Subidos */}
            <SectionCard icon={IconFolder} title="Archivos Subidos">
              {/* header action */}
              <div className="flex items-center justify-between -mt-5 mb-4">
                <span /> {/* spacer – title already in SectionCard */}
                <button
                  type="button"
                  className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-medium"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  Agregar
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* File list */}
              <div className="flex flex-col gap-1 mb-3">
                {files.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group"
                  >
                    <FileIcon type={f.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {f.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {f.size} · {f.date}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(f.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1 rounded"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Drop zone */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl py-5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors w-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
                  />
                </svg>
                <span className="text-xs text-center leading-relaxed px-2">
                  Arrastra archivos aquí o haz clic para subir
                </span>
              </button>
            </SectionCard>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}
