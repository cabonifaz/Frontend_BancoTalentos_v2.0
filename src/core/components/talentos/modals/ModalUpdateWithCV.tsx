import { Upload } from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { enqueueSnackbar } from "notistack";
import { Modal } from "../../modals/Modal";
import { useModal } from "../../../context/ModalContext";
import { useParams } from "../../../context/ParamsContext";
import { Loading } from "../../ui/Loading";
import { MODAL_UPDATE_WITH_CV } from "../../../utilities/modalsIds";
import { useFetchCVDiff } from "../../../hooks/talentos/useFetchCVDiff";
import { IACVResponse } from "../../../models/response/AICVResponse";
import { Param, TalentResponse } from "../../../models";
import { EducationsSection, TechSkillsSection } from "../..";
import { educationSchema, EducationFormData } from "./ModalEducation";
import { techSkillSchema, TechSkillFormData } from "./ModalTechSkills";
import { addOrUpdateTalentEducation, addOrUpdateTalentExperience, addOrUpdateTalentLanguage, addTalentTechSkill, updateTalentDescription, updateTalentSocialMedia } from "../../../services/talents.service";

interface Props {
  idTalento?: number;
  talentDet?: TalentResponse;
  onUpdate?: (idTalento: number) => void;
}

type DiffData = IACVResponse["data"];
type DiffExp = NonNullable<DiffData["workExps"]>[number];
type Step = "upload" | "loading" | "review";

/**
 * Formularios editables reutilizando los MISMOS componentes/validaciones del
 * módulo de detalle del talento:
 * - Habilidades técnicas: `TechSkillsSection` + `techSkillSchema`.
 * - Educación: `EducationsSection` + `educationSchema` (incluye el toggle
 *   "Año" / "Mes + Año" y su validación de fechas).
 * Se conservan `idEducacion` como campo passthrough para poder actualizar una
 * educación existente (mejora) en lugar de crear una nueva.
 */
type TechForm = { habilidadesTecnicas: TechSkillFormData[] };
type EduItem = EducationFormData & { idEducacion?: number | null };
type EduForm = { educaciones: EduItem[] };

