import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import { getRequirements } from "../../core/services/apiService";
import { useApi } from "../../core/hooks/useApi";
import {
  RequirementItem,
  ReqListParams,
  RequerimientosResponse,
  BaseResponseFMI,
  OperationResult,
} from "../../core/models";
import { Loading } from "../../core/components";
import { useSnackbar } from "notistack";
import { handleError } from "../../core/utilities/errorHandler";
import { useAsyncService } from "../../core/hooks/useAsyncService";
import {
  getInterviewDetail,
  updateInterview,
  UpdateInterviewPayload,
  uploadInterviewFile,
  deleteInterviewFile,
  InterviewDetailDTO,
  UploadInterviewFilePayload,
} from "../../core/services/interviews.service";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UpdateInterviewSchema,
  UpdateInterviewType,
} from "../../core/models/schemas/UpdateInterviewSchema";
import { useParams as useParamsContext } from "../../core/context/ParamsContext";
import {
  FileText,
  Pencil,
  Star,
  Folder,
  ChevronLeft,
  Check,
  Plus,
  X,
  CloudUpload,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import {
  ESTADO_ENTREVISTA,
  ETAPA_ENTREVISTA,
  TIPO_ARCHIVO_ENTREVISTA,
} from "../../core/utilities/constants";

const RATING_LABELS: Record<number, string> = {
  1: "Muy Malo",
  2: "Malo",
  3: "Regular",
  4: "Muy Bueno",
  5: "Excelente",
};

interface SelectedRQ {
  id: number;
  label: string;
  cliente: string;
}

interface UploadedFile {
  id: number;
  name: string;
  type: "pdf" | "img" | "doc";
  idFileType: number;
  fileType: string;
  path?: string;
  date?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FileIcon({ type }: { type: string }) {
  const configs: Record<string, { bg: string; label: string }> = {
    pdf: { bg: "bg-red-100 text-red-600", label: "PDF" },
    img: { bg: "bg-green-100 text-green-600", label: "IMG" },
    doc: { bg: "bg-blue-100 text-blue-600", label: "DOC" },
  };

  const cfg = configs[type] || {
    bg: "bg-gray-100 text-gray-600",
    label: "FILE",
  };

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
          <Star
            className="w-7 h-7"
            fill={(hovered || value) >= star ? "#FACC15" : "none"}
            color={(hovered || value) >= star ? "#FACC15" : "#D1D5DB"}
            strokeWidth={1.5}
          />
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
  const { enqueueSnackbar } = useSnackbar();
  const [showRQSuggestions, setShowRQSuggestions] = useState(false);
  const [selectedRQs, setSelectedRQs] = useState<SelectedRQ[]>([]);
  const rqSuggestionsRef = useRef<HTMLDivElement>(null);
  const rqInputRef = useRef<HTMLInputElement>(null);

  // Modal file state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);

  // get params
  const { paramsByMaestro, loading: loadingParams } = useParamsContext(
    `${ESTADO_ENTREVISTA},${ETAPA_ENTREVISTA},${TIPO_ARCHIVO_ENTREVISTA}`,
  );

  const interviewStates = paramsByMaestro[ESTADO_ENTREVISTA] || [];
  const interviewStages = paramsByMaestro[ETAPA_ENTREVISTA] || [];
  const interviewFileTypes = paramsByMaestro[TIPO_ARCHIVO_ENTREVISTA] || [];

  const methods = useForm<UpdateInterviewType>({
    resolver: zodResolver(UpdateInterviewSchema),
    defaultValues: {
      idTalento: 0,
      fecha: "",
      hora: "",
      estado: 0,
      etapa: 0,
      idsRqs: [],
      enlaceEntrevista: "",
      calificacion: 0,
      notasPersonales: "",
      notasExperiencia: "",
      notasIdiomas: "",
      notasEducacion: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = methods;

  const formValues = watch();

  const [talentName, setTalentName] = useState("");
  const [clientName, setClientName] = useState("");

  const {
    loading: loadingReqs,
    data: reqsData,
    fetch: fetchReqs,
  } = useApi<RequerimientosResponse, ReqListParams>(getRequirements, {
    onError: (error) => handleError(error, enqueueSnackbar),
  });

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    execute: fetchDetail,
    loading: loadingDetail,
    result: detailResult,
  } = useAsyncService<OperationResult<InterviewDetailDTO>, [number]>(
    getInterviewDetail,
  );

  const { execute: executeUpdate, loading: loadingSave } = useAsyncService<
    BaseResponseFMI,
    [UpdateInterviewPayload]
  >(updateInterview);

  const { execute: executeUploadFile, loading: loadingUpload } =
    useAsyncService<BaseResponseFMI, [UploadInterviewFilePayload]>(
      uploadInterviewFile,
    );

  const { execute: executeDeleteFile, loading: loadingDeleteFile } =
    useAsyncService<BaseResponseFMI, [number]>(deleteInterviewFile);

  useEffect(() => {
    if (isEditing && id) {
      fetchDetail(Number(id));
    }
  }, [id, isEditing, fetchDetail]);

  useEffect(() => {
    if (detailResult?.data) {
      const data = detailResult.data;
      setTalentName(data.talento);
      setClientName(data.clienteResumen);

      const rQS: SelectedRQ[] =
        data.selectedRQs?.map((rq: any) => ({
          id: rq.id,
          label: rq.label,
          cliente: rq.cliente,
        })) || [];
      setSelectedRQs(rQS);

      setValue("idTalento", data.idTalento);
      setValue("fecha", data.fecha);
      setValue("hora", data.hora);
      setValue("estado", data.idEstado);
      setValue("etapa", data.idEtapa);
      setValue(
        "idsRqs",
        rQS.map((r) => r.id),
      );
      setValue("enlaceEntrevista", data.enlaceEntrevista || "");
      setValue("calificacion", data.calificacion);
      setValue("notasPersonales", data.notasPersonales);
      setValue("notasExperiencia", data.notasExperiencia);
      setValue("notasIdiomas", data.notasIdiomas);
      setValue("notasEducacion", data.notasEducacion);

      const filesData: UploadedFile[] = (data.files || []).map((f: any) => {
        const ext = f.name?.split(".").pop()?.toLowerCase();
        const iconType: UploadedFile["type"] =
          ext === "pdf"
            ? "pdf"
            : ["jpg", "jpeg", "png", "gif"].includes(ext || "")
              ? "img"
              : "doc";

        return {
          id: f.id,
          name: f.name,
          date: f.date,
          type: iconType,
          idFileType: f.idFileType,
          fileType: f.type || "Otro",
          path: f.pathFile || f.path,
        };
      });
      setFiles(filesData);
    }
  }, [detailResult, setValue]);

  const handleSave = async (data: UpdateInterviewType) => {
    if (!id) return;
    const payload: UpdateInterviewPayload = {
      idEntrevista: id ? parseInt(id, 10) : 0,
      idTalento: data.idTalento,
      fecha: data.fecha,
      hora: data.hora,
      estado: data.estado,
      etapa: data.etapa,
      enlaceEntrevista: data.enlaceEntrevista || "",
      calificacion: data.calificacion ?? 0,
      notasPersonales: data.notasPersonales || "",
      notasExperiencia: data.notasExperiencia || "",
      notasIdiomas: data.notasIdiomas || "",
      notasEducacion: data.notasEducacion || "",
      idsRqs: data.idsRqs,
    };

    const res = await executeUpdate(payload);

    if (res.result && res.result.idTipoMensaje === 2) {
      enqueueSnackbar(
        res.result.mensaje || "Entrevista actualizada con éxito",
        {
          variant: "success",
        },
      );
    } else if (res.result) {
      enqueueSnackbar(
        res.result.mensaje || "Error al actualizar la entrevista",
        {
          variant: "error",
        },
      );
    }
  };

  const handleRQSearch = (value: string) => {
    if (value.length > 2) {
      fetchReqs({
        buscar: value,
        nPag: 1,
        idCliente: null,
        estado: null,
        fechaSolicitud: null,
      });
      setShowRQSuggestions(true);
    } else {
      setShowRQSuggestions(false);
    }
  };

  const toggleRQSelection = (req: RequirementItem) => {
    let newRQs: SelectedRQ[];
    if (selectedRQs.find((r: SelectedRQ) => r.id === req.idRequerimiento)) {
      newRQs = selectedRQs.filter(
        (r: SelectedRQ) => r.id !== req.idRequerimiento,
      );
    } else {
      newRQs = [
        ...selectedRQs,
        { id: req.idRequerimiento, label: req.titulo, cliente: req.cliente },
      ];
    }
    setSelectedRQs(newRQs);
    setValue(
      "idsRqs",
      newRQs.map((r) => r.id),
      { shouldValidate: true },
    );

    // Update unique clients in form
    const uniqueClients = Array.from(
      new Set(newRQs.map((r: SelectedRQ) => r.cliente)),
    ).join(", ");
    setClientName(uniqueClients);

    if (rqInputRef.current) rqInputRef.current.value = "";
    setShowRQSuggestions(false);
  };

  const removeRQ = (id: number) => {
    const newRQs = selectedRQs.filter((r: SelectedRQ) => r.id !== id);
    setSelectedRQs(newRQs);
    setValue(
      "idsRqs",
      newRQs.map((r) => r.id),
      { shouldValidate: true },
    );
    const uniqueClients = Array.from(
      new Set(newRQs.map((r: SelectedRQ) => r.cliente)),
    ).join(", ");
    setClientName(uniqueClients);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        rqSuggestionsRef.current &&
        !rqSuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowRQSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    // Set default category to the first one available
    if (interviewFileTypes.length > 0) {
      setSelectedCategory(interviewFileTypes[0].num1);
    }
    setIsUploadModalOpen(true);
    e.target.value = "";
  };

  const confirmUpload = async () => {
    if (!pendingFile || !id) return;

    const res = await executeUploadFile({
      idInterview: Number(id),
      idFileType: selectedCategory,
      file: pendingFile,
    });

    if (res.result && res.result.idTipoMensaje === 2) {
      const ext = pendingFile.name.split(".").pop()?.toLowerCase();
      const type: UploadedFile["type"] =
        ext === "pdf" ? "pdf" : ext === "jpg" || ext === "png" ? "img" : "doc";

      const typeLabel =
        interviewFileTypes.find((t) => t.num1 === selectedCategory)?.string1 ||
        "Otro";

      setFiles((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: pendingFile.name,
          date: new Date().toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          type,
          idFileType: selectedCategory,
          fileType: typeLabel,
        },
      ]);

      enqueueSnackbar("Archivo subido con éxito", { variant: "success" });
      setPendingFile(null);
      setIsUploadModalOpen(false);
      setSelectedCategory(0);
    } else if (res.result) {
      enqueueSnackbar(res.result.mensaje || "Error al subir archivo", {
        variant: "error",
      });
    }
  };

  const removeFile = async (fid: number) => {
    const res = await executeDeleteFile(fid);
    if (res.result && res.result.idTipoMensaje === 2) {
      setFiles((prev) => prev.filter((f) => f.id !== fid));
      enqueueSnackbar(res.result.mensaje || "Archivo eliminado", {
        variant: "success",
      });
    } else if (res.result) {
      enqueueSnackbar(res.result.mensaje || "Error al eliminar archivo", {
        variant: "error",
      });
    }
  };

  // ── SVG icons (inline to avoid asset deps) ──
  const IconDoc = <FileText size={16} />;
  const IconPencil = <Pencil size={16} />;
  const IconStar = <Star size={16} />;
  const IconFolder = <Folder size={16} />;

  return (
    <Dashboard>
      {(loadingDetail ||
        loadingReqs ||
        loadingParams ||
        loadingSave ||
        loadingUpload ||
        loadingDeleteFile) && <Loading opacity="opacity-50" />}
      <div className="p-4 mx-4 xl:mx-16 pb-12">
        <form onSubmit={handleSubmit(handleSave)}>
          {/* ── Top bar ── */}
          <div className="flex items-start justify-between gap-4 my-4">
            <div>
              {/* Back link */}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline mb-2"
              >
                <ChevronLeft size={14} />
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
                onClick={() => navigate(-1)}
                className="btn btn-outline-gray px-5 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-blue px-5 py-2 text-sm flex items-center gap-2"
              >
                <Check size={16} />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Talento (ReadOnly) */}
                  <div className="flex flex-col gap-1 relative">
                    <label className="input-label font-medium mb-1">
                      Talento
                    </label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg min-h-[46px]">
                      <span className="text-sm font-semibold text-gray-900">
                        {talentName}
                      </span>
                    </div>
                  </div>

                  {/* Título RQ (Searchable Multiple) */}
                  <div className="flex flex-col gap-1 relative">
                    <label className="input-label font-medium mb-1">
                      Requerimientos (RQ)
                    </label>
                    <div className="relative">
                      <input
                        ref={rqInputRef}
                        type="text"
                        className={`input w-full ${errors.idsRqs ? "border-red-500" : ""}`}
                        onChange={(e) => handleRQSearch(e.target.value)}
                        onFocus={() => {
                          const val = rqInputRef.current?.value || "";
                          if (val.length > 2) setShowRQSuggestions(true);
                        }}
                        placeholder="Buscar requerimientos por título o código..."
                      />
                      {loadingReqs && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--color-primary)]">
                          <Loader2 size={16} />
                        </div>
                      )}
                    </div>
                    {errors.idsRqs && (
                      <p className="text-red-500 text-xs mt-1 font-medium">
                        {errors.idsRqs.message}
                      </p>
                    )}

                    {/* Multi-selection tags */}
                    {selectedRQs.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedRQs.map((rq: SelectedRQ) => (
                          <span
                            key={rq.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-blue-10)] text-[var(--color-blue)] rounded-lg text-xs font-semibold"
                          >
                            {rq.label}
                            <button
                              type="button"
                              onClick={() => removeRQ(rq.id)}
                              className="hover:text-red-500"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* RQ Suggestions Dropdown */}
                    {showRQSuggestions &&
                      reqsData?.requerimientos &&
                      reqsData.requerimientos.length > 0 && (
                        <div
                          ref={rqSuggestionsRef}
                          className="absolute z-10 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        >
                          {reqsData.requerimientos.map((r: RequirementItem) => {
                            const isSelected = selectedRQs.some(
                              (selected: SelectedRQ) =>
                                selected.id === r.idRequerimiento,
                            );
                            return (
                              <button
                                key={r.idRequerimiento}
                                type="button"
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-none transition-colors ${isSelected ? "bg-blue-50" : ""}`}
                                onClick={() => toggleRQSelection(r)}
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {r.titulo}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {r.codigoRQ} · {r.cliente}
                                  </p>
                                </div>
                                {isSelected && (
                                  <Check size={16} className="text-blue-600" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                  </div>

                  {/* Cliente (ReadOnly) */}
                  <div className="flex flex-col gap-1 relative">
                    <label className="input-label block mb-1">Cliente</label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg min-h-[46px]">
                      {clientName ? (
                        <p className="text-sm text-gray-700 font-medium">
                          {clientName}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          Se autocompleta según el RQ
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row: Enlace, Fecha, Hora (Usa grid interno para ocupar toda la fila) */}
                  <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6 mt-2">
                    {/* Enlace de Entrevista */}
                    <div className="md:col-span-2 flex flex-col gap-1">
                      <label className="input-label font-medium mb-1">
                        Enlace de la Entrevista
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-[46px] h-[46px] rounded-lg bg-gray-50 border border-gray-100 text-gray-400 shrink-0">
                          <LinkIcon size={20} />
                        </div>
                        <input
                          {...register("enlaceEntrevista")}
                          type="url"
                          className={`input w-full ${errors.enlaceEntrevista ? "border-red-500" : ""}`}
                          placeholder="https://zoom.us/j/..."
                        />
                      </div>
                      {errors.enlaceEntrevista && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.enlaceEntrevista.message}
                        </p>
                      )}
                    </div>

                    {/* Fecha */}
                    <div className="flex flex-col gap-1">
                      <label className="input-label block mb-1">Fecha</label>
                      <input
                        {...register("fecha")}
                        type="date"
                        className={`input w-full ${errors.fecha ? "border-red-500" : ""}`}
                      />
                      {errors.fecha && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.fecha.message}
                        </p>
                      )}
                    </div>

                    {/* Hora */}
                    <div className="flex flex-col gap-1">
                      <label className="input-label block mb-1">Hora</label>
                      <input
                        {...register("hora")}
                        type="time"
                        className={`input w-full ${errors.hora ? "border-red-500" : ""}`}
                      />
                      {errors.hora && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.hora.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Etapa */}
                  <div className="flex flex-col gap-1">
                    <label className="input-label font-medium mb-1">
                      Etapa de la Entrevista
                    </label>
                    <select
                      {...register("etapa")}
                      className={`dropdown ${errors.etapa ? "border-red-500" : ""}`}
                    >
                      <option value={0}>Seleccione etapa</option>
                      {interviewStages.map((stage) => (
                        <option key={stage.idParametro} value={stage.num1}>
                          {stage.string1}
                        </option>
                      ))}
                    </select>
                    {errors.etapa && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.etapa.message}
                      </p>
                    )}
                  </div>

                  {/* Estado */}
                  <div className="flex flex-col gap-1">
                    <label className="input-label font-medium mb-1">
                      Estado de la Entrevista
                    </label>
                    <select
                      {...register("estado")}
                      className={`dropdown ${errors.estado ? "border-red-500" : ""}`}
                    >
                      <option value={0}>Seleccione estado</option>
                      {interviewStates.map((state) => (
                        <option key={state.idParametro} value={state.num1}>
                          {state.string1}
                        </option>
                      ))}
                    </select>
                    {errors.estado && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.estado.message}
                      </p>
                    )}
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
                      {...register("notasPersonales")}
                      rows={3}
                      className="input w-full resize-none"
                      placeholder="Impresiones generales sobre la personalidad y actitud..."
                    />
                  </div>
                  <div>
                    <label className="input-label block mb-1">
                      Notas Experiencia Laboral
                    </label>
                    <textarea
                      {...register("notasExperiencia")}
                      rows={3}
                      className="input w-full resize-none"
                      placeholder="Detalles relevantes sobre roles previos y logros..."
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label block mb-1">
                        Notas Idiomas
                      </label>
                      <textarea
                        {...register("notasIdiomas")}
                        rows={3}
                        className="input w-full resize-none"
                        placeholder="Nivel de fluidez y vocabulario técnico..."
                      />
                    </div>
                    <div>
                      <label className="input-label block mb-1">
                        Notas Educación
                      </label>
                      <textarea
                        {...register("notasEducacion")}
                        rows={3}
                        className="input w-full resize-none"
                        placeholder="Formación académica y certificaciones..."
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
                <Controller
                  name="calificacion"
                  control={control}
                  render={({ field }) => (
                    <StarRating
                      value={field.value || 0}
                      onChange={field.onChange}
                    />
                  )}
                />
                <p className="text-center text-sm font-medium text-gray-700 mt-2 mb-4 min-h-[1.25rem]">
                  {formValues.calificacion ? (
                    <>
                      {formValues.calificacion}/5{" "}
                      <span className="text-gray-400 font-normal">
                        {RATING_LABELS[formValues.calificacion]}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400 font-normal text-xs">
                      Sin calificar
                    </span>
                  )}
                </p>
              </SectionCard>
            </div>
          </div>
        </form>

        {/* ── Files section (Outside form) ── */}
        <div className="mt-4">
          <SectionCard icon={IconFolder} title="Archivos Subidos">
            {/* header action */}
            <div className="flex items-center justify-between -mt-5 mb-4">
              <span /> {/* spacer – title already in SectionCard */}
              <button
                type="button"
                className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-medium"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus size={14} />
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
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {f.name}
                      </p>
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500 uppercase">
                        {f.fileType}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{f.date}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(f.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1 rounded"
                  >
                    <X size={14} />
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
              <CloudUpload size={28} strokeWidth={1.5} />
              <span className="text-xs text-center leading-relaxed px-2">
                Arrastra archivos aquí o haz clic para subir
              </span>
            </button>
          </SectionCard>
          {/* ── File Upload Modal ── */}
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-[30] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Configurar Archivo
                  </h3>
                  <button
                    onClick={() => setIsUploadModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <FileText
                        className="text-[var(--color-primary)]"
                        size={24}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {pendingFile?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(pendingFile?.size ?? 0) / 1024 > 1024
                          ? `${((pendingFile?.size ?? 0) / (1024 * 1024)).toFixed(2)} MB`
                          : `${((pendingFile?.size ?? 0) / 1024).toFixed(0)} KB`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                      Tipo de Archivo
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {interviewFileTypes.map((cat) => (
                        <button
                          key={cat.num1}
                          type="button"
                          onClick={() => setSelectedCategory(cat.num1)}
                          className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                            selectedCategory === cat.num1
                              ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary-20)]"
                              : "bg-white border-gray-200 text-gray-600 hover:border-[var(--color-primary-20)] hover:bg-gray-50"
                          }`}
                        >
                          {cat.string1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmUpload}
                    className="flex-[2] px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[var(--color-primary-20)]"
                  >
                    Subir Archivo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Dashboard>
  );
}
