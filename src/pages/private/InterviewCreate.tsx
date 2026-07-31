import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import { getRequirements, getTalents, getRequirementById } from "../../core/services/apiService";
import { useApi } from "../../core/hooks/useApi";
import {
  RequirementItem,
  ReqListParams,
  RequerimientosResponse,
  Talent,
  TalentParams,
  TalentsResponse,
} from "../../core/models";
import type { Perfil } from "../../core/models/interfaces/Perfil";
import { useSnackbar } from "notistack";
import { handleError } from "../../core/utilities/errorHandler";
import { useForm, useFieldArray, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCreateInterviewSchema,
  CreateInterviewType,
} from "../../core/models/schemas/CreateInterviewSchema";
import { useParams } from "../../core/context/ParamsContext";
import { Loading } from "../../core/components";
import {
  ESTADO_ENTREVISTA,
  ETAPA_ENTREVISTA,
  ETAPA_ENTREVISTA_RS_LABEL,
  ETAPA_ENTREVISTA_CLIENTE_LABEL,
  TIPO_ENTREVISTA,
  TIPO_ENTREVISTA_VIRTUAL_LABEL,
  TIPO_ENTREVISTA_PRESENCIAL_LABEL,
} from "../../core/utilities/constants";
import { normalizeText } from "../../core/utilities/textUtils";
import {
  isVirtualType,
  isPresencialType,
  deriveLocationOptions,
  deriveLocationLabelMap,
  deriveUniqueClientNames,
  buildInterviewTypeFields,
  resolveTipoEntrevistaId,
  DIRECCION_MAX_LENGTH,
} from "../../core/utilities/interviewType";
import { ClientInterviewerSelect } from "../../core/components/ui/ClientInterviewerSelect";
import { InterviewLocationField } from "../../core/components/ui/InterviewLocationField";
import { useAsyncService } from "../../core/hooks/useAsyncService";
import { createInterview } from "../../core/services/interviews.service";
import { Mail, Link as LinkIcon, MapPin, Video } from "lucide-react";

interface SelectedRQ {
  id: number;
  label: string;
  cliente: string;
  idCliente?: number;
  ubicacion?: string;
  codigoRQ: string;
  lstPerfiles: Perfil[];
}

interface PrefillState {
  idTalento?: number;
  talentName?: string;
  idRequerimiento?: number;
  rqLabel?: string;
  cliente?: string;
}

