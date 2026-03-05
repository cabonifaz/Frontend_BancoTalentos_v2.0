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

type InterviewEstado =
  | "Registrado"
  | "Pendiente"
  | "En Proceso"
  | "Finalizado"
  | "Cancelado";

interface CreateForm {
  talento: string;
  cliente: string;
  fecha: string;
  hora: string;
  estado: InterviewEstado;
  etapa: string;
  enlaceEntrevista: string;
}

interface SelectedRQ {
  id: number;
  label: string;
  cliente: string;
}

const ESTADOS: InterviewEstado[] = [
  "Registrado",
  "Pendiente",
  "En Proceso",
  "Finalizado",
  "Cancelado",
];

const ETAPAS = [
  "Filtro Telefónico",
  "Entrevista Técnica",
  "Entrevista RRHH",
  "Entrevista con Cliente",
  "Prueba Técnica",
  "Entrevista Final",
];

export default function InterviewCreatePage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showRQSuggestions, setShowRQSuggestions] = useState(false);
  const [selectedRQs, setSelectedRQs] = useState<SelectedRQ[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const rqSuggestionsRef = useRef<HTMLDivElement>(null);
  const rqInputRef = useRef<HTMLInputElement>(null);

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

  const [form, setForm] = useState<CreateForm>({
    talento: "",
    cliente: "",
    fecha: "",
    hora: "",
    estado: "Pendiente",
    etapa: "Entrevista Técnica",
    enlaceEntrevista: "",
  });

  const set = (field: keyof CreateForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    // TODO: call API then navigate to the created interview's detail page
    navigate("/dashboard/entrevistas");
  };

  const handleTalentChange = (value: string) => {
    set("talento", value);
    if (value.length > 2) {
      fetchTalents({ search: value, nPag: 1 });
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectTalent = (talent: Talent) => {
    set(
      "talento",
      `${talent.nombres} ${talent.apellidoPaterno} ${talent.apellidoMaterno}`,
    );
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

    // Update unique clients in form
    const uniqueClients = Array.from(
      new Set(newRQs.map((r: SelectedRQ) => r.cliente)),
    ).join(", ");
    set("cliente", uniqueClients);

    if (rqInputRef.current) rqInputRef.current.value = "";
    setShowRQSuggestions(false);
  };

  const removeRQ = (id: number) => {
    const newRQs = selectedRQs.filter((r: SelectedRQ) => r.id !== id);
    setSelectedRQs(newRQs);
    const uniqueClients = Array.from(
      new Set(newRQs.map((r: SelectedRQ) => r.cliente)),
    ).join(", ");
    set("cliente", uniqueClients);
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
      <div className="p-4 mx-4 xl:mx-16 pb-12">
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
              type="button"
              onClick={handleSave}
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
                  className="input w-full"
                  value={form.talento}
                  onChange={(e) => handleTalentChange(e.target.value)}
                  onFocus={() =>
                    form.talento.length > 2 && setShowSuggestions(true)
                  }
                  placeholder="Nombre del talento"
                />
                {loadingTalents && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--color-primary)]"></div>
                  </div>
                )}
              </div>

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
                            {t.nombres} {t.apellidoPaterno} {t.apellidoMaterno}
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
                {form.cliente ? (
                  <p className="text-sm text-gray-700 font-medium">
                    {form.cliente}
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
                    type="url"
                    className="input w-full"
                    value={form.enlaceEntrevista}
                    onChange={(e) => set("enlaceEntrevista", e.target.value)}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              </div>

              {/* Fecha */}
              <div className="flex flex-col gap-1">
                <label className="input-label font-medium mb-1">Fecha</label>
                <input
                  type="date"
                  className="input w-full"
                  value={form.fecha}
                  onChange={(e) => set("fecha", e.target.value)}
                />
              </div>

              {/* Hora */}
              <div className="flex flex-col gap-1">
                <label className="input-label font-medium mb-1">Hora</label>
                <input
                  type="time"
                  className="input w-full"
                  value={form.hora}
                  onChange={(e) => set("hora", e.target.value)}
                />
              </div>
            </div>

            {/* Etapa */}
            <div className="flex flex-col gap-1">
              <label className="input-label font-medium">
                Etapa de la Entrevista
              </label>
              <select
                className="dropdown"
                value={form.etapa}
                onChange={(e) => set("etapa", e.target.value)}
              >
                {ETAPAS.map((et) => (
                  <option key={et} value={et}>
                    {et}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div className="flex flex-col gap-1">
              <label className="input-label font-medium">
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
        </div>
      </div>
    </Dashboard>
  );
}
