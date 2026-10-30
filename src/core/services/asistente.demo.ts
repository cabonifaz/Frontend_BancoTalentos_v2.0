import { AsistenteEvento } from "./asistente.service";

/**
 * Respuestas de ejemplo para ver la pantalla en desarrollo mientras no exista el
 * backend. Los datos son inventados. Borrar al conectar el RAG.
 */

const esperar = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Cancelado", "AbortError"));
    });
  });

const respuestaDe = (mensaje: string): AsistenteEvento[] => {
  const texto = mensaje.toLowerCase();

  if (texto.includes("error")) {
    throw new Error("Error de demo");
  }

  if (texto.includes("cobol")) {
    return [
      { tipo: "estado", texto: "Buscando talentos…" },
      {
        tipo: "aviso",
        aviso: "sinResultados",
        texto: "Ningún talento coincide con esa búsqueda. Prueba sin la ciudad o con otra habilidad.",
      },
    ];
  }

  if (texto.includes("permiso")) {
    return [
      { tipo: "estado", texto: "Consultando indicadores…" },
      {
        tipo: "aviso",
        aviso: "sinPermiso",
        texto: "Tu rol no tiene permiso para consultar los indicadores de selección.",
      },
    ];
  }

  if (texto.includes("entrevista")) {
    return [
      { tipo: "estado", texto: "Consultando entrevistas…" },
      { tipo: "texto", texto: "Esta semana hay 4 entrevistas; 3 están por realizarse." },
      {
        tipo: "resultado",
        resultado: {
          tipo: "entrevistas",
          items: [
            { id: 1, talento: "Juan Pérez Quispe", requerimiento: "Backend Developer", cliente: "Andes Retail", fecha: "Lun 2 nov, 10:00 a. m.", idEstado: 1, estado: "Registrado" },
            { id: 2, talento: "María Torres Vega", requerimiento: "Analista QA", cliente: "Banco Pacífico", fecha: "Mar 3 nov, 3:30 p. m.", idEstado: 2, estado: "En proceso" },
            { id: 3, talento: "Luis Ramos Díaz", requerimiento: "Arquitecto Java", cliente: "Andes Retail", fecha: "Jue 5 nov, 9:00 a. m.", idEstado: 1, estado: "Registrado" },
            { id: 4, talento: "Ana Castro Flores", requerimiento: "Full Stack Developer", cliente: "Minera Sur", fecha: "Vie 30 oct, 11:00 a. m.", idEstado: 3, estado: "Completada" },
          ],
        },
      },
      { tipo: "seguimiento", preguntas: ["Solo las de Andes Retail", "Ver las de la próxima semana"] },
    ];
  }

  if (texto.includes("lista negra") || texto.includes("restring") || texto.includes("restric")) {
    return [
      { tipo: "estado", texto: "Consultando lista negra…" },
      { tipo: "texto", texto: "Hay 3 restricciones activas que aplican a este cliente: 2 propias y 1 global." },
      {
        tipo: "resultado",
        resultado: {
          tipo: "listaNegra",
          items: [
            { idTalento: 1, talento: "Pedro Salas León", alcance: "Andes Retail", motivo: "Abandono del proyecto", fecha: "12/08/2026" },
            { idTalento: 2, talento: "Rosa Medina Paz", alcance: "Andes Retail", motivo: "Solicitud del cliente", fecha: "03/06/2026" },
            { idTalento: 3, talento: "Carlos Ñique Ríos", alcance: "Global", motivo: "Información falsa en el CV", fecha: "21/04/2026" },
          ],
        },
      },
      { tipo: "seguimiento", preguntas: ["Ver el historial de Pedro Salas", "Solo restricciones globales"] },
    ];
  }

  if (texto.includes("selecci") || texto.includes("ingreso") || texto.includes("indicador")) {
    return [
      { tipo: "estado", texto: "Consultando indicadores…" },
      { tipo: "texto", texto: "Este es el resumen de selección del mes:" },
      {
        tipo: "resultado",
        resultado: {
          tipo: "seleccion",
          totalEntrevistas: 24,
          totalIngresos: 9,
          items: [
            { cliente: "Andes Retail", entrevistas: 11, ingresos: 4 },
            { cliente: "Banco Pacífico", entrevistas: 8, ingresos: 3 },
            { cliente: "Minera Sur", entrevistas: 5, ingresos: 2 },
          ],
        },
      },
      { tipo: "seguimiento", preguntas: ["Compáralo con el mes anterior", "Ver el detalle por usuario"] },
    ];
  }

  return [
    { tipo: "estado", texto: "Buscando habilidades en el catálogo…" },
    { tipo: "estado", texto: "Buscando talentos…" },
    { tipo: "texto", texto: "Encontré 12 talentos con Java e inglés avanzado. Estos son los primeros:" },
    {
      tipo: "resultado",
      resultado: {
        tipo: "talentos",
        total: 12,
        items: [
          { idTalento: 1, nombre: "Juan Pérez Quispe", puesto: "Desarrollador Backend Java", ciudad: "Lima", expectativa: "RxH S/ 6,000 – 7,000" },
          { idTalento: 2, nombre: "María Torres Vega", puesto: "Ingeniera de Software", ciudad: "Arequipa", expectativa: "Planilla S/ 5,500 – 6,500" },
          { idTalento: 3, nombre: "Luis Ramos Díaz", puesto: "Arquitecto Java", ciudad: "Lima", expectativa: "RxH S/ 9,000 – 10,500" },
          { idTalento: 4, nombre: "Ana Castro Flores", puesto: "Desarrolladora Full Stack", ciudad: "Trujillo", expectativa: "Planilla S/ 5,000 – 6,000" },
        ],
      },
    },
    { tipo: "seguimiento", preguntas: ["Solo los de Lima", "¿Alguno está en lista negra?", "Compara a los dos primeros"] },
  ];
};

export const responderDemo = async (
  mensaje: string,
  onEvento: (evento: AsistenteEvento) => void,
  signal: AbortSignal,
): Promise<void> => {
  await esperar(500, signal);

  for (const evento of respuestaDe(mensaje)) {
    onEvento(evento);
    await esperar(evento.tipo === "estado" ? 800 : 150, signal);
  }
};