export default function InterviewCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as PrefillState) || {};
  const { enqueueSnackbar } = useSnackbar();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showRQSuggestions, setShowRQSuggestions] = useState(false);
  const [talentSearchValue, setTalentSearchValue] = useState("");
  const [selectedRQs, setSelectedRQs] = useState<SelectedRQ[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const rqSuggestionsRef = useRef<HTMLDivElement>(null);
  const submissionLockRef = useRef(false);

  const goBack = () => {
    if (prefill.idRequerimiento) {
      navigate("/dashboard/tableAsignarTalento", {
        replace: true,
        state: { idRequerimiento: prefill.idRequerimiento },
      });
      return;
    }

    navigate("/dashboard/entrevistas");
  };
  const rqInputRef = useRef<HTMLInputElement>(null);

  // get params
  const { paramsByMaestro, loading: loadingParams } = useParams();

  const interviewStates = paramsByMaestro[ESTADO_ENTREVISTA] || [];
  const interviewStages = paramsByMaestro[ETAPA_ENTREVISTA] || [];
  const interviewTypes = paramsByMaestro[TIPO_ENTREVISTA] || [];

  // num1 de la etapa "Entrevista con el equipo de R&S" (entrevistadores opcionales).
  // En el resto de etapas se exige al menos un entrevistador.
  const rsStageNum1 = useMemo(() => {
    const stages = paramsByMaestro[ETAPA_ENTREVISTA] || [];
    const target = normalizeText(ETAPA_ENTREVISTA_RS_LABEL);
    const match = stages.find((s) => normalizeText(s.string1) === target);
    return match ? match.num1 : null;
  }, [paramsByMaestro]);

  // num1 de la etapa "Entrevista técnica con cliente": habilita el selector
  // de clientes registrados como entrevistadores.
  const clienteStageNum1 = useMemo(() => {
    const stages = paramsByMaestro[ETAPA_ENTREVISTA] || [];
    const target = normalizeText(ETAPA_ENTREVISTA_CLIENTE_LABEL);
    const match = stages.find((s) => normalizeText(s.string1) === target);
    return match ? match.num1 : null;
  }, [paramsByMaestro]);

  // El resolver es estable; lee el num1 vigente a través del ref para que el
  // esquema siempre valide con el valor cargado de parámetros.
  const rsStageNum1Ref = useRef<number | null>(null);
  rsStageNum1Ref.current = rsStageNum1;
  const interviewResolver = useMemo<Resolver<CreateInterviewType>>(
    () => (values, context, options) =>
      zodResolver(createCreateInterviewSchema(rsStageNum1Ref.current))(
        values,
        context,
        options,
      ),
    [],
  );

  const {
    loading: loadingTalents,
    data: talentsData,
    fetch: fetchTalents,
  } = useApi<TalentsResponse, TalentParams>(getTalents, {
    onError: (error) => handleError(error, enqueueSnackbar),
  });

  const {
    loading: loadingReqs,
    data: reqsData,
    fetch: fetchReqs,
  } = useApi<RequerimientosResponse, ReqListParams>(getRequirements, {
    onError: (error) => handleError(error, enqueueSnackbar),
  });

  /**
   * Create interview
   */
  const { loading, execute } = useAsyncService(createInterview);

  const methods = useForm<CreateInterviewType>({
    resolver: interviewResolver,
    defaultValues: {
      fecha: "",
      hora: "",
      estado: 1, // num1 = 1 is "Registrado"
      etapa: 0,
      idsRqs: [],
      perfil: "",
      tipoEntrevista: "",
      enlaceEntrevista: "",
      ubicacion: "",
      direccion: "",
      entrevistadores: [],
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
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

  const formValues = watch();

  // Clientes únicos (deduplicados por idCliente) derivados de los RQ.
  const clientNames = deriveUniqueClientNames(selectedRQs).join(", ");

  // Ubicaciones disponibles derivadas de los clientes únicos de los RQ.
  const locationOptions = useMemo(
    () => deriveLocationOptions(selectedRQs),
    [selectedRQs],
  );

  // Etiquetas legibles (url -> "Ubicación (Cliente)") para no mostrar el enlace.
  const locationLabels = useMemo(
    () => deriveLocationLabelMap(selectedRQs),
    [selectedRQs],
  );

  // Tipo de entrevista seleccionado y banderas de comportamiento condicional.
  const tipoValue = watch("tipoEntrevista");
  const ubicacionValue = watch("ubicacion");
  const isVirtual = isVirtualType(tipoValue);
  const isPresencial = isPresencialType(tipoValue);

  // Etiquetas reales de las dos posiciones del switch, tomadas del maestro 47
  // (sin hardcodear el texto). Fallback a las constantes por si el maestro aún
  // no cargó o no trae ese tipo.
  const virtualLabel =
    interviewTypes.find((t) => isVirtualType(t.string1))?.string1 ??
    TIPO_ENTREVISTA_VIRTUAL_LABEL;
  const presencialLabel =
    interviewTypes.find((t) => isPresencialType(t.string1))?.string1 ??
    TIPO_ENTREVISTA_PRESENCIAL_LABEL;

  // ¿La ubicación actual es una entrada manual (no proviene de la lista)?
  const [ubicacionCustom, setUbicacionCustom] = useState(false);

  useEffect(() => {
    register("idsRqs", { value: [] });
    register("idTalento");
    register("tipoEntrevista");
    register("ubicacion");
    register("direccion");
  }, [register]);

  // Cambio de tipo: limpia los campos del tipo contrario para no dejar valores
  // obsoletos ni en el formulario ni en el payload.
  const handleTipoChange = (value: string) => {
    setValue("tipoEntrevista", value, { shouldValidate: true });
    if (isVirtualType(value)) {
      setValue("ubicacion", "", { shouldValidate: true });
      setValue("direccion", "", { shouldValidate: true });
      setUbicacionCustom(false);
    } else if (isPresencialType(value)) {
      setValue("enlaceEntrevista", "", { shouldValidate: true });
    }
  };

  // El tipo se elige con un switch (Virtual/Presencial), que no admite un estado
  // "sin seleccionar". Al cargar el maestro 47 fijamos Virtual por defecto si el
  // formulario aún no tiene tipo.
  useEffect(() => {
    if (!tipoValue && interviewTypes.length > 0) {
      setValue("tipoEntrevista", virtualLabel, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewTypes, tipoValue]);

  // Edge case: si cambian los RQ/clientes y la ubicación elegida de la lista ya
  // no está disponible, se limpia. Las entradas personalizadas se conservan.
  useEffect(() => {
    if (!isPresencial) return;
    if (
      !ubicacionCustom &&
      ubicacionValue &&
      !locationOptions.includes(ubicacionValue)
    ) {
      setValue("ubicacion", "", { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationOptions, isPresencial]);

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

  // En la etapa "Entrevista técnica con cliente" se muestra el selector de
  // clientes registrados. idCliente se toma del primer RQ seleccionado.
  const isClienteStage =
    clienteStageNum1 != null && Number(etapaValue) === clienteStageNum1;
  const selectedClienteId =
    selectedRQs.find((r) => r.idCliente)?.idCliente ?? null;

  useEffect(() => {
    if (prefill.idTalento) {
      setTalentSearchValue(prefill.talentName || "");
      setValue("idTalento", prefill.idTalento, { shouldValidate: true });
    }
    if (prefill.idRequerimiento) {
      const rq: SelectedRQ = {
        id: prefill.idRequerimiento,
        label: prefill.rqLabel || String(prefill.idRequerimiento),
        cliente: prefill.cliente || "",
        codigoRQ: "",
        lstPerfiles: [],
      };
      setSelectedRQs([rq]);
      setValue("idsRqs", [prefill.idRequerimiento], { shouldValidate: true });
      getRequirementById(prefill.idRequerimiento)
        .then((res) => {
          const reqData = res.data.requerimiento;
          setSelectedRQs([{
            ...rq,
            codigoRQ: reqData?.codigoRQ || "",
            idCliente: reqData?.idCliente,
            ubicacion: reqData?.ubicacion,
            lstPerfiles: (reqData?.lstRqVacantes || []).map((v) => ({
              idPerfil: v.idPerfil,
              perfil: v.perfilProfesional,
              vacantesTotales: v.cantidad,
              vacantesCubiertas: 0,
            })),
          }]);
        })
        .catch(() => { /* keep without profiles */ });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: CreateInterviewType) => {
    if (submissionLockRef.current) return;
    submissionLockRef.current = true;

    console.log("Saving interview:", data);

    const typeFields = buildInterviewTypeFields(data);

    const payload = {
      idTalento: data.idTalento,
      lstIdRequerimientos: data.idsRqs,
      fecha: data.fecha,
      hora: data.hora,
      estado: Number(data.estado),
      etapa: Number(data.etapa),
      // ID_TIPO_ENTREVISTA (num1 del parámetro 47) + enlaceEntrevista/ubicacion/
      // direccion con NULL en los campos que no corresponden al tipo seleccionado.
      idTipoEntrevista: resolveTipoEntrevistaId(
        interviewTypes,
        typeFields.tipoEntrevista,
      ),
      enlaceEntrevista: typeFields.enlaceEntrevista,
      ubicacion: typeFields.ubicacion,
      direccion: typeFields.direccion,
      entrevistadores: JSON.stringify(
        (data.entrevistadores || []).map((e) => ({
          ...e,
          notificacion: e.notificacion ? 1 : 0,
        }))
      ),
      perfil: data.perfil,
    };

    try {
      const { result } = await execute(payload);

      if (result?.idTipoMensaje === 2) {
        enqueueSnackbar(result.mensaje || "Entrevista creada con éxito", {
          variant: "success",
        });
        goBack();
      } else {
        enqueueSnackbar(result?.mensaje || "No se pudo crear la entrevista", {
          variant: "error",
        });
      }
    } finally {
      submissionLockRef.current = false;
    }
  };

  const handleTalentChange = (value: string) => {
    setTalentSearchValue(value);
    setValue("idTalento", 0, { shouldValidate: true });

    if (value.length > 2) {
      fetchTalents({ search: value, nPag: 1 });
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectTalent = (talent: Talent) => {
    const fullName = `${talent.nombres} ${talent.apellidoPaterno} ${talent.apellidoMaterno}`;
    setTalentSearchValue(fullName);
    setValue("idTalento", talent.idTalento, { shouldValidate: true });
    setShowSuggestions(false);
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
    const isRemoving = !!selectedRQs.find(
      (r: SelectedRQ) => r.id === req.idRequerimiento,
    );
    if (isRemoving) {
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
          // idCliente y ubicacion vienen ya en la fila del listado (SP_REQUERIMIENTO_LST).
          idCliente: req.idCliente,
          ubicacion: req.ubicacion,
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

    if (rqInputRef.current) rqInputRef.current.value = "";
    setShowRQSuggestions(false);

    // Enriquecer con idCliente por si el listado no lo trajo. La ubicacion ya
    // viene del listado; el detalle no la sobrescribe si no la devuelve.
    if (!isRemoving) {
      getRequirementById(req.idRequerimiento)
        .then((res) => {
          const reqData = res.data.requerimiento;
          setSelectedRQs((prev) =>
            prev.map((r) =>
              r.id === req.idRequerimiento
                ? {
                    ...r,
                    idCliente: r.idCliente ?? reqData?.idCliente,
                    ubicacion: r.ubicacion ?? reqData?.ubicacion,
                  }
                : r,
            ),
          );
        })
        .catch(() => {
          /* sin idCliente/ubicacion: el selector mostrará el mensaje de ayuda */
        });
    }
  };

  const profileOptions = selectedRQs.flatMap((rq) =>
    (rq.lstPerfiles || []).map((p) => ({
      label: `${rq.codigoRQ} - ${p.perfil}`,
      value: `${rq.codigoRQ} - ${p.perfil}`,
    })),
  );

  const removeRQ = (id: number) => {
    const newRQs = selectedRQs.filter((r: SelectedRQ) => r.id !== id);
    setSelectedRQs(newRQs);
    setValue(
      "idsRqs",
      newRQs.map((r) => r.id),
      { shouldValidate: true },
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
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

  return (
    <Dashboard>
      {loadingParams && <Loading opacity="opacity-50" />}

      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <button
                type="button"
                onClick={goBack}
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
                {prefill.idRequerimiento ? "Volver a Asignar Talento" : "Volver a Entrevistas"}
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                Nueva Entrevista
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Completa los datos básicos para registrar la entrevista.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-6">
              <button
                type="button"
                onClick={goBack}
                className="btn btn-outline-gray px-5 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="btn btn-primary px-5 py-2 text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
                {loading ? "Creando..." : "Crear Entrevista"}
              </button>
            </div>
          </div>

          {/* ── Form card ── */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-6">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z"
                />
              </svg>
              Información General
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Talento */}
              <div className="flex flex-col gap-1 relative">
                <label className="input-label font-medium">Talento</label>
                <div className="relative">
                  <input
                    type="text"
                    value={talentSearchValue}
                    className={`input w-full ${errors.idTalento ? "border-red-500" : ""}`}
                    onChange={(e) => handleTalentChange(e.target.value)}
                    onFocus={() =>
                      talentSearchValue.length > 2 && setShowSuggestions(true)
                    }
                    placeholder="Nombre del talento"
                  />
                  {loadingTalents && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--color-primary)]"></div>
                    </div>
                  )}
                </div>
                {errors.idTalento && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.idTalento.message as string}
                  </p>
                )}

                {/* Suggestions Dropdown */}
                {showSuggestions &&
                  talentsData?.talents &&
                  talentsData.talents.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-10 top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                      {talentsData.talents.map((t) => (
                        <button
                          key={t.idTalento}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-none transition-colors"
                          onClick={() => selectTalent(t)}
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {t.nombres[0]}
                            {t.apellidoPaterno[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {t.nombres} {t.apellidoPaterno}{" "}
                              {t.apellidoMaterno}
                            </p>
                            <p className="text-xs text-gray-500">{t.puesto}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
              </div>

              {/* Título RQ (Searchable Multiple) */}
              <div className="flex flex-col gap-1 relative">
                <label className="input-label font-medium">
                  Requerimientos (RQ)
                </label>
                <div className="relative">
                  <input
                    ref={rqInputRef}
                    type="text"
                    className="input w-full"
                    onChange={(e) => handleRQSearch(e.target.value)}
                    onFocus={() => {
                      const val = rqInputRef.current?.value || "";
                      if (val.length > 2) setShowRQSuggestions(true);
                    }}
                    placeholder="Buscar requerimientos por título o código..."
                  />
                  {loadingReqs && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--color-primary)]"></div>
                    </div>
                  )}
                </div>
                {errors.idsRqs && (
                  <p className="text-red-500 text-xs mt-1">
                    {!errors.idsRqs.message ||
                    errors.idsRqs.message === "Required"
                      ? "Debe seleccionar al menos un requerimiento"
                      : (errors.idsRqs.message as string)}
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3 h-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
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
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 text-blue-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
              </div>

              {/* Cliente (ReadOnly - Visual only) */}
              <div className="flex flex-col gap-1">
                <label className="input-label font-medium">Cliente</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg min-h-[46px]">
                  {clientNames ? (
                    <p className="text-sm text-gray-700 font-medium">
                      {clientNames}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      Se autocompleta según el RQ
                    </p>
                  )}
                </div>
              </div>

              {/* Row: Tipo de Entrevista, Fecha, Hora */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tipo de Entrevista (switch Virtual / Presencial) rebuild*/}
                <div className="flex flex-col gap-1">
                  <label className="input-label font-medium mb-1">
                    Tipo de Entrevista <span className="text-red-500">*</span>
                  </label>
                  <label
                    className={`flex items-center justify-center gap-4 cursor-pointer select-none h-[46px] px-4 rounded-lg border bg-white transition-colors hover:border-gray-300 ${
                      errors.tipoEntrevista
                        ? "border-red-500"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isPresencial}
                      onChange={(e) =>
                        handleTipoChange(
                          e.target.checked ? presencialLabel : virtualLabel,
                        )
                      }
                      className="sr-only peer"
                    />
                    <span
                      className={`flex items-center gap-1.5 text-sm transition-colors ${
                        isVirtual
                          ? "text-[var(--color-blue)] font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      Virtual
                    </span>
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full transition-colors peer-checked:bg-[var(--color-blue)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                    <span
                      className={`flex items-center gap-1.5 text-sm transition-colors ${
                        isPresencial
                          ? "text-[var(--color-blue)] font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      Presencial
                    </span>
                  </label>
                  {errors.tipoEntrevista && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.tipoEntrevista.message}
                    </p>
                  )}
                </div>

                {/* Fecha */}
                <div className="flex flex-col gap-1">
                  <label className="input-label font-medium mb-1">Fecha</label>
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
                  <label className="input-label font-medium mb-1">Hora</label>
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

              {/* Campos dependientes del tipo de entrevista */}
              <div className="md:col-span-2">
                {!isVirtual && !isPresencial && (
                  <p className="text-sm text-gray-400 italic">
                    Selecciona el tipo de entrevista para completar sus datos.
                  </p>
                )}

                {/* VIRTUAL → Enlace de la entrevista */}
                {isVirtual && (
                  <div className="flex flex-col gap-1 max-w-xl">
                    <label className="input-label font-medium mb-1 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-[var(--color-blue)]" />
                      Enlace de la Entrevista <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-[46px] h-[46px] rounded-lg bg-gray-50 border border-gray-100 text-gray-400 shrink-0">
                        <LinkIcon className="w-5 h-5" />
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
                )}

                {/* PRESENCIAL → Ubicación + Dirección */}
                {isPresencial && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1">
                      <label className="input-label font-medium mb-1 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[var(--color-blue)]" />
                        Ubicación <span className="text-red-500">*</span>
                      </label>
                      <InterviewLocationField
                        options={locationOptions}
                        optionLabels={locationLabels}
                        value={ubicacionValue || ""}
                        isCustom={ubicacionCustom}
                        onChange={(val, custom) => {
                          setValue("ubicacion", val, { shouldValidate: true });
                          setUbicacionCustom(custom);
                        }}
                        error={errors.ubicacion?.message as string | undefined}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="input-label font-medium mb-1">
                        Dirección <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        {...register("direccion")}
                        rows={2}
                        maxLength={DIRECCION_MAX_LENGTH}
                        placeholder="Ej: Calle Andrés Reyes Nº 510, San Isidro Lima"
                        className={`input w-full resize-none ${errors.direccion ? "border-red-500" : ""}`}
                      />
                      {errors.direccion && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.direccion.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Etapa · Estado · Perfil — same row */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                {/* Etapa */}
                <div className="flex flex-col gap-1">
                  <label className="input-label font-medium">
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
                  <label className="input-label font-medium">
                    Estado de la Entrevista
                  </label>
                  <select
                    {...register("estado")}
                    className={`dropdown ${errors.estado ? "border-red-500" : ""}`}
                  >
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

                {/* Perfil / Puesto */}
                <div className="flex flex-col gap-1">
                  <label className="input-label font-medium">
                    Perfil / Puesto <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("perfil")}
                    className={`dropdown ${errors.perfil ? "border-red-500" : ""}`}
                  >
                    <option value="">Seleccione un perfil</option>
                    {profileOptions.map((opt, i) => (
                      <option key={i} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.perfil && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.perfil.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

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
                  onClick={() => appendInterviewer({ fullname: "", email: "", notificacion: false })}
                  className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1 font-medium"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
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

              {isClienteStage && (
                <ClientInterviewerSelect
                  idCliente={selectedClienteId}
                  onAdd={({ fullname, email }) =>
                    appendInterviewer({ fullname, email, notificacion: false })
                  }
                  addedEmails={(formValues.entrevistadores || [])
                    .map((e) => e.email || "")
                    .filter(Boolean)}
                />
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
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
                          Enviar al registrar
                        </span>
                        <div className="relative w-9 h-5 bg-gray-200 rounded-full transition-colors peer-checked:bg-[var(--color-blue)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
    </Dashboard>
  );
}
