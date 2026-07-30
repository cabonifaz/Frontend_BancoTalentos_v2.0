//export const BASE_URL = "https://bancotalentobackendstaging-gee7h5b8exe6gkhb.canadacentral-01.azurewebsites.net";
//export const BASE_URL_FMI = "https://autfmibackendstaging-gnfub6d8cdg5aqbd.canadacentral-01.azurewebsites.net";
export const BASE_URL = "http://localhost:8080";
export const BASE_URL_FMI = "http://localhost:8081";
export const ARCHIVO_PDF = 1;
export const ARCHIVO_IMAGEN = 0;
export const ARCHIVO_WORD = 7;
export const DOCUMENTO_CV = 1;
export const DOCUMENTO_FOTO_PERFIL = 0;
export const DOCUMENTO_CERT_DIP = 99;
export const DOCUMENTO_CV_FR_ES = 5;
export const DOCUMENTO_CV_FR_EN = 6;

// Validación de subida de archivos de postulante (debe coincidir con el backend).
export const POSTULANT_ALLOWED_EXTENSIONS: string[] = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "zip",
];
export const POSTULANT_MAX_FILE_SIZE_MB = 10;

// RQ STATE
export const ESTADO_REGISTRADO = 1;
export const ESTADO_ASIGNADO = 2;
export const ESTADO_ATENDIDO = 3;

// RQ TALENT STATE
export const ESTADO_OBSERVADO = 1;
export const ESTADO_DATOS_COMPLETOS = 2;
export const ESTADO_EN_ENTREVISTA = 3;
export const ESTADO_CONFIRMADO = 4;

// MODALIDAD FACTURACIÓN
export const MODALIDAD_RXH = 1;
export const MODALIDAD_PLANILLA = 2;

// PARAMS
export const TIPO_TIEMPO = "5";
export const TIPO_MONEDA = "2";
export const TIPO_MODALIDAD = "3";
export const TIPO_MODAL_MODALIDAD = "6";
export const UNIDAD = "7";
export const MOTIVO_INGRESO = "8";
export const MOTIVO_CESE = "10";
export const TIPO_EQUIPO = "2";
export const MARCA_EQUIPO = "5";
export const TIPO_HARDWARE = "21";
export const ANEXO_HARDWARE = "22";
export const TIPO_SOFTWARE = "23";
export const ESTADO_RQ = "24";
export const PERFIL = "14";
export const DURACION_RQ = "28";
export const LIMITE_ALERTA_RQ = "30";
export const MODALIDAD_RQ = "31";
export const HORARIO_TRABAJO = "34";
export const PROYECTO_SERVICIO = "36";
export const OBJETO_CONTRATO = "37";
export const FRASES_IA_MAESTRO = "40";
export const HABILIDADES_TECNICAS = "19";
export const GRADO_ESTUDIO = "38";
export const TIPO_ARCHIVOS_RQ = "41";
export const TIPO_ARCHIVO = "17";
export const ESTADO_ENTREVISTA = "43";
export const ETAPA_ENTREVISTA = "44";
export const TIPO_ARCHIVO_ENTREVISTA = "45";
export const MAESTRO_TIPO_ARCHIVO_POSTULANTE = "46";
export const TIPO_ENTREVISTA = "47";

// Tipos de entrevista (valores en string1 del maestro 47). Se comparan de forma
// normalizada (sin tildes/mayúsculas) para decidir el comportamiento condicional.
export const TIPO_ENTREVISTA_PRESENCIAL_LABEL = "PRESENCIAL";
export const TIPO_ENTREVISTA_VIRTUAL_LABEL = "VIRTUAL";

// Etapa de entrevista en la que los entrevistadores son opcionales.
// En cualquier otra etapa se exige al menos un entrevistador.
export const ETAPA_ENTREVISTA_RS_LABEL = "Entrevista con el equipo de R&S";

// Etapa de entrevista en la que se permite agregar clientes registrados
// (contactos del cliente) como entrevistadores.
export const ETAPA_ENTREVISTA_CLIENTE_LABEL = "Entrevista técnica con cliente";

// GRUPOS DE MODALIDADES (NUM2 EN PARAMETROS)
export const GROUP_MODALIDAD_LOC_SERVICIOS = 2;
export const GROUP_MODALIDAD_PLANILLA = 1;

// PERSISTENCIA EN EL FORM NUEVO TALENTO, CAMPOS Y ARCHIVOS
export const FORM_STORAGE_KEY = "addTalentFormDraft";
export const FORM_FILES_STORAGE_KEY = "addTalentFormFiles";

// ALL PARAM IDS — single fetch on app load
export const ALL_PARAMS_IDS = "2,3,5,7,8,12,13,15,16,17,19,20,21,22,23,24,28,31,32,34,36,37,38,40,41,43,44,45,46,47";

// PROCEDENCIA DEL TALENTO — se maneja como texto (string), no como ID.
// El valor seleccionado es exactamente el texto de la opción.
export const PROCEDENCIA_OPTIONS = [
  "LinkedIn",
  "Indeed",
  "CV Matcher",
  "WhatsApp",
  "Computrabajo",
  "Bumeran",
  "Referido",
  "Facebook",
  "Otro",
] as const;