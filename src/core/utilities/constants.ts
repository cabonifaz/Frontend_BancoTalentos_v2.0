//export const BASE_URL = "https://bancotalentobackendstaging-gee7h5b8exe6gkhb.canadacentral-01.azurewebsites.net";
//export const BASE_URL_FMI = "https://autfmibackendstaging-gnfub6d8cdg5aqbd.canadacentral-01.azurewebsites.net";
export const BASE_URL = "http://localhost:8080";
export const BASE_URL_FMI = "http://localhost:8081";
export const ARCHIVO_PDF = 1;
export const ARCHIVO_IMAGEN = 0;
export const DOCUMENTO_CV = 1;
export const DOCUMENTO_FOTO_PERFIL = 0;
export const DOCUMENTO_CERT_DIP = 99;
export const DOCUMENTO_CV_FR_ES = 5;
export const DOCUMENTO_CV_FR_EN = 6;

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

// GRUPOS DE MODALIDADES (NUM2 EN PARAMETROS)
export const GROUP_MODALIDAD_LOC_SERVICIOS = 2;
export const GROUP_MODALIDAD_PLANILLA = 1;

// PERSISTENCIA EN EL FORM NUEVO TALENTO, CAMPOS Y ARCHIVOS
export const FORM_STORAGE_KEY = "addTalentFormDraft";
export const FORM_FILES_STORAGE_KEY = "addTalentFormFiles";
