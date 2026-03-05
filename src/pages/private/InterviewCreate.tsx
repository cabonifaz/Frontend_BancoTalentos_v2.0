import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import { getTalents } from "../../core/services/apiService";
import { useApi } from "../../core/hooks/useApi";
import { Talent, TalentParams, TalentsResponse } from "../../core/models";
import { useSnackbar } from "notistack";
import { handleError } from "../../core/utilities/errorHandler";
import { Loading } from "../../core/components";

type InterviewEstado =
  | "Registrado"
  | "Pendiente"
  | "En Proceso"
  | "Finalizado"
  | "Cancelado";

interface CreateForm {
  talento: string;
  tituloRQ: string;
  cliente: string;
  fecha: string;
  estado: InterviewEstado;
}

const ESTADOS: InterviewEstado[] = [
  "Registrado",
  "Pendiente",
  "En Proceso",
  "Finalizado",
  "Cancelado",
];

export default function InterviewCreatePage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const {
    loading: loadingTalents,
    data: talentsData,
    fetch: fetchTalents,
  } = useApi<TalentsResponse, TalentParams>(getTalents, {
    onError: (error) => handleError(error, enqueueSnackbar),
  });

  const [form, setForm] = useState<CreateForm>({
    talento: "",
    tituloRQ: "",
    cliente: "",
    fecha: "",
    estado: "Pendiente",
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
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

            {/* Título RQ */}
            <div className="flex flex-col gap-1">
              <label className="input-label font-medium">Título RQ</label>
              <input
                type="text"
                className="input w-full"
                value={form.tituloRQ}
                onChange={(e) => set("tituloRQ", e.target.value)}
                placeholder="Ej: Senior Backend Engineer"
              />
            </div>

            {/* Cliente */}
            <div className="flex flex-col gap-1">
              <label className="input-label font-medium">Cliente</label>
              <input
                type="text"
                className="input w-full"
                value={form.cliente}
                onChange={(e) => set("cliente", e.target.value)}
                placeholder="Nombre del cliente"
              />
            </div>

            {/* Fecha */}
            <div className="flex flex-col gap-1">
              <label className="input-label font-medium">Fecha</label>
              <input
                type="date"
                className="input w-full"
                value={form.fecha}
                onChange={(e) => set("fecha", e.target.value)}
              />
            </div>

            {/* Estado */}
            <div className="md:col-span-2 flex flex-col gap-1">
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
