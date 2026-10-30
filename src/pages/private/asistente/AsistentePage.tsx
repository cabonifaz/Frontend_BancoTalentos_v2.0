import { FormEvent, useEffect, useRef, useState } from "react";
import { AlertCircle, Check, Loader2, Lock, Plus, Search, Send, Sparkles } from "lucide-react";
import { Dashboard } from "../Dashboard";
import { AsistenteResultados } from "./AsistenteResultados";
import {
  AsistenteAviso,
  AsistenteEvento,
  AsistenteResultado,
  enviarConsulta,
} from "../../../core/services/asistente.service";

interface Mensaje {
  id: number;
  pregunta: string;
  pasos: string[];
  enCurso: boolean;
  texto: string;
  resultado?: AsistenteResultado;
  aviso?: { tipo: AsistenteAviso; texto: string };
  error: boolean;
  seguimiento: string[];
}

const AVISOS = {
  sinResultados: { titulo: "No encontré resultados", Icono: Search, color: "text-gray-500 dark:text-slate-400" },
  sinPermiso: { titulo: "No tienes acceso a esta información", Icono: Lock, color: "text-amber-700 dark:text-amber-400" },
};

const Aviso = ({
  Icono,
  color,
  titulo,
  texto,
  onReintentar,
}: {
  Icono: typeof Search;
  color: string;
  titulo: string;
  texto: string;
  onReintentar?: () => void;
}) => (
  <div className="flex gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 dark:border-slate-700 dark:bg-slate-800">
    <Icono className={`h-5 w-5 flex-none ${color}`} aria-hidden="true" />
    <div className="min-w-0 flex-1">
      <div className="font-semibold text-gray-800 dark:text-slate-100">{titulo}</div>
      <div className="mt-1 leading-normal text-gray-600 dark:text-slate-400">{texto}</div>
      {onReintentar && (
        <button
          type="button"
          onClick={onReintentar}
          className="mt-2.5 h-10 rounded-lg border border-gray-400 px-3.5 font-medium text-gray-800 hover:bg-gray-100 dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          Reintentar
        </button>
      )}
    </div>
  </div>
);

/**
 * Módulo Asistente IA (autorizado por ruta vía BD). Solo consulta información: la
 * conversación vive en memoria y se pierde al salir o al empezar una nueva.
 */