/** Normaliza texto para comparar/matchear catálogos (sin tildes ni mayúsculas). */
const normalizeText = (text: string | null | undefined) =>
  (text || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Busca el id de un parámetro de catálogo (maestro) por su nombre. */
const findCatalogId = (name: string | null, catalog: Param[]) => {
  const target = normalizeText(name);
  return catalog?.find((p) => normalizeText(p.string1) === target)?.num1 ?? 0;
};

/**
 * Convierte una fecha `yyyy-MM-dd` (formato que devuelve la IA) al formato que
 * esperan los selectores de `EducationsSection`:
 * - modo 1 (solo año)  → "yyyy"
 * - modo 2 (mes + año) → "yyyy-MM"
 */
const toFormDate = (date: string | null | undefined, mode: number): string => {
  if (!date) return "";
  return mode === 2 ? date.substring(0, 7) : date.substring(0, 4);
};

type ExpErrors = {
  empresa?: string;
  puesto?: string;
  fechaInicio?: string;
  fechaFin?: string;
};

/**
 * Valida una experiencia laboral con las mismas reglas que `ModalExperience`
 * (empresa, puesto y fecha de inicio requeridas; fecha de fin requerida sólo si
 * no es el trabajo actual y debe ser mayor a la fecha de inicio).
 */
const validateExp = (exp: DiffExp): ExpErrors => {
  const errors: ExpErrors = {};
  if (!exp.nombreEmpresa || !exp.nombreEmpresa.trim())
    errors.empresa = "La empresa es requerida";
  if (!exp.puesto || !exp.puesto.trim())
    errors.puesto = "El puesto es requerido";
  if (!exp.fechaInicio || !exp.fechaInicio.trim())
    errors.fechaInicio = "La fecha de inicio es requerida";

  const isCurrent = exp.flActualidad === 1;
  if (!isCurrent) {
    if (!exp.fechaFin || !exp.fechaFin.trim()) {
      errors.fechaFin = "La fecha de fin es requerida";
    } else if (
      exp.fechaInicio &&
      new Date(exp.fechaFin) <= new Date(exp.fechaInicio)
    ) {
      errors.fechaFin = "La fecha de fin debe ser mayor a la fecha de inicio";
    }
  }
  return errors;
};

/**
 * Modal del "Analizador de Diferencias": permite subir un nuevo CV, compararlo
 * con la IA contra la información actual del talento y aplicar únicamente los
 * cambios nuevos/mejorados que el usuario confirme. Todas las secciones
 * (habilidades técnicas, experiencia y educación) son editables antes de guardar.
 */
export const ModalUpdateWithCV = ({
  idTalento,
  talentDet,
  onUpdate,
}: Props) => {
  const { isModalOpen, closeModal } = useModal();
  const { paramsByMaestro } = useParams();
  const { fetchCVDiff } = useFetchCVDiff();

  const techCatalog = paramsByMaestro[19] || [];

  const [step, setStep] = useState<Step>("upload");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [diff, setDiff] = useState<DiffData | null>(null);
  const [applying, setApplying] = useState(false);
  // Claves de los cambios deseleccionados (por defecto todo va seleccionado).
  const [unchecked, setUnchecked] = useState<Set<string>>(new Set());
  // Copia editable de las experiencias laborales: el usuario puede corregir/
  // completar cualquier campo antes de confirmar. Se aplica ESTA copia, no la
  // respuesta original de la IA.
  const [editableExps, setEditableExps] = useState<DiffExp[]>([]);

  // Formularios editables (reutilizan los componentes del módulo de detalle).
  // Los resolvers NO exigen mínimo de elementos: las secciones pueden quedar
  // vacías si el usuario elimina todo lo detectado por la IA.
  const techMethods = useForm<TechForm>({
    resolver: zodResolver(
      z.object({ habilidadesTecnicas: z.array(techSkillSchema) }),
    ) as any,
    defaultValues: { habilidadesTecnicas: [] },
    mode: "onChange",
  });
  const eduMethods = useForm<EduForm>({
    resolver: zodResolver(
      z.object({ educaciones: z.array(educationSchema) }),
    ) as any,
    defaultValues: { educaciones: [] },
    mode: "onChange",
  });

  // Suscripción a los valores de los formularios para habilitar/contar en vivo.
  const techItems = techMethods.watch("habilidadesTecnicas");
  const eduItems = eduMethods.watch("educaciones");

  const isSelected = (key: string) => !unchecked.has(key);
  const toggle = (key: string) =>
    setUnchecked((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const updateExp = (index: number, patch: Partial<DiffExp>) =>
    setEditableExps((prev) =>
      prev.map((exp, i) => (i === index ? { ...exp, ...patch } : exp)),
    );

  const reset = () => {
    setStep("upload");
    setCvFile(null);
    setFileError("");
    setDiff(null);
    setApplying(false);
    setUnchecked(new Set());
    setEditableExps([]);
    techMethods.reset({ habilidadesTecnicas: [] });
    eduMethods.reset({ educaciones: [] });
  };

  const handleClose = () => {
    reset();
    closeModal(MODAL_UPDATE_WITH_CV);
  };

  const handleFileChange = (file: File | null) => {
    setFileError("");
    if (file && !file.name.toLowerCase().endsWith(".pdf")) {
      setFileError("El archivo debe ser un PDF");
      setCvFile(null);
      return;
    }
    setCvFile(file);
  };

  const handleAnalyze = async () => {
    if (!idTalento) return;
    if (!cvFile) {
      setFileError("Suba un CV en formato PDF");
      return;
    }
    try {
      setStep("loading");
      const response = await fetchCVDiff(idTalento, cvFile);
      const data = response.data;
      setDiff(data);
      setEditableExps(data.workExps || []);

      // Sembrar el formulario de habilidades técnicas con lo detectado por la IA.
      techMethods.reset({
        habilidadesTecnicas: (data.tecSkills || []).map((s) => ({
          idHabilidad:
            s.idHabTec || findCatalogId(s.nombreHabilidad, techCatalog) || 0,
          habilidad: s.nombreHabilidad || "",
          anios: s.aniosExperiencia ?? 0,
        })),
      });

      // Sembrar el formulario de educación. La IA entrega fechas `yyyy-MM-dd`,
      // por lo que usamos el modo "solo año" (1) como predeterminado.
      eduMethods.reset({
        educaciones: (data.edExps || []).map((e) => ({
          institucion: e.nombreInstitucion || "",
          carrera: e.carrera || "",
          grado: e.grado || "",
          fechaInicio: toFormDate(e.fechaInicio, 1),
          fechaFin: e.flActualidad === 1 ? "" : toFormDate(e.fechaFin, 1),
          flActualidad: e.flActualidad === 1,
          tipoFechaEducaciones: 1,
          idEducacion: e.idEducacion ?? null,
        })),
      });

      setStep("review");
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Error al analizar el CV", {
        variant: "error",
      });
      setStep("upload");
    }
  };

  // Al entrar a la revisión, validar los formularios sembrados para que el
  // estado `isValid` refleje de inmediato si faltan campos requeridos.
  useEffect(() => {
    if (step === "review") {
      techMethods.trigger();
      eduMethods.trigger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  /** Total de cambios detectados por la IA (para el aviso "sin cambios"). */
  const changeCount = useMemo(() => {
    if (!diff) return 0;
    return (
      (diff.tecSkills?.length || 0) +
      (diff.workExps?.length || 0) +
      (diff.edExps?.length || 0) +
      (diff.langs?.length || 0) +
      (diff.presentacion ? 1 : 0) +
      (diff.social?.linkedin || diff.social?.github ? 1 : 0)
    );
  }, [diff]);

  /** Errores de validación por experiencia (mismas reglas que ModalExperience). */
  const expErrors = useMemo(
    () => editableExps.map(validateExp),
    [editableExps],
  );

  /** ¿Alguna experiencia SELECCIONADA tiene errores? Bloquea la confirmación. */
  const hasBlockingExpErrors = editableExps.some(
    (_, i) =>
      isSelected(`exp-${i}`) && Object.keys(expErrors[i]).length > 0,
  );

  // Idiomas/experiencias/otros seleccionados para saber si hay algo que aplicar.
  const selectedExpCount = editableExps.filter((_, i) =>
    isSelected(`exp-${i}`),
  ).length;
  const selectedLangCount = (diff?.langs || []).filter(
    (l, i) => isSelected(`lang-${i}`) && l.idIdioma,
  ).length;
  const presentacionSelected =
    !!diff?.presentacion && isSelected("presentacion");
  const socialSelected =
    !!(diff?.social?.linkedin || diff?.social?.github) && isSelected("social");

  const hasChangesToApply =
    (techItems?.length || 0) > 0 ||
    (eduItems?.length || 0) > 0 ||
    selectedExpCount > 0 ||
    selectedLangCount > 0 ||
    presentacionSelected ||
    socialSelected;

  const techValid = techMethods.formState.isValid;
  const eduValid = eduMethods.formState.isValid;

  const handleApply = async () => {
    if (!idTalento || !diff) return;

    // Validar los formularios editables antes de aplicar. No permitir confirmar
    // mientras existan errores de validación en cualquier sección editable.
    const [techOk, eduOk] = await Promise.all([
      techMethods.trigger(),
      eduMethods.trigger(),
    ]);
    if (!techOk || !eduOk || hasBlockingExpErrors) {
      enqueueSnackbar(
        "Corrige los campos requeridos antes de guardar los cambios",
        { variant: "warning" },
      );
      return;
    }

    const tasks: Promise<any>[] = [];

    // Habilidades técnicas — se envían los valores EDITADOS por el usuario.
    // Mismo comportamiento que "Nuevo Talento": si la habilidad existe en el
    // catálogo se asocia (idHabilidad>0); si no existe, se envía idHabilidad=0 y
    // el nombre para que el backend la CREE y luego la asocie.
    (techMethods.getValues("habilidadesTecnicas") || []).forEach((skill) => {
      const name = (skill.habilidad || "").trim();
      if (!name) return;
      tasks.push(
        addTalentTechSkill({
          idTalento,
          idHabilidad: skill.idHabilidad || 0,
          habilidad: name.toUpperCase(),
          anios: skill.anios ?? 0,
        }),
      );
    });

    // Nota: las habilidades blandas (softSkills) se excluyen a propósito del
    // proceso de actualización con IA (la IA ya no las devuelve).

    // Experiencias (nuevas o mejoradas: si trae idExperiencia se actualiza).
    // Se usan los valores EDITADOS por el usuario, no la respuesta original de la IA.
    editableExps.forEach((exp, i) => {
      if (!isSelected(`exp-${i}`)) return;
      tasks.push(
        addOrUpdateTalentExperience({
          idTalento,
          ...(exp.idExperiencia
            ? { idExperiencia: exp.idExperiencia }
            : {}),
          empresa: exp.nombreEmpresa || "",
          puesto: exp.puesto || "",
          funciones: exp.funciones || "",
          fechaInicio: exp.fechaInicio || "",
          fechaFin: exp.flActualidad === 1 ? "" : exp.fechaFin || "",
          flActualidad: exp.flActualidad === 1 ? 1 : 0,
        }),
      );
    });

    // Educaciones — se envían los valores EDITADOS con la misma lógica de fechas
    // de `ModalEducation` (modo año → yyyy-01-01 / yyyy-12-31; modo mes+año → yyyy-MM-01).
    (eduMethods.getValues("educaciones") || []).forEach((edu) => {
      const isMonthYear = (edu.tipoFechaEducaciones ?? 1) === 2;
      tasks.push(
        addOrUpdateTalentEducation({
          idTalento,
          ...(edu.idEducacion
            ? { idTalentoEducacion: edu.idEducacion }
            : {}),
          institucion: edu.institucion,
          carrera: edu.carrera,
          grado: edu.grado,
          fechaInicio: isMonthYear
            ? `${edu.fechaInicio}-01`
            : `${edu.fechaInicio}-01-01`,
          fechaFin: edu.flActualidad
            ? ""
            : isMonthYear
              ? `${edu.fechaFin}-01`
              : `${edu.fechaFin}-12-31`,
          flActualidad: edu.flActualidad ? 1 : 0,
          tipoFechaEducaciones: edu.tipoFechaEducaciones ?? 1,
        }),
      );
    });

    // Idiomas (nuevos o mejorados)
    diff.langs?.forEach((lang, i) => {
      if (!isSelected(`lang-${i}`) || !lang.idIdioma) return;
      tasks.push(
        addOrUpdateTalentLanguage({
          idTalento,
          ...(lang.idTalentoIdioma
            ? { idTalentoIdioma: lang.idTalentoIdioma }
            : {}),
          idIdioma: lang.idIdioma,
          idNivel: lang.idNivel,
          estrellas: lang.estrellas,
        }),
      );
    });

    // Presentación mejorada
    if (diff.presentacion && isSelected("presentacion")) {
      tasks.push(
        updateTalentDescription({
          idTalento,
          descripcion: diff.presentacion,
        }),
      );
    }

    // Redes sociales (se combina con lo existente)
    if (
      (diff.social?.linkedin || diff.social?.github) &&
      isSelected("social")
    ) {
      tasks.push(
        updateTalentSocialMedia({
          idTalento,
          linkedin: diff.social.linkedin || talentDet?.linkedin || "",
          github: diff.social.github || talentDet?.github || "",
        }),
      );
    }

    if (tasks.length === 0) {
      enqueueSnackbar("No hay cambios seleccionados para aplicar", {
        variant: "info",
      });
      return;
    }

    try {
      setApplying(true);
      const results = await Promise.allSettled(tasks);
      const failed = results.filter(
        (r) =>
          r.status === "rejected" ||
          (r.status === "fulfilled" && r.value?.data?.idMensaje !== 2),
      ).length;
      const succeeded = results.length - failed;

      if (succeeded > 0) {
        enqueueSnackbar(`${succeeded} cambio(s) aplicado(s) correctamente`, {
          variant: "success",
        });
      }
      if (failed > 0) {
        enqueueSnackbar(`${failed} cambio(s) no se pudieron aplicar`, {
          variant: "error",
        });
      }

      if (onUpdate && idTalento) onUpdate(idTalento);
      handleClose();
    } catch {
      enqueueSnackbar("Ocurrió un error al aplicar los cambios", {
        variant: "error",
      });
      setApplying(false);
    }
  };

  if (!isModalOpen(MODAL_UPDATE_WITH_CV)) return null;

  return (
    <Modal
      id={MODAL_UPDATE_WITH_CV}
      title="Actualizar con CV"
      showButtonOptions={false}
      onClose={handleClose}
    >
      {applying && <Loading opacity="opacity-60" />}

      {/* Paso 1: subir CV */}
      {step === "upload" && (
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-sm text-[#71717A] dark:text-slate-400">
            Sube un nuevo CV. La IA lo comparará con la información actual del
            talento y te propondrá únicamente la información nueva o mejorada.
          </p>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 hover:bg-gray-50 dark:border-slate-600 dark:hover:bg-slate-700">
            <Upload className="h-8 w-8 opacity-60" />
            <span className="text-sm text-[#52525B] dark:text-slate-300">
              {cvFile ? cvFile.name : "Selecciona un archivo PDF"}
            </span>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) =>
                handleFileChange(e.target.files?.[0] || null)
              }
            />
          </label>
          {fileError && (
            <p className="text-sm text-red-500">{fileError}</p>
          )}
          <div className="mt-2 flex gap-4 *:px-4 *:py-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex w-1/2 items-center justify-center font-semibold btn btn-outline-gray"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!cvFile}
              className="flex w-1/2 items-center justify-center font-semibold btn btn-primary disabled:opacity-50"
            >
              Analizar con IA
            </button>
          </div>
        </div>
      )}

      {/* Paso 2: analizando */}
      {step === "loading" && (
        <div className="my-10 flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <p className="text-center text-sm text-[#52525B] dark:text-slate-300">
            Comparando el CV con la información actual del talento…
            <br />
            Esto puede tardar unos momentos.
          </p>
        </div>
      )}

      {/* Paso 3: revisión y confirmación */}
      {step === "review" && diff && (
        <div className="mt-4 flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          {changeCount === 0 ? (
            <p className="rounded-lg bg-gray-50 p-3 text-sm text-[#52525B] dark:bg-slate-800 dark:text-slate-300">
              La IA no encontró información nueva ni mejoras respecto a lo que ya
              está registrado. Puedes agregar información manualmente si lo
              deseas.
            </p>
          ) : (
            <p className="text-sm text-[#71717A] dark:text-slate-400">
              Revisa y corrige la información propuesta. Puedes editar los
              campos, agregar o eliminar elementos, y desmarcar lo que no quieras
              aplicar.
            </p>
          )}

          <DiffSection
            title="Presentación mejorada"
            items={diff.presentacion ? [diff.presentacion] : []}
            renderItem={() => (
              <SelectableRow
                checked={isSelected("presentacion")}
                onToggle={() => toggle("presentacion")}
              >
                <p className="whitespace-pre-line text-sm">
                  {diff.presentacion}
                </p>
              </SelectableRow>
            )}
          />

          {/* Habilidades técnicas — editable (mismo componente que el detalle). */}
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-semibold text-[#3f3f46] dark:text-slate-200">
              Habilidades técnicas
            </h4>
            <p className="text-xs text-[#71717A] dark:text-slate-400">
              Corrige el nombre o los años, elimina las que no correspondan o
              agrega nuevas antes de guardar.
            </p>
            <FormProvider {...techMethods}>
              <TechSkillsSection
                control={techMethods.control}
                errors={techMethods.formState.errors}
                habilidadesTecnicas={techCatalog}
                dropdownWithSearch={true}
                shouldShowEmptyForm={false}
                shouldAddElements={true}
                itemVariant="card"
              />
            </FormProvider>
          </div>

          {editableExps.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-[#3f3f46] dark:text-slate-200">
                Experiencia laboral (nueva o mejorada)
              </h4>
              <p className="text-xs text-[#71717A] dark:text-slate-400">
                Revisa y corrige los datos detectados. Puedes completar campos
                vacíos antes de guardar.
              </p>
              <div className="flex flex-col gap-3">
                {editableExps.map((exp, i) => {
                  const isCurrent = exp.flActualidad === 1;
                  return (
                    <div
                      key={`exp-${i}`}
                      className="rounded-lg border border-gray-200 p-3 dark:border-slate-700"
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected(`exp-${i}`)}
                          onChange={() => toggle(`exp-${i}`)}
                          className="h-4 w-4 shrink-0"
                        />
                        <span className="text-xs text-[#71717A] dark:text-slate-400">
                          Incluir esta experiencia
                        </span>
                        {exp.idExperiencia ? (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                            mejora
                          </span>
                        ) : (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                            nueva
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <FieldInput
                          label="Empresa"
                          required
                          value={exp.nombreEmpresa || ""}
                          onChange={(v) =>
                            updateExp(i, { nombreEmpresa: v })
                          }
                          placeholder="Nombre de la empresa"
                          error={expErrors[i].empresa}
                        />
                        <FieldInput
                          label="Puesto"
                          required
                          value={exp.puesto || ""}
                          onChange={(v) => updateExp(i, { puesto: v })}
                          placeholder="Cargo o puesto"
                          error={expErrors[i].puesto}
                        />
                        <FieldInput
                          label="Fecha de inicio"
                          required
                          type="date"
                          value={exp.fechaInicio || ""}
                          onChange={(v) =>
                            updateExp(i, { fechaInicio: v })
                          }
                          error={expErrors[i].fechaInicio}
                        />
                        <FieldInput
                          label="Fecha de fin"
                          required={!isCurrent}
                          type="date"
                          value={isCurrent ? "" : exp.fechaFin || ""}
                          disabled={isCurrent}
                          onChange={(v) => updateExp(i, { fechaFin: v })}
                          error={isCurrent ? undefined : expErrors[i].fechaFin}
                        />
                      </div>

                      <label className="mt-3 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isCurrent}
                          onChange={(e) =>
                            updateExp(i, {
                              flActualidad: e.target.checked ? 1 : 0,
                              ...(e.target.checked
                                ? { fechaFin: null }
                                : {}),
                            })
                          }
                          className="h-4 w-4"
                        />
                        <span className="text-sm text-[#52525B] dark:text-slate-300">
                          Trabajo actual
                        </span>
                      </label>

                      <div className="mt-3 flex flex-col gap-1">
                        <label className="text-xs text-[#71717A] dark:text-slate-400">
                          Funciones / Descripción
                        </label>
                        <textarea
                          value={exp.funciones || ""}
                          onChange={(e) =>
                            updateExp(i, { funciones: e.target.value })
                          }
                          rows={4}
                          placeholder="Describe las funciones y responsabilidades"
                          className="w-full resize-y rounded-lg border border-gray-300 p-2 text-sm focus:border-[#4F46E5] focus:outline-none dark:border-slate-600"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Educación — editable reutilizando EducationsSection (mismo UX/validación). */}
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-semibold text-[#3f3f46] dark:text-slate-200">Educación</h4>
            <p className="text-xs text-[#71717A] dark:text-slate-400">
              Corrige institución, carrera, grado y fechas (año o mes + año),
              elimina o agrega estudios antes de guardar.
            </p>
            <FormProvider {...eduMethods}>
              <EducationsSection
                control={eduMethods.control}
                errors={eduMethods.formState.errors}
                shouldShowEmptyForm={false}
                shouldAddElements={true}
                itemVariant="card"
              />
            </FormProvider>
          </div>

          <DiffSection
            title="Idiomas (nuevos o mejorados)"
            items={diff.langs || []}
            renderItem={(lang, i) => (
              <SelectableRow
                key={`lang-${i}`}
                checked={isSelected(`lang-${i}`)}
                onToggle={() => toggle(`lang-${i}`)}
              >
                <span className="text-sm font-medium">
                  {lang.nombreIdioma}
                  {lang.nivelIdioma ? (
                    <span className="ml-2 text-xs text-[#71717A] dark:text-slate-400">
                      {lang.nivelIdioma}
                    </span>
                  ) : null}
                </span>
              </SelectableRow>
            )}
          />

          {(diff.social?.linkedin || diff.social?.github) && (
            <DiffSection
              title="Redes sociales"
              items={[diff.social]}
              renderItem={(social) => (
                <SelectableRow
                  checked={isSelected("social")}
                  onToggle={() => toggle("social")}
                >
                  <div className="flex flex-col text-sm">
                    {social.linkedin && (
                      <span>LinkedIn: {social.linkedin}</span>
                    )}
                    {social.github && (
                      <span>GitHub: {social.github}</span>
                    )}
                  </div>
                </SelectableRow>
              )}
            />
          )}

          <div className="mt-2 flex gap-4 *:px-4 *:py-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex w-1/2 items-center justify-center font-semibold btn btn-outline-gray"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={
                applying ||
                !hasChangesToApply ||
                hasBlockingExpErrors ||
                !techValid ||
                !eduValid
              }
              className="flex w-1/2 items-center justify-center font-semibold btn btn-primary disabled:opacity-50"
            >
              Aplicar cambios
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

/** Sección de la revisión: sólo se muestra si tiene elementos. */
const DiffSection = <T,>({
  title,
  items,
  renderItem,
}: {
  title: string;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
}) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-semibold text-[#3f3f46] dark:text-slate-200">{title}</h4>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => renderItem(item, i))}
      </div>
    </div>
  );
};

/** Input etiquetado reutilizable para el formulario editable de experiencias. */
const FieldInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs text-[#71717A] dark:text-slate-400">
      {label}
      {required && <span className="text-red-400"> *</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`h-10 rounded-lg border p-2 text-sm focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 dark:border-slate-700 ${
        error
          ? "border-red-400 focus:border-red-400"
          : "border-gray-300 focus:border-[#4F46E5] dark:border-slate-600"
      }`}
    />
    {error && <p className="text-red-400 text-sm">{error}</p>}
  </div>
);

/** Fila con checkbox para seleccionar/deseleccionar un cambio propuesto. */
const SelectableRow = ({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: ReactNode;
}) => (
  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700">
    <input
      type="checkbox"
      checked={checked}
      onChange={onToggle}
      className="mt-1 h-4 w-4 shrink-0"
    />
    <div className="min-w-0 flex-1">{children}</div>
  </label>
);
