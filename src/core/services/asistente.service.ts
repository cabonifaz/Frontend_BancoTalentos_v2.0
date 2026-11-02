/**
 * Asistente IA: conecta la pantalla con POST /api/v1/mcp/chat del RAG de Fractal,
 * que consulta el MCP de BDT. Hoy el RAG responde solo texto y sin streaming; los
 * demás eventos quedan listos para cuando devuelva resultados estructurados.
 * OJO: la URL y los IDs están fijos en este archivo solo para probar en local, y el
 * endpoint hoy no pide autenticación. Cada mensaje se procesa sin historial.
 */

export interface TalentoResultado {
  idTalento: number;
  nombre: string;
  puesto: string;
  ciudad: string;
  expectativa: string;
}

export interface EntrevistaResultado {
  id: number;
  talento: string;
  requerimiento: string;
  cliente: string;
  fecha: string;
  idEstado: number;
  estado: string;
}

export interface RestriccionResultado {
  idTalento: number;
  talento: string;
  alcance: string;
  motivo: string;
  fecha: string;
}

export interface RendimientoResultado {
  cliente: string;
  entrevistas: number;
  ingresos: number;
}

export type AsistenteResultado =
  | { tipo: "talentos"; total: number; items: TalentoResultado[] }
  | { tipo: "entrevistas"; items: EntrevistaResultado[] }
  | { tipo: "listaNegra"; items: RestriccionResultado[] }
  | {
      tipo: "seleccion";
      totalEntrevistas: number;
      totalIngresos: number;
      items: RendimientoResultado[];
    };

export type AsistenteAviso = "sinResultados" | "sinPermiso";

export type AsistenteEvento =
  /** Paso en curso de la consulta; el anterior queda como terminado. */
  | { tipo: "estado"; texto: string }
  | { tipo: "texto"; texto: string }
  | { tipo: "resultado"; resultado: AsistenteResultado }
  | { tipo: "aviso"; aviso: AsistenteAviso; texto: string }
  | { tipo: "seguimiento"; preguntas: string[] };

// Valores fijos solo para probar en local.
const RAG_URL: string = "http://127.0.0.1:8000";
const RAG_COMPANY_ID: number = 2007;
const RAG_AREA_ID: number = 27;
const INSTRUCCION_IDIOMA = "Responde siempre en español.";

export interface MensajeHistorial {
  role: "user" | "assistant";
  content: string;
}

export const enviarConsulta = async (
  mensaje: string,
  historial: MensajeHistorial[],
  onEvento: (evento: AsistenteEvento) => void,
  signal: AbortSignal,
): Promise<void> => {
  if (!RAG_URL || !RAG_COMPANY_ID || !RAG_AREA_ID) {
    throw new Error("Falta la configuración del Asistente IA.");
  }

  onEvento({ tipo: "estado", texto: "Consultando Banco de Talentos…" });

  const respuesta = await fetch(`${RAG_URL}/api/v1/mcp/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `${mensaje}\n\n${INSTRUCCION_IDIOMA}`,
      company_id: RAG_COMPANY_ID,
      area_id: RAG_AREA_ID,
      history: historial,
    }),
    signal,
  });

  if (!respuesta.ok) {
    throw new Error(`El Asistente IA respondió HTTP ${respuesta.status}.`);
  }

  const data: { response: string } = await respuesta.json();
  onEvento({ tipo: "texto", texto: data.response });
};
