import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import { getRequirements, getTalents } from "../../core/services/apiService";
import { useApi } from "../../core/hooks/useApi";
import {
  RequirementItem,
  ReqListParams,
  RequerimientosResponse,
  Talent,
  TalentParams,
  TalentsResponse,
} from "../../core/models";
import { useSnackbar } from "notistack";
import { handleError } from "../../core/utilities/errorHandler";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateInterviewSchema,
  CreateInterviewType,
} from "../../core/models/schemas/CreateInterviewSchema";
import { useParams } from "../../core/context/ParamsContext";
import { Loading } from "../../core/components";
import {
  ESTADO_ENTREVISTA,
  ETAPA_ENTREVISTA,
} from "../../core/utilities/constants";
import { useAsyncService } from "../../core/hooks/useAsyncService";
import { createInterview } from "../../core/services/interviews.service";

interface SelectedRQ {
  id: number;
  label: string;
  cliente: string;
}

export default function InterviewCreatePage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showRQSuggestions, setShowRQSuggestions] = useState(false);
  const [talentSearchValue, setTalentSearchValue] = useState("");
  const [selectedRQs, setSelectedRQs] = useState<SelectedRQ[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const rqSuggestionsRef = useRef<HTMLDivElement>(null);
  const rqInputRef = useRef<HTMLInputElement>(null);

  // get params
  const { paramsByMaestro, loading: loadingParams } = useParams(
    `${ESTADO_ENTREVISTA},${ETAPA_ENTREVISTA}`,
  );

  const interviewStates = paramsByMaestro[ESTADO_ENTREVISTA] || [];
  const interviewStages = paramsByMaestro[ETAPA_ENTREVISTA] || [];

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
  const { result, loading, execute } = useAsyncService(createInterview);

  const methods = useForm<CreateInterviewType>({
    resolver: zodResolver(CreateInterviewSchema),
    defaultValues: {
      fecha: "",
      hora: "",
      estado: 1, // num1 = 1 is "Registrado"
      etapa: 0,
      idsRqs: [],
      enlaceEntrevista: "",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const formValues = watch();

  const clientNames = Array.from(
    new Set(selectedRQs.map((r: SelectedRQ) => r.cliente)),
  ).join(", ");

  useEffect(() => {
    register("idsRqs", { value: [] });
    register("idTalento");
  }, [register]);

  const onSubmit = async (data: any) => {
    console.log("Saving interview:", data);

    const payload = {
      idTalento: data.idTalento,
      lstIdRequerimientos: data.idsRqs,
      fecha: data.fecha,
      hora: data.hora,
      estado: Number(data.estado),
      etapa: Number(data.etapa),
      enlaceEntrevista: data.enlaceEntrevista || "",
    };

    const { result } = await execute(payload);

    if (result?.idTipoMensaje === 2) {
      enqueueSnackbar(result.mensaje || "Entrevista creada con éxito", {
        variant: "success",
      });
      navigate("/dashboard/entrevistas");
    } else {
      enqueueSnackbar(result?.mensaje || "No se pudo crear la entrevista", {
        variant: "error",
      });
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

      <div className="p-4 mx-4 xl:mx-16 pb-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-4 my-4">
            <div>
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
                Nueva Entrevista
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Completa los datos básicos para registrar la entrevista.
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
                type="submit"
                className="btn btn-primary px-5 py-2 text-sm flex items-center gap-2"
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
                Crear Entrevista
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

              {/* Row: Enlace, Fecha, Hora */}
              <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
                {/* Enlace de Entrevista */}
                <div className="lg:col-span-2 flex flex-col gap-1">
                  <label className="input-label font-medium mb-1">
                    Enlace de la Entrevista
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-[46px] h-[46px] rounded-lg bg-gray-50 border border-gray-100 text-gray-400 shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
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
            </div>
          </div>
        </form>
      </div>
    </Dashboard>
  );
}