export const AsistentePage = () => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [entrada, setEntrada] = useState("");
  const [enviando, setEnviando] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const siguienteId = useRef(1);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes]);

  const actualizar = (id: number, cambio: (mensaje: Mensaje) => Mensaje) =>
    setMensajes((actuales) => actuales.map((m) => (m.id === id ? cambio(m) : m)));

  const aplicarEvento = (id: number, evento: AsistenteEvento) => {
    actualizar(id, (m) => {
      switch (evento.tipo) {
        case "estado":
          return { ...m, pasos: [...m.pasos, evento.texto] };
        case "texto":
          return { ...m, enCurso: false, texto: m.texto + evento.texto };
        case "resultado":
          return { ...m, enCurso: false, resultado: evento.resultado };
        case "aviso":
          return { ...m, enCurso: false, aviso: { tipo: evento.aviso, texto: evento.texto } };
        case "seguimiento":
          return { ...m, seguimiento: evento.preguntas };
      }
    });
  };

  const consultar = async (pregunta: string) => {
    const texto = pregunta.trim();
    if (!texto || enviando) return;

    const id = siguienteId.current++;
    const controller = new AbortController();
    abortRef.current = controller;

    setEntrada("");
    setEnviando(true);
    setMensajes((actuales) => [
      ...actuales,
      { id, pregunta: texto, pasos: [], enCurso: true, texto: "", error: false, seguimiento: [] },
    ]);

    try {
      await enviarConsulta(texto, (evento) => aplicarEvento(id, evento), controller.signal);
      actualizar(id, (m) => ({ ...m, enCurso: false }));
    } catch {
      if (controller.signal.aborted) return;
      actualizar(id, (m) => ({ ...m, enCurso: false, error: true }));
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setEnviando(false);
      }
    }
  };

  const nuevaConversacion = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setEnviando(false);
    setMensajes([]);
    setEntrada("");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    consultar(entrada);
  };

  return (
    <Dashboard>
      <div className="-m-6 flex h-[calc(100%+3rem)] flex-col text-sm text-gray-800 dark:text-slate-100">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-6 py-3.5 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-[#e6f5f5] text-[#00706f] dark:bg-teal-400/10 dark:text-teal-300">
              <Sparkles className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <h1 className="text-base font-semibold">Asistente IA</h1>
          </div>
          <button
            type="button"
            onClick={nuevaConversacion}
            className="flex h-11 items-center gap-2 rounded-lg border border-gray-400 px-3.5 font-medium hover:bg-gray-100 dark:border-slate-500 dark:hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva conversación
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-7">
          <div className="mx-auto flex w-full max-w-[880px] flex-col gap-5" aria-live="polite">
            {mensajes.length === 0 && (
              <div className="pt-28 text-center">
                <h2 className="text-[28px] font-semibold">¿Qué quieres consultar?</h2>
                <p className="mt-2.5 text-[15px] text-gray-600 dark:text-slate-400">
                  Pregunta por talentos, entrevistas, lista negra o indicadores de selección.
                </p>
              </div>
            )}

            {mensajes.map((mensaje, indice) => {
              const esUltimo = indice === mensajes.length - 1;
              const hayPasos = mensaje.pasos.length > 0;

              return (
                <div key={mensaje.id} className="flex flex-col gap-3.5">
                  <div className="max-w-[72%] self-end rounded-xl bg-[#e6f5f5] px-3.5 py-2.5 dark:bg-teal-400/10">
                    {mensaje.pregunta}
                  </div>

                  {mensaje.enCurso && (
                    <div className="flex max-w-[420px] flex-col gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3.5 dark:border-slate-700 dark:bg-slate-800">
                      {mensaje.pasos.slice(0, -1).map((paso) => (
                        <div key={paso} className="flex items-center gap-2.5 text-gray-600 dark:text-slate-400">
                          <Check className="h-4 w-4 flex-none text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                          {paso.replace("…", "")}
                        </div>
                      ))}
                      <div className="flex items-center gap-2.5 font-medium">
                        <Loader2 className="h-4 w-4 flex-none animate-spin text-[#00706f] dark:text-teal-300" aria-hidden="true" />
                        {hayPasos ? mensaje.pasos[mensaje.pasos.length - 1] : "Interpretando tu consulta…"}
                      </div>
                    </div>
                  )}

                  {mensaje.texto && <p className="leading-relaxed">{mensaje.texto}</p>}

                  {mensaje.resultado && (
                    <AsistenteResultados
                      resultado={mensaje.resultado}
                      onVerMas={() => consultar("Ver más resultados")}
                    />
                  )}

                  {mensaje.aviso && (
                    <Aviso {...AVISOS[mensaje.aviso.tipo]} texto={mensaje.aviso.texto} />
                  )}

                  {mensaje.error && (
                    <Aviso
                      Icono={AlertCircle}
                      color="text-red-700 dark:text-red-400"
                      titulo="No pude completar la consulta"
                      texto="Hubo un problema al conectar con Banco de Talentos. Inténtalo de nuevo."
                      onReintentar={esUltimo && !enviando ? () => consultar(mensaje.pregunta) : undefined}
                    />
                  )}

                  {esUltimo && mensaje.seguimiento.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {mensaje.seguimiento.map((pregunta) => (
                        <button
                          key={pregunta}
                          type="button"
                          disabled={enviando}
                          onClick={() => consultar(pregunta)}
                          className="min-h-9 rounded-full border border-gray-400 bg-white px-3 py-1.5 text-[13px] hover:bg-gray-100 disabled:opacity-50 dark:border-slate-500 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                          {pregunta}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={finRef} />
          </div>
        </div>

        {/* El padding inferior evita que el logo fijo de Fractal tape el cuadro en pantallas angostas */}
        <div className="px-6 pb-16 pt-1 xl:pb-[18px]">
          <form onSubmit={onSubmit} className="mx-auto w-full max-w-[880px]">
            <label htmlFor="asistente-mensaje" className="sr-only">
              Escribe tu consulta
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-gray-400 bg-white py-2 pl-4 pr-2 dark:border-slate-500 dark:bg-slate-800">
              <input
                id="asistente-mensaje"
                type="text"
                autoComplete="off"
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                placeholder="Escribe tu consulta…"
                className="h-10 min-w-0 flex-1 border-0 bg-transparent outline-none placeholder:text-gray-500 dark:placeholder:text-slate-400"
              />
              <button
                type="submit"
                aria-label="Enviar"
                disabled={enviando || !entrada.trim()}
                className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-[#00706f] text-white hover:bg-[#005f5e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-gray-600 dark:text-slate-400">
              El asistente solo consulta información; no crea ni modifica datos.
            </p>
          </form>
        </div>
      </div>
    </Dashboard>
  );
};

export default AsistentePage;
