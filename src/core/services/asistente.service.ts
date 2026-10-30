/**
 * Asistente IA: contrato entre la pantalla y el backend que lo atenderá (RAG de
 * Fractal + MCP de BDT). OJO: ese backend todavía no está conectado y estos tipos
 * son una propuesta; hay que ajustarlos a lo que termine devolviendo el RAG.
 * En desarrollo responde una demo (asistente.demo.ts); fuera de desarrollo la
 * pantalla muestra el aviso de error.
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

export const enviarConsulta = async (
  mensaje: string,
  onEvento: (evento: AsistenteEvento) => void,
  signal: AbortSignal,
): Promise<void> => {
  if (import.meta.env.DEV) {
    const { responderDemo } = await import("./asistente.demo");
    return responderDemo(mensaje, onEvento, signal);
  }

  throw new Error("El Asistente IA todavía no está conectado.");
};
