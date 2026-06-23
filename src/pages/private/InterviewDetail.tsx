import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import { getRequirements, getRequirementById } from "../../core/services/apiService";
import { useApi } from "../../core/hooks/useApi";
import {
  RequirementItem,
  ReqListParams,
  RequerimientosResponse,
  BaseResponseFMI,
  OperationResult,
} from "../../core/models";
import type { Perfil } from "../../core/models/interfaces/Perfil";
import { Loading } from "../../core/components";
import { useSnackbar } from "notistack";
import { handleError } from "../../core/utilities/errorHandler";
import { useAsyncService } from "../../core/hooks/useAsyncService";
import {
  getInterviewDetail,
  updateInterview,
  UpdateInterviewPayload,
  deleteInterviewFile,
  InterviewDetailDTO,
  generateUploadUrl,
  uploadFileToS3,
  confirmUploadFile,
  generateDownloadUrl
} from "../../core/services/interviews.service";

import { useForm, Controller, useFieldArray, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUpdateInterviewSchema,
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
  Mail,
} from "lucide-react";
import {
  ESTADO_ENTREVISTA,
  ETAPA_ENTREVISTA,
  ETAPA_ENTREVISTA_RS_LABEL,
  TIPO_ARCHIVO_ENTREVISTA,
  ESTADO_RQ,
} from "../../core/utilities/constants";
import { normalizeText } from "../../core/utilities/textUtils";
import { ModalRQDetails } from "../../core/components/modals/RQdetails/ModalRQDetails";
import { useFetchClients } from "../../core/hooks/useFetchClients";

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
  codigoRQ: string;
  lstPerfiles: Perfil[];
}

interface UploadedFile {
  id: number;
  name: string;
  type: "pdf" | "img" | "doc";
  idFileType: number;
  fileType: string;
  //path?: string;//ESTO SE VA
  date?: string;
  ///urlFile?: string;// Y ESTO IGUAL
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
  size = "w-7 h-7",
  gap = "gap-1",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: string;
  gap?: string;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className={`flex ${gap} justify-center`}>
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
            className={size}
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

  // Modal state for RQ Details
  const [selectedRqIdForModal, setSelectedRqIdForModal] = useState<number | null>(
    null,
  );

  // Modal file state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // get params
  const { paramsByMaestro, loading: loadingParams } = useParamsContext();

  const interviewStates = paramsByMaestro[ESTADO_ENTREVISTA] || [];
  const interviewStages = paramsByMaestro[ETAPA_ENTREVISTA] || [];
  const interviewFileTypes = paramsByMaestro[TIPO_ARCHIVO_ENTREVISTA] || [];
  const rqStates = paramsByMaestro[ESTADO_RQ] || [];

  const { clientes: clients } = useFetchClients();

  // num1 de la etapa "Entrevista con el equipo de R&S" (entrevistadores opcionales).
  // En el resto de etapas se exige al menos un entrevistador.
  const rsStageNum1 = useMemo(() => {
    const stages = paramsByMaestro[ETAPA_ENTREVISTA] || [];
    const target = normalizeText(ETAPA_ENTREVISTA_RS_LABEL);
    const match = stages.find((s) => normalizeText(s.string1) === target);
    return match ? match.num1 : null;
  }, [paramsByMaestro]);

  // El resolver es estable; lee el num1 vigente a través del ref para que el
  // esquema siempre valide con el valor cargado de parámetros.
  const rsStageNum1Ref = useRef<number | null>(null);
  rsStageNum1Ref.current = rsStageNum1;
  const interviewResolver = useMemo<Resolver<UpdateInterviewType>>(
    () => (values, context, options) =>
      zodResolver(createUpdateInterviewSchema(rsStageNum1Ref.current))(
        values,
        context,
        options,
      ),
    [],
  );

