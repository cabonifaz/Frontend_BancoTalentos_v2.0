import { useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { FileText, Sparkles, Upload, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useFetchCVData } from "../../../hooks/talentos/useFetchCVData";
import { addTalent } from "../../../services/talents.service";
import { AddTalentParams } from "../../../models";
import {
  DatosCV,
  datosDelCV,
  resumenDelCV,
} from "../../../utilities/quickCV";
import { ARCHIVO_PDF, DOCUMENTO_CV } from "../../../utilities/constants";
import { Utils } from "../../../utilities/utils";
import { handleError } from "../../../utilities/errorHandler";
import { useParams } from "../../../context/ParamsContext";

interface Props {
  onClose: () => void;
  /** El alta terminó: la pantalla decide a dónde llevar al usuario. */
  onCreated: (idTalento: number | undefined, nombreCompleto: string) => void;
}

interface FormularioRapido {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  /** País del maestro 12: de ahí sale el prefijo, igual que en el alta normal. */
  idPais: number;
  celular: string;
  email: string;
}

type ErroresRapido = Partial<Record<keyof FormularioRapido, string>>;

const FORM_VACIO: FormularioRapido = {
  nombres: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  idPais: 0,
  celular: "",
  email: "",
};

/** PARAMETROS maestro 12: num1 = país, string1 = nombre, string3 = prefijo. */
const MAESTRO_PAISES = 12;
/** Maestros que hacen falta para guardar lo que el modal no enseña. */
const MAESTRO_CIUDADES = 13;
const MAESTRO_HAB_TECNICAS = 19;
const MAESTRO_HAB_BLANDAS = 20;

/** Largo del número local en Perú; lo que sobre por delante es el prefijo. */
const LARGO_NUMERO_LOCAL = 9;

const soloDigitos = (texto?: string | null) => (texto ?? "").replace(/\D/g, "");

/**
 * El CV devuelve el celular como una tira de dígitos ("51987654321"). Se parte
 * en prefijo + número: el prefijo sirve para preseleccionar el país en el combo
 * y el resto va al input. Si el número no trae prefijo, el país se deja al
 * usuario, que es quien mejor lo sabe.
 */
const partirCelular = (celular?: string | null) => {
  const digitos = soloDigitos(celular);
  if (!digitos) return { prefijo: "", numero: "" };
  if (digitos.length <= LARGO_NUMERO_LOCAL) {
    return { prefijo: "", numero: digitos };
  }
  return {
    prefijo: digitos.slice(0, digitos.length - LARGO_NUMERO_LOCAL),
    numero: digitos.slice(-LARGO_NUMERO_LOCAL),
  };
};

const Campo = ({
  id,
  label,
  valor,
  onChange,
  error,
  requerido,
  placeholder,
  tipo = "text",
}: {
  id: string;
  label: string;
  valor: string;
  onChange: (valor: string) => void;
  error?: string;
  requerido?: boolean;
  placeholder?: string;
  tipo?: string;
}) => (
  <div className="flex flex-col gap-1">
    <label
      htmlFor={id}
      className="text-sm text-[#636d7c] px-1 dark:text-slate-400"
    >
      {label}
      {requerido && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      type={tipo}
      value={valor}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="input h-11 w-full !py-0"
    />
    {error && <p className="text-red-400 text-xs px-1">{error}</p>}
  </div>
);

/**
 * Carga rápida de un talento desde su CV.
 *
 * Tres pasos en un solo modal: subir el PDF, revisar lo que la IA leyó y crear.
 * Sólo se piden identidad y contacto —lo que conviene revisar a ojo— pero el CV
 * se analiza entero: experiencia, estudios, habilidades, idiomas, presentación
 * y redes se guardan igual que en el alta larga, sin mostrarlos aquí.
 */
export const ModalQuickTalent = ({ onClose, onCreated }: Props) => {
  const { fetchCVDetails } = useFetchCVData();
  const { paramsByMaestro } = useParams();
  const paises = paramsByMaestro[MAESTRO_PAISES] || [];
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [analizando, setAnalizando] = useState(false);
  const [creando, setCreando] = useState(false);
  const [datosLeidos, setDatosLeidos] = useState(false);
  const [form, setForm] = useState<FormularioRapido>(FORM_VACIO);
  /** Todo lo que la IA leyó y no se enseña, ya listo para el alta. */
  const [extra, setExtra] = useState<Partial<AddTalentParams>>({});
  const [resumen, setResumen] = useState<string[]>([]);
  const [errores, setErrores] = useState<ErroresRapido>({});
  /** Campos que el CV no traía: se marcan para que el usuario los complete. */
  const [faltantes, setFaltantes] = useState<string[]>([]);

  const modalRoot = document.getElementById("modal");
  const ocupado = analizando || creando;

  const setCampo = (
    campo: keyof FormularioRapido,
    valor: string | number,
  ) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  /** Prefijo que se muestra y se guarda, tal como en el alta normal. */
  const prefijoDelPais = (idPais: number) =>
    paises.find((pais) => pais.num1 === idPais)?.string3 || "";

  const handleArchivo = (archivo: File | null) => {
    if (!archivo) return;
    if (!archivo.name.toLowerCase().endsWith(".pdf")) {
      enqueueSnackbar("El CV debe ser un archivo PDF", { variant: "warning" });
      return;
    }
    setCvFile(archivo);
    setDatosLeidos(false);
    setExtra({});
    setResumen([]);
  };

  const volcarDatos = (datos: DatosCV) => {
    // El análisis completo separa el código del número, pero no siempre trae el
    // código: cuando falta se intenta deducir del propio número.
    const partido = partirCelular(datos.contacto?.celularNum);
    const prefijo =
      soloDigitos(datos.contacto?.celularCod) || partido.prefijo;
    const numero = partido.numero;
    // El prefijo leído del CV se cruza con el maestro para dejar el país ya
    // elegido; si no coincide con ninguno, el combo queda vacío.
    const paisDetectado = prefijo
      ? paises.find((pais) => soloDigitos(pais.string3) === prefijo)?.num1
      : undefined;

    setForm({
      nombres: datos.nombres?.trim() ?? "",
      apellidoPaterno: datos.apellidoPaterno?.trim() ?? "",
      apellidoMaterno: datos.apellidoMaterno?.trim() ?? "",
      idPais: paisDetectado ?? 0,
      celular: numero,
      email: datos.contacto?.email?.trim() ?? "",
    });

    const resto = datosDelCV(datos, {
      paises,
      ciudades: paramsByMaestro[MAESTRO_CIUDADES] || [],
      habilidadesTecnicas: paramsByMaestro[MAESTRO_HAB_TECNICAS] || [],
      habilidadesBlandas: paramsByMaestro[MAESTRO_HAB_BLANDAS] || [],
    });
    setExtra(resto);
    setResumen(resumenDelCV(resto));

    const sinDato: string[] = [];
    if (!datos.nombres) sinDato.push("nombres");
    if (!datos.apellidoPaterno) sinDato.push("apellidos");
    if (!numero) sinDato.push("celular");
    if (!datos.contacto?.email) sinDato.push("correo");
    setFaltantes(sinDato);
  };

  const analizar = async () => {
    if (!cvFile) return;
    setAnalizando(true);
    try {
      const { data } = await fetchCVDetails(cvFile);
      volcarDatos(data);
      setDatosLeidos(true);
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : "No se pudo leer el CV",
        { variant: "error" },
      );
    } finally {
      setAnalizando(false);
    }
  };

  const validar = (): boolean => {
    const nuevos: ErroresRapido = {};
    if (!form.nombres.trim()) nuevos.nombres = "Los nombres son requeridos";
    if (!form.apellidoPaterno.trim())
      nuevos.apellidoPaterno = "El apellido paterno es requerido";
    if (!form.celular.trim()) nuevos.celular = "El celular es requerido";
    else if (!/^\d{6,15}$/.test(form.celular.trim()))
      nuevos.celular = "Sólo dígitos (6 a 15)";
    if (!form.idPais) nuevos.idPais = "Seleccione un país";
    if (!form.email.trim()) nuevos.email = "El correo es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      nuevos.email = "Correo inválido";

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const crear = async () => {
    if (!validar() || !cvFile) return;

    setCreando(true);
    try {
      const cvBase64 = await Utils.fileToBase64(cvFile);

      // Lo leído del CV va primero: identidad y contacto los pisa lo que el
      // usuario acaba de revisar, que es lo único que se le enseñó.
      const params: AddTalentParams = {
        ...extra,
        dni: extra.dni ?? null,
        // Si el CV no decía de dónde es, queda el país del teléfono.
        idPais: extra.idPais ?? form.idPais,
        nombres: form.nombres.trim(),
        apellidoPaterno: form.apellidoPaterno.trim(),
        apellidoMaterno: form.apellidoMaterno.trim() || null,
        email: form.email.trim(),
        telefono: `${prefijoDelPais(form.idPais)} ${form.celular.trim()}`,
        idMoneda: null,
        tieneEquipo: false,
        cvArchivo: {
          stringB64: cvBase64,
          nombreArchivo: Utils.getFileNameWithoutExtension(cvFile.name),
          extensionArchivo: "pdf",
          idTipoArchivo: ARCHIVO_PDF,
          idTipoDocumento: DOCUMENTO_CV,
        },
      };

      const { data } = await addTalent(params);

      if (data.idMensaje !== 2) {
        enqueueSnackbar(data.mensaje || "No se pudo crear el talento", {
          variant: "warning",
        });
        return;
      }

      enqueueSnackbar(data.mensaje || "Talento creado", {
        variant: "success",
      });

      const nombreCompleto = `${form.nombres.trim()} ${form.apellidoPaterno.trim()} ${form.apellidoMaterno.trim()}`
        .replace(/\s+/g, " ")
        .trim();

      onCreated(data.idNuevo, nombreCompleto);
    } catch (error) {
      handleError(error, enqueueSnackbar);
    } finally {
      setCreando(false);
    }
  };

  if (!modalRoot) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#00000048] p-4 dark:bg-black/70">
      <div className="flex w-full max-h-[90vh] flex-col overflow-hidden rounded-lg bg-white p-6 dark:bg-slate-800 md:w-[560px]">
        <div className="mb-1 flex items-start justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-slate-100">
              <Sparkles size={18} strokeWidth={1.8} className="text-[#0b85c3]" />
              Carga rápida con CV
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              Sólo revisas nombres, apellidos, celular y correo. Lo demás que
              traiga el CV (experiencia, estudios, habilidades e idiomas) se
              guarda igual.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={ocupado}
            aria-label="Cerrar"
            className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          {/* Paso 1: el CV */}
          <div>
            <input
              ref={inputArchivoRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => handleArchivo(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => inputArchivoRef.current?.click()}
              disabled={ocupado}
              className="flex w-full items-center gap-3 rounded-lg border border-dashed border-gray-300 p-4 text-left transition-colors hover:border-[#0b85c3] hover:bg-sky-50 disabled:opacity-60 dark:border-slate-600 dark:hover:border-sky-400 dark:hover:bg-sky-400/10"
            >
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-300">
                {cvFile ? <FileText size={18} /> : <Upload size={18} />}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-gray-800 dark:text-slate-100">
                  {cvFile ? cvFile.name : "Seleccionar CV (PDF)"}
                </span>
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {cvFile
                    ? "Pulsa para cambiar el archivo"
                    : "El CV se guardará junto al talento"}
                </span>
              </span>
            </button>
          </div>

          {cvFile && !datosLeidos && (
            <button
              type="button"
              onClick={analizar}
              disabled={ocupado}
              className="btn btn-primary mx-0 flex h-11 items-center justify-center gap-2"
            >
              <Sparkles size={18} strokeWidth={2} />
              {analizando ? "Analizando el CV…" : "Analizar CV"}
            </button>
          )}

          {/* Paso 2: lo que leyó la IA, editable */}
          {datosLeidos && (
            <>
              {resumen.length > 0 && (
                <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:bg-sky-400/10 dark:text-sky-300">
                  Del CV también se guardarán {resumen.join(", ")}.
                </p>
              )}

              {faltantes.length > 0 && (
                <p className="rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-300">
                  El CV no traía {faltantes.join(", ")}. Complétalo abajo antes
                  de crear.
                </p>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Campo
                  id="qt-nombres"
                  label="Nombres"
                  requerido
                  valor={form.nombres}
                  error={errores.nombres}
                  onChange={(v) => setCampo("nombres", v)}
                />
                <Campo
                  id="qt-apellido-paterno"
                  label="Apellido paterno"
                  requerido
                  valor={form.apellidoPaterno}
                  error={errores.apellidoPaterno}
                  onChange={(v) => setCampo("apellidoPaterno", v)}
                />
                <Campo
                  id="qt-apellido-materno"
                  label="Apellido materno"
                  valor={form.apellidoMaterno}
                  error={errores.apellidoMaterno}
                  onChange={(v) => setCampo("apellidoMaterno", v)}
                />
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label
                    htmlFor="qt-pais"
                    className="text-sm text-[#636d7c] px-1 dark:text-slate-400"
                  >
                    Número de celular<span className="text-red-500">*</span>
                  </label>
                  <select
                    id="qt-pais"
                    autoComplete="tel-country-code"
                    value={form.idPais}
                    onChange={(e) =>
                      setCampo("idPais", Number(e.target.value))
                    }
                    className="input h-11 w-full cursor-pointer !py-0"
                  >
                    <option value={0}>Seleccione un país</option>
                    {paises.map((pais) => (
                      <option key={pais.idParametro} value={pais.num1}>
                        {pais.string1}
                      </option>
                    ))}
                  </select>
                  {errores.idPais && (
                    <p className="text-red-400 text-xs px-1">{errores.idPais}</p>
                  )}

                  <div className="mt-1 flex">
                    <p className="flex w-24 items-center rounded-l-lg border-b border-l border-t border-gray-300 bg-gray-100 p-3 dark:border-slate-600 dark:bg-slate-700">
                      {prefijoDelPais(form.idPais) || "+00"}
                    </p>
                    <input
                      id="qt-celular"
                      type="tel"
                      autoComplete="tel-national"
                      value={form.celular}
                      onChange={(e) =>
                        setCampo("celular", e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full rounded-r-lg border border-gray-300 p-3 focus:border-[#4F46E5] focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                  {errores.celular && (
                    <p className="text-red-400 text-xs px-1">
                      {errores.celular}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Campo
                    id="qt-email"
                    label="Correo electrónico"
                    requerido
                    tipo="email"
                    valor={form.email}
                    error={errores.email}
                    onChange={(v) => setCampo("email", v)}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-5 flex shrink-0 justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={ocupado}
            className="btn btn-outline-gray mx-0 h-11"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={crear}
            disabled={!datosLeidos || ocupado}
            className={`mx-0 h-11 ${
              !datosLeidos || ocupado ? "btn btn-disabled" : "btn btn-primary"
            }`}
          >
            {creando ? "Creando…" : "Aceptar y crear talento"}
          </button>
        </div>
      </div>
    </div>,
    modalRoot,
  );
};
