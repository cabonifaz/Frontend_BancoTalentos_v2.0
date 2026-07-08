import { ReactNode, useMemo, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { Modal } from "./Modal";
import { useModal } from "../../context/ModalContext";
import { useParams } from "../../context/ParamsContext";
import { Loading } from "../ui/Loading";
import { MODAL_UPDATE_WITH_CV } from "../../utilities/modalsIds";
import { useFetchCVDiff } from "../../hooks/useFetchCVDiff";
import { IACVResponse } from "../../models/response/AICVResponse";
import { Param, TalentResponse } from "../../models";
import {
  addOrUpdateTalentEducation,
  addOrUpdateTalentExperience,
  addOrUpdateTalentLanguage,
  addTalentTechSkill,
  updateTalentDescription,
  updateTalentSocialMedia,
} from "../../services/apiService";

interface Props {
  idTalento?: number;
  talentDet?: TalentResponse;
  onUpdate?: (idTalento: number) => void;
}

type DiffData = IACVResponse["data"];
type DiffExp = NonNullable<DiffData["workExps"]>[number];
type Step = "upload" | "loading" | "review";

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
 * cambios nuevos/mejorados que el usuario confirme.
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
      setDiff(response.data);
      setEditableExps(response.data.workExps || []);
      setStep("review");
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Error al analizar el CV", {
        variant: "error",
      });
      setStep("upload");
    }
  };

  /** Total de cambios detectados por la IA. */
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

  const handleApply = async () => {
    if (!idTalento || !diff) return;

    // No permitir confirmar mientras existan errores de validación en alguna
    // experiencia seleccionada.
    if (hasBlockingExpErrors) {
      enqueueSnackbar(
        "Completa los campos requeridos de las experiencias antes de guardar",
        { variant: "warning" },
      );
      return;
    }

    const tasks: Promise<any>[] = [];

    // Habilidades técnicas — mismo comportamiento que "Nuevo Talento":
    // si la habilidad existe en el catálogo se asocia; si no existe, se envía con
    // idHabilidad=0 y el nombre para que el backend la CREE y luego la asocie.
    diff.tecSkills?.forEach((skill, i) => {
      if (!isSelected(`tec-${i}`) || !skill.nombreHabilidad) return;
      const idHabilidad =
        skill.idHabTec || findCatalogId(skill.nombreHabilidad, techCatalog);
      tasks.push(
        addTalentTechSkill({
          idTalento,
          idHabilidad: idHabilidad || 0,
          habilidad: skill.nombreHabilidad.toUpperCase(),
          anios: skill.aniosExperiencia ?? 0,
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

    // Educaciones (nuevas o mejoradas)
    diff.edExps?.forEach((edu, i) => {
      if (!isSelected(`edu-${i}`)) return;
      tasks.push(
        addOrUpdateTalentEducation({
          idTalento,
          ...(edu.idEducacion
            ? { idTalentoEducacion: edu.idEducacion }
            : {}),
          institucion: edu.nombreInstitucion || "",
          carrera: edu.carrera || "",
          grado: edu.grado || "",
          fechaInicio: edu.fechaInicio || "",
          fechaFin: edu.flActualidad === 1 ? "" : edu.fechaFin || "",
          flActualidad: edu.flActualidad === 1 ? 1 : 0,
          tipoFechaEducaciones: 1,
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
          <p className="text-sm text-[#71717A]">
            Sube un nuevo CV. La IA lo comparará con la información actual del
            talento y te propondrá únicamente la información nueva o mejorada.
          </p>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 hover:bg-gray-50">
            <img
              src="/assets/ic_upload.svg"
              alt="upload"
              className="h-8 w-8 opacity-60"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <span className="text-sm text-[#52525B]">
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
          <p className="text-center text-sm text-[#52525B]">
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
            <p className="py-8 text-center text-sm text-[#52525B]">
              La IA no encontró información nueva ni mejoras respecto a lo que ya
              está registrado.
            </p>
          ) : (
            <>
              <p className="text-sm text-[#71717A]">
                Revisa los cambios propuestos y desmarca los que no quieras
                aplicar.
              </p>

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

              <DiffSection
                title="Nuevas habilidades técnicas"
                items={diff.tecSkills || []}
                renderItem={(skill, i) => (
                  <SelectableRow
                    key={`tec-${i}`}
                    checked={isSelected(`tec-${i}`)}
                    onToggle={() => toggle(`tec-${i}`)}
                  >
                    <span className="text-sm font-medium">
                      {skill.nombreHabilidad}
                    </span>
                    {skill.aniosExperiencia ? (
                      <span className="ml-2 text-xs text-[#71717A]">
                        {skill.aniosExperiencia} año(s)
                      </span>
                    ) : null}
                  </SelectableRow>
                )}
              />

              {editableExps.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-semibold text-[#3f3f46]">
                    Experiencia laboral (nueva o mejorada)
                  </h4>
                  <p className="text-xs text-[#71717A]">
                    Revisa y corrige los datos detectados. Puedes completar
                    campos vacíos antes de guardar.
                  </p>
                  <div className="flex flex-col gap-3">
                    {editableExps.map((exp, i) => {
                      const isCurrent = exp.flActualidad === 1;
                      return (
                        <div
                          key={`exp-${i}`}
                          className="rounded-lg border border-gray-200 p-3"
                        >
                          <div className="mb-3 flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected(`exp-${i}`)}
                              onChange={() => toggle(`exp-${i}`)}
                              className="h-4 w-4 shrink-0"
                            />
                            <span className="text-xs text-[#71717A]">
                              Incluir esta experiencia
                            </span>
                            {exp.idExperiencia ? (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                                mejora
                              </span>
                            ) : (
                              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
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
                            <span className="text-sm text-[#52525B]">
                              Trabajo actual
                            </span>
                          </label>

                          <div className="mt-3 flex flex-col gap-1">
                            <label className="text-xs text-[#71717A]">
                              Funciones / Descripción
                            </label>
                            <textarea
                              value={exp.funciones || ""}
                              onChange={(e) =>
                                updateExp(i, { funciones: e.target.value })
                              }
                              rows={4}
                              placeholder="Describe las funciones y responsabilidades"
                              className="w-full resize-y rounded-lg border border-gray-300 p-2 text-sm focus:border-[#4F46E5] focus:outline-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <DiffSection
                title="Educación (nueva o mejorada)"
                items={diff.edExps || []}
                renderItem={(edu, i) => (
                  <SelectableRow
                    key={`edu-${i}`}
                    checked={isSelected(`edu-${i}`)}
                    onToggle={() => toggle(`edu-${i}`)}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {edu.carrera} · {edu.nombreInstitucion}
                        {edu.idEducacion ? (
                          <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                            mejora
                          </span>
                        ) : (
                          <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                            nueva
                          </span>
                        )}
                      </span>
                    </div>
                  </SelectableRow>
                )}
              />

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
                        <span className="ml-2 text-xs text-[#71717A]">
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
            </>
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
              disabled={changeCount === 0 || hasBlockingExpErrors}
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
      <h4 className="text-sm font-semibold text-[#3f3f46]">{title}</h4>
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
    <label className="text-xs text-[#71717A]">
      {label}
      {required && <span className="text-red-400"> *</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`h-10 rounded-lg border p-2 text-sm focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 ${
        error
          ? "border-red-400 focus:border-red-400"
          : "border-gray-300 focus:border-[#4F46E5]"
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
  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
    <input
      type="checkbox"
      checked={checked}
      onChange={onToggle}
      className="mt-1 h-4 w-4 shrink-0"
    />
    <div className="min-w-0 flex-1">{children}</div>
  </label>
);