  const methods = useForm<UpdateInterviewType>({
    resolver: interviewResolver,
    defaultValues: {
      idTalento: 0,
      fecha: "",
      hora: "",
      estado: 0,
      etapa: 0,
      idsRqs: [],
      perfil: "",
      enlaceEntrevista: "",
      entrevistadores: [],
      grabaciones: [{ enlace: "", fecha: "" }],
      calificacion: 0,
      calificacionPersonal: 0,
      calificacionExperiencia: 0,
      calificacionIdiomas: 0,
      calificacionEducacion: 0,
      notasPersonales: "",
      notasExperiencia: "",
      notasIdiomas: "",
      notasEducacion: "",
      motivoCancelacion: "",
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

  const {
    fields: interviewerFields,
    append: appendInterviewer,
    remove: removeInterviewer,
  } = useFieldArray({
    control,
    name: "entrevistadores",
  });

  const {
    fields: grabacionFields,
    append: appendGrabacion,
    remove: removeGrabacion,
    replace: replaceGrabacion,
  } = useFieldArray({
    control,
    name: "grabaciones",
  });

  const formValues = watch();

  // Si la etapa exige entrevistadores y no hay ninguno, mostramos una fila vacía
  // para guiar al usuario.
  const etapaValue = watch("etapa");
  useEffect(() => {
    const etapa = Number(etapaValue);
    const isRS = rsStageNum1 != null && etapa === rsStageNum1;
    if (etapa >= 1 && !isRS && interviewerFields.length === 0) {
      appendInterviewer({ fullname: "", email: "", notificacion: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapaValue, rsStageNum1]);

  // Los entrevistadores son obligatorios en toda etapa distinta a R&S.
  const entrevistadoresRequeridos =
    Number(etapaValue) >= 1 &&
    !(rsStageNum1 != null && Number(etapaValue) === rsStageNum1);

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

  // Tracks whether the form has already been populated for the current
  // interview. A re-fetch (e.g. after uploading a file) must refresh the
  // files list without resetting the form and wiping unsaved edits.
  const formInitializedRef = useRef(false);

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

  const { execute: executeGenerateUpload, loading: loadingUpload } = useAsyncService(generateUploadUrl);

  const { execute: executeConfirmUpload } = useAsyncService(confirmUploadFile);

  const { execute: executeDownloadFile } = useAsyncService(generateDownloadUrl);

  const { execute: executeDeleteFile, loading: loadingDeleteFile } =
    useAsyncService<BaseResponseFMI, [number]>(deleteInterviewFile);

  useEffect(() => {
    if (isEditing && id) {
      formInitializedRef.current = false;
      fetchDetail(Number(id));
    }
  }, [id, isEditing, fetchDetail]);

  useEffect(() => {
    if (detailResult?.data) {
      const data = detailResult.data;

      // Always refresh the files list so changes (e.g. an uploaded file)
      // are reflected. This must run on every re-fetch.
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
          fileType: f.type || "Otro"
          //path: f.pathFile || f.path,//ESTO SE TIENE QUE IR
          //urlFile: f.urlFile// Y ESTO IGUAL Xd
        };
      });
      setFiles(filesData);

      // Populate the form fields only once per interview load. A background
      // re-fetch (e.g. after uploading a file) must NOT overwrite the form,
      // otherwise the user's unsaved edits would be wiped.
      if (formInitializedRef.current) return;
      formInitializedRef.current = true;

      setTalentName(data.talento);
      setClientName(data.clienteResumen);

      const savedRQs = data.selectedRQs || [];
      setValue("idTalento", data.idTalento);
      setValue("fecha", data.fecha);
      setValue("hora", data.hora);
      setValue("estado", Number(data.idEstado));
      setValue("etapa", data.idEtapa);
      setValue("idsRqs", savedRQs.map((r: any) => r.id));
      setValue("perfil", data.perfil || "");
      setValue("enlaceEntrevista", data.enlaceEntrevista || "");
      setValue("entrevistadores", data.entrevistadores || []);
      setValue("grabaciones", data.grabaciones || [{ enlace: "", fecha: "" }]);
      setValue("calificacion", data.calificacion);
      setValue("calificacionPersonal", data.calificacionPersonal || 0);
      setValue("calificacionExperiencia", data.calificacionExperiencia || 0);
      setValue("calificacionIdiomas", data.calificacionIdiomas || 0);
      setValue("calificacionEducacion", data.calificacionEducacion || 0);
      setValue("notasPersonales", data.notasPersonales);
      setValue("notasExperiencia", data.notasExperiencia);
      setValue("notasIdiomas", data.notasIdiomas);
      setValue("notasEducacion", data.notasEducacion);
      setValue("motivoCancelacion", data.motivoCancelacion);

      // Fetch profiles for persisted RQs so the select has options available
      if (savedRQs.length > 0) {
        Promise.all(savedRQs.map((rq: any) => getRequirementById(rq.id)))
          .then((results) => {
            const enriched: SelectedRQ[] = savedRQs.map((rq: any, i: number) => {
              const reqData = results[i]?.data?.requerimiento;
              return {
                id: rq.id,
                label: rq.label,
                cliente: rq.cliente,
                codigoRQ: reqData?.codigoRQ || "",
                lstPerfiles: (reqData?.lstRqVacantes || []).map((v: any) => ({
                  idPerfil: v.idPerfil,
                  perfil: v.perfilProfesional,
                  vacantesTotales: v.cantidad,
                  vacantesCubiertas: 0,
                })),
              };
            });
            setSelectedRQs(enriched);
          })
          .catch(() => {
            setSelectedRQs(savedRQs.map((rq: any) => ({
              ...rq,
              codigoRQ: "",
              lstPerfiles: [],
            })));
          });
      } else {
        setSelectedRQs([]);
      }
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
      entrevistadores: JSON.stringify(
        (data.entrevistadores || []).map((e) => ({
          ...e,
          notificacion: e.notificacion ? 1 : 0,
        }))
      ),
      grabaciones: JSON.stringify(data.grabaciones || []),
      calificacion: data.calificacion ?? 0,
      calificacionPersonal: data.calificacionPersonal ?? 0,
      calificacionExperiencia: data.calificacionExperiencia ?? 0,
      calificacionIdiomas: data.calificacionIdiomas ?? 0,
      calificacionEducacion: data.calificacionEducacion ?? 0,
      notasPersonales: data.notasPersonales || "",
      notasExperiencia: data.notasExperiencia || "",
      notasIdiomas: data.notasIdiomas || "",
      notasEducacion: data.notasEducacion || "",
      idsRqs: data.idsRqs,
      motivoCancelacion: data.motivoCancelacion || "",
      perfil: data.perfil,
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

  const profileOptions = selectedRQs.flatMap((rq) =>
    (rq.lstPerfiles || []).map((p) => ({
      label: `${rq.codigoRQ} - ${p.perfil}`,
      value: `${rq.codigoRQ} - ${p.perfil}`,
    })),
  );

  const toggleRQSelection = (req: RequirementItem) => {
    let newRQs: SelectedRQ[];
    if (selectedRQs.find((r: SelectedRQ) => r.id === req.idRequerimiento)) {
      newRQs = selectedRQs.filter(
        (r: SelectedRQ) => r.id !== req.idRequerimiento,
      );
    } else {
      newRQs = [
        ...selectedRQs,
        {
          id: req.idRequerimiento,
          label: `${req.codigoRQ} - ${req.titulo}`,
          cliente: req.cliente,
          codigoRQ: req.codigoRQ,
          lstPerfiles: req.lstPerfiles || [],
        },
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
    if (interviewFileTypes.length > 0) {
      setSelectedCategory(interviewFileTypes[0].num1);
    }
    setIsUploadModalOpen(true);
    e.target.value = "";
  };

const handleFileDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setPendingFile(file);
    if (interviewFileTypes.length > 0) {
      setSelectedCategory(interviewFileTypes[0].num1);
    }
    setIsUploadModalOpen(true);
  };

const confirmUpload = async () => {
  if (!pendingFile || !id) return;
  setIsUploading(true);
  try {
    // 1 pedir URL al backend
    const presigned = await executeGenerateUpload({
      idInterview: Number(id),
      idFileType: selectedCategory,
      fileName: pendingFile.name,
      contentType: pendingFile.type,
    });

    if (!presigned.result) {
      enqueueSnackbar("No se pudo generar URL de subida", {
        variant: "error",
      });
      return;
    }

    const data = presigned.result.data;

    // 2 subir directo a S3
    const uploadResponse = await uploadFileToS3(
      data.url,
      pendingFile,
    );

    if (!uploadResponse.ok) {
      enqueueSnackbar("Error subiendo archivo a S3 ", {
        variant: "error",
      });
      return;
    }

    // 3 confirmar en backend
    const confirm = await executeConfirmUpload({
      idInterview: Number(id),
      idFileType: selectedCategory,
      fileName: data.fileName,
      path: data.path,
    });

    if (confirm.result?.idTipoMensaje === 2) {
      enqueueSnackbar("Archivo subido con éxito", {
        variant: "success",
      });

      await fetchDetail(Number(id)); // recargar lista real
      setPendingFile(null);
      setIsUploadModalOpen(false);
      setSelectedCategory(0);
    } else {
      enqueueSnackbar("Error confirmando archivo", {
        variant: "error",
      });
    }

  } catch (error) {
    enqueueSnackbar("Error al subir archivo", {
      variant: "error",
    });
  } finally {
    setIsUploading(false);
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

  const handleDownload = async (idFile: number) => {
    const res = await executeDownloadFile(idFile);

    if (res.result?.data?.url) {
      window.open(res.result.data.url, "_blank");
    } else {
      enqueueSnackbar("No se pudo descargar archivo", {
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
      <div>
        <form onSubmit={handleSubmit(handleSave)}>
          {/* ── Top bar ── */}
          <div className="flex items-start justify-between gap-4 mb-2">
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
                            <button
                              type="button"
                              className="hover:underline"
                              onClick={() => setSelectedRqIdForModal(rq.id)}
                            >
                              {rq.label}
                            </button>
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
                        Enlace de la Entrevista *
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
                    <Controller
                      name="etapa"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className={`dropdown ${errors.etapa ? "border-red-500" : ""}`}
                        >
                          <option value={0}>Seleccione etapa</option>
                          {interviewStages.map((stage) => (
                            <option key={stage.idParametro} value={stage.num1}>
                              {stage.string1}
                            </option>
                          ))}
                        </select>
                      )}
                    />
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
                    <Controller
                      name="estado"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className={`dropdown ${errors.estado ? "border-red-500" : ""}`}
                        >
                          <option value={0}>Seleccione estado</option>
                          {interviewStates.map((state) => (
                            <option key={state.idParametro} value={state.num1}>
                              {state.string1}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.estado && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.estado.message}
                      </p>
                    )}
                  </div>

                  {/* Perfil / Puesto */}
                  <div className="flex flex-col gap-1">
                    <label className="input-label font-medium mb-1">
                      Perfil / Puesto <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="perfil"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className={`dropdown ${errors.perfil ? "border-red-500" : ""}`}
                        >
                          <option value="">Seleccione un perfil</option>
                          {profileOptions.map((opt, i) => (
                            <option key={i} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.perfil && (
                      <p className="text-red-500 text-xs mt-1 font-medium">
                        {errors.perfil.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Motivo Cancelacion */}

                {
                  (() => {
                    if(Number(watch("estado")) === 4) {
                      return (
                        <div className="mt-8 pt-8 border-t border-gray-100">
                          <label className="input-label font-medium mb-1">
                            Motivo de cancelación
                          </label>
                          <textarea
                            {...register("motivoCancelacion")}
                            rows={3}
                            className="input w-full resize-none"
                          />
                        </div>
                        
                      );
                      
                    }
                    
                  })()
                }  

                {/* Agregar grabaciones de reuniones */}

                <div className="mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-800">
                      Grabaciones de reuniones
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        appendGrabacion({ enlace: "", fecha: "" })
                      }
                      className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1 font-medium"
                    >
                      <Plus size={14} />
                      Agregar Grabación
                    </button>
                  </div>

                  <div className="space-y-4">
                    {grabacionFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-1 md:grid-cols-[1fr_1fr_40px] gap-4 items-start bg-gray-50 p-4 rounded-lg relative"
                      >
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                            Enlace
                          </label>
                          <input
                            {...register(`grabaciones.${index}.enlace`)}
                            placeholder="Ej: https://drive.google.com/file/d/abc123/view"
                            className={`input w-full bg-white ${
                              errors.grabaciones?.[index]?.enlace
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                          {errors.grabaciones?.[index]?.enlace && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.grabaciones[index]?.enlace?.message}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                            Fecha
                          </label>
                          <div className="flex flex-col gap-1">
                            <input
                              {...register(`grabaciones.${index}.fecha`)}
                              type="date"
                              className="input w-full bg-white"
                            />
                            {errors.grabaciones?.[index]?.fecha && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.grabaciones[index]?.fecha?.message}
                              </p>
                            )}
                          </div>
                        
                        </div>
                        {grabacionFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeGrabacion(index)}
                            className="mt-6 p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Eliminar grabación"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Entrevistadores section */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-800">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-[var(--color-blue)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
                        />
                      </svg>
                      Entrevistadores {entrevistadoresRequeridos ? "*" : "(Opcional)"}
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        appendInterviewer({ fullname: "", email: "", notificacion: false })
                      }
                      className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1 font-medium"
                    >
                      <Plus size={14} />
                      Agregar Entrevistador
                    </button>
                  </div>

                  {(errors.entrevistadores as { message?: string } | undefined)
                    ?.message && (
                    <p className="text-red-500 text-xs mb-3">
                      {
                        (errors.entrevistadores as { message?: string })
                          .message
                      }
                    </p>
                  )}

                  <div className="space-y-4">
                    {interviewerFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="rounded-lg overflow-hidden border border-gray-200"
                      >
                        {/* Inputs row */}
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_40px] gap-4 p-4 items-start bg-gray-50">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                              Nombre Completo
                            </label>
                            <input
                              {...register(`entrevistadores.${index}.fullname`)}
                              placeholder="Ej: Ana García"
                              className={`input w-full bg-white ${
                                errors.entrevistadores?.[index]?.fullname
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                            {errors.entrevistadores?.[index]?.fullname && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.entrevistadores[index]?.fullname?.message}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                              Email (Opcional)
                            </label>
                            <input
                              {...register(`entrevistadores.${index}.email`)}
                              placeholder="ana.garcia@empresa.com"
                              className={`input w-full bg-white ${
                                errors.entrevistadores?.[index]?.email
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                            {errors.entrevistadores?.[index]?.email && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.entrevistadores[index]?.email?.message}
                              </p>
                            )}
                          </div>
                          {interviewerFields.length > 0 && (
                            <button
                              type="button"
                              onClick={() => removeInterviewer(index)}
                              className="mt-6 p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Eliminar entrevistador"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>

                        {/* Email notification footer */}
                        <div className="flex items-center px-4 py-2.5 bg-white border-t border-gray-100">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              id={`entrevistadores.${index}.notificacion`}
                              {...register(`entrevistadores.${index}.notificacion`)}
                              className="sr-only peer"
                            />
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              <span>Notificación por email</span>
                            </div>
                            <span className="text-xs text-gray-400 transition-colors peer-checked:text-[var(--color-blue)]">
                              Enviar al actualizar
                            </span>
                            <div className="relative w-9 h-5 bg-gray-200 rounded-full transition-colors peer-checked:bg-[var(--color-blue)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                          </label>
                        </div>
                      </div>
                    ))}
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
                    <div className="flex items-center gap-3 mb-1">
                      <label className="input-label block m-0">
                        Notas Personales
                      </label>
                      <Controller
                        name="calificacionPersonal"
                        control={control}
                        render={({ field }) => (
                          <StarRating
                            value={field.value || 0}
                            onChange={field.onChange}
                            size="w-5 h-5"
                            gap="gap-0.5"
                          />
                        )}
                      />
                    </div>
                    <textarea
                      {...register("notasPersonales")}
                      rows={3}
                      className="input w-full resize-none"
                      placeholder="Impresiones generales sobre la personalidad y actitud..."
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <label className="input-label block m-0">
                        Notas Experiencia Laboral
                      </label>
                      <Controller
                        name="calificacionExperiencia"
                        control={control}
                        render={({ field }) => (
                          <StarRating
                            value={field.value || 0}
                            onChange={field.onChange}
                            size="w-5 h-5"
                            gap="gap-0.5"
                          />
                        )}
                      />
                    </div>
                    <textarea
                      {...register("notasExperiencia")}
                      rows={3}
                      className="input w-full resize-none"
                      placeholder="Detalles relevantes sobre roles previos y logros..."
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <label className="input-label block m-0">
                          Notas Idiomas
                        </label>
                        <Controller
                          name="calificacionIdiomas"
                          control={control}
                          render={({ field }) => (
                            <StarRating
                              value={field.value || 0}
                              onChange={field.onChange}
                              size="w-5 h-5"
                              gap="gap-0.5"
                            />
                          )}
                        />
                      </div>
                      <textarea
                        {...register("notasIdiomas")}
                        rows={3}
                        className="input w-full resize-none"
                        placeholder="Nivel de fluidez y vocabulario técnico..."
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <label className="input-label block m-0">
                          Notas Educación
                        </label>
                        <Controller
                          name="calificacionEducacion"
                          control={control}
                          render={({ field }) => (
                            <StarRating
                              value={field.value || 0}
                              onChange={field.onChange}
                              size="w-5 h-5"
                              gap="gap-0.5"
                            />
                          )}
                        />
                      </div>
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
                      <button
                        type="button"
                        onClick={() => handleDownload(f.id)}
                        className="text-xs font-medium text-blue-600 truncate hover:underline"
                      >
                        {f.name}
                      </button>
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
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-xl py-5 flex flex-col items-center justify-center gap-2 transition-colors w-full ${
                isDragging
                  ? "border-[var(--color-primary)] bg-[var(--color-blue-10)] text-[var(--color-primary)]"
                  : "border-gray-200 text-gray-400 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
            >
              <CloudUpload size={28} strokeWidth={1.5} />
              <span className="text-xs text-center leading-relaxed px-2">
                {isDragging ? "Suelta el archivo aquí" : "Arrastra archivos aquí o haz clic para subir"}
              </span>
            </button>
          </SectionCard>
          {/* ── File Upload Modal ── */}
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
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
                    disabled={isUploading}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmUpload}
                    disabled={isUploading}
                    className="flex-[2] px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[var(--color-primary-20)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      "Subir Archivo"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedRqIdForModal && (
        <ModalRQDetails
          rqId={selectedRqIdForModal}
          rqStates={rqStates}
          clients={clients}
          onClose={() => setSelectedRqIdForModal(null)}
          handleAssingPost={() => {}}
          updateRQData={() => {}}
        />
      )}
    </Dashboard>
  );
}
