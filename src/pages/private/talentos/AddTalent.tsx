import { useNavigate } from "react-router-dom";
import { Dashboard } from "@/pages/private/Dashboard";
import { useState, useRef, useEffect } from "react";
import {
  EducationsSection,
  ExperiencesSection,
  FileInput,
  LanguagesSection,
  Loading,
  SoftSkillsSection,
  TechSkillsSection,
} from "@/core/components";
import {
  AddTalentParams,
  BaseResponse,
  initialFormValues,
} from "@/core/models";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "@/core/context/ParamsContext";
import {
  AddTalentSchema,
  AddTalentType,
} from "@/core/models/schemas/AddTalentSchema";
import { Utils } from "@/core/utilities/utils";
import { enqueueSnackbar } from "notistack";
import { useApi } from "@/core/hooks/useApi";
import {
  handleError,
  handleResponse,
} from "@/core/utilities/errorHandler";
import { addTalent } from "@/core/services/talents.service";
import {
  ARCHIVO_IMAGEN,
  ARCHIVO_PDF,
  DOCUMENTO_CV,
  DOCUMENTO_FOTO_PERFIL,
  FRASES_IA_MAESTRO,
  PROCEDENCIA_OPTIONS,
  TIPO_MODALIDAD,
} from "@/core/utilities/constants";
import { validateFile } from "@/core/utilities/validation";
import { SalaryExpectSection } from "@/core/components/talentos/SalaryExpectSection";
import { useFetchCVData } from "@/core/hooks/talentos/useFetchCVData";
import { useAutoCompletTalForm } from "@/core/hooks/talentos/useAutoCompletTalFormt";
import { useModal } from "@/core/context/ModalContext";
import { MODAL_AI_WORKING } from "@/core/utilities/modalsIds";
import { ModalWorkingAI } from "@/core/components/modals/ModalWorkingAI";
import { processText } from "@/core/utilities/textUtils";
import { useFormPersistence } from "@/core/hooks/talentos/useFormPersistence";
import { FORM_STORAGE_KEY } from "@/core/utilities/constants";
import { Button } from "@/core/components/ui/shadcn/button";
import { Input } from "@/core/components/ui/shadcn/input";
import { Textarea } from "@/core/components/ui/shadcn/textarea";
import { Checkbox } from "@/core/components/ui/shadcn/checkbox";
import { Label } from "@/core/components/ui/shadcn/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/core/components/ui/shadcn/radio-group";
import { AppSelect } from "@/core/components/ui/AppSelect";

const selectClass =
  "h-auto p-3 text-[#3f3f46] dark:border-slate-700 dark:text-slate-200";
const socialInputClass = "h-12 border-gray-300 dark:border-slate-600";

export const AddTalent = () => {
  const navigate = useNavigate();
  const { paramsByMaestro, refetchParams } = useParams();
  const countryCode = useRef<HTMLParagraphElement>(null);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [cvFileErrors, setCvFileErrors] = useState("");
  const [fotoFileErrors, setFotoFileErrors] = useState("");

  const paises = paramsByMaestro[12] || [];
  const ciudades = paramsByMaestro[13] || [];
  const monedas = paramsByMaestro[2] || [];
  // Maestro 3: modalidad de facturación del talento (planilla, locación de
  // servicios, prácticas). Es el mismo catálogo que usa el Modal de Ingreso.
  const modalidadesFacturacion = paramsByMaestro[TIPO_MODALIDAD] || [];
  const habilidadesTecnicas = paramsByMaestro[19] || [];
  const habilidadesBlandas = paramsByMaestro[20] || [];
  const idiomas = paramsByMaestro[15] || [];
  const nivelesIdioma = paramsByMaestro[16] || [];
  const disponibilidades = paramsByMaestro[31] || [];
  const frasesIa = paramsByMaestro[FRASES_IA_MAESTRO] || [];

  const { loading: loadingAddTalent, fetch: postTalent } = useApi<
    BaseResponse,
    AddTalentParams
  >(addTalent, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) => {
      handleResponse({
        response: response,
        showSuccessMessage: true,
        enqueueSnackbar: enqueueSnackbar,
      });

      if (response.data.idMensaje === 2) {
        reset(initialFormValues);

        // Restablecer los archivos
        setCvFile(null);
        setFotoFile(null);

        //para limpiar el storage
        clearStorage();

        // refrescar parametros para futuros registros
        refetchParams();
      }
    },
  });

  const onGoBackClick = () => navigate(-1);

  const methods = useForm<AddTalentType>({
    resolver: zodResolver(AddTalentSchema),
    mode: "onChange",
    defaultValues: initialFormValues,
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = methods;

  // Auto-guardado del formulario
  const watchedValues = watch();
  const { clearStorage, saveFiles, loadFiles } = useFormPersistence(
    watchedValues,
    setValue,
    ["cv", "foto"],
    reset,
  );

  const watchCountryPhone = watch("codigoPais");
  const watchCountry = watch("idPais");
  // const watchCity = watch("idCiudad");

  const ciudadesFiltradas = watchCountry
    ? ciudades.filter((ciudad: any) => ciudad.num2 === watchCountry)
    : [];

  // Cargar archivos guardados al montar
  useEffect(() => {
    const { cv, foto } = loadFiles();
    if (cv) {
      setCvFile(cv);
      // Crear FileList para react-hook-form
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(cv);
      setValue("cv", dataTransfer.files as any);
    }
    if (foto) {
      setFotoFile(foto);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(foto);
      setValue("foto", dataTransfer.files as any);
    }
  }, [setValue, loadFiles]);

  const onSubmit: SubmitHandler<AddTalentType> = async (data) => {
    setCvFileErrors("");
    setFotoFileErrors("");

    // Validación manual
    if (!data.cv[0] || !(data.cv[0] instanceof File)) {
      setCvFileErrors("El CV es requerido");
      return;
    }
    if (!data.cv[0].name.endsWith(".pdf")) {
      setCvFileErrors("El CV debe ser un archivo PDF");
      return;
    }

    // Validación manual de foto
    const photoFile = data.foto?.[0];
    if (photoFile && photoFile instanceof File) {
      const { isValid } = validateFile(photoFile, [
        "png",
        "jpeg",
        "jpg",
      ]);
      if (!isValid) {
        setFotoFileErrors(
          "La foto debe ser un archivo PNG, JPEG o JPG",
        );
        return;
      }
    }

    setFotoFileErrors("");

    const {
      /*  montoInicial,
      montoFinal, */
      codigoPais,
      telefono,
      experiencias,
      educaciones,
      cv,
      foto,
      disponibilidad,
      salaryExpectations,
      ...filterData
    } = data;
    const phone =
      countryCode.current?.textContent + " " + telefono.trim();

    const cleanExperiencias = experiencias.map((exp) => ({
      ...exp,
      flActualidad: exp.flActualidad ? 1 : 0,
      fechaFin: exp.flActualidad ? null : exp.fechaFin,
    }));

    const cleanEducaciones = educaciones.map((edu) => {
      const isMonthYear = (edu.tipoFechaEducaciones ?? 1) === 2;
      return {
        ...edu,
        flActualidad: edu.flActualidad ? 1 : 0,
        fechaInicio: isMonthYear
          ? `${edu.fechaInicio}-01`
          : `${edu.fechaInicio}-01-01`,
        fechaFin: edu.flActualidad
          ? null
          : edu.fechaFin
            ? isMonthYear
              ? `${edu.fechaFin}-01`
              : `${edu.fechaFin}-12-31`
            : null,
      };
    });

    try {
      const cvBase64 = await Utils.fileToBase64(cvFile!);
      const fotoBase64 = photoFile
        ? await Utils.fileToBase64(fotoFile!)
        : undefined;

      const cleanData: AddTalentParams = {
        disponibilidad: data.disponibilidad?.join(","),
        telefono: phone,

        idMonedaPlan: salaryExpectations?.planilla?.coin,
        idMonedaRxh: salaryExpectations?.rxh?.coin,
        montoInicialPlanilla: salaryExpectations?.planilla?.min,
        montoFinalPlanilla: salaryExpectations?.planilla?.max,
        montoInicialRxH: salaryExpectations?.rxh?.min,
        montoFinalRxH: salaryExpectations?.rxh?.max,
        idMoneda: null,

        ...filterData,
        experiencias: cleanExperiencias,
        educaciones: cleanEducaciones,
        cvArchivo: {
          stringB64: cvBase64,
          nombreArchivo: Utils.getFileNameWithoutExtension(
            cvFile?.name,
          ),
          extensionArchivo: "pdf",
          idTipoArchivo: ARCHIVO_PDF,
          idTipoDocumento: DOCUMENTO_CV,
        },
        fotoArchivo: fotoBase64
          ? {
              stringB64: fotoBase64,
              nombreArchivo: Utils.getFileNameWithoutExtension(
                fotoFile?.name,
              ),
              extensionArchivo:
                Utils.detectarFormatoDesdeBase64(fotoBase64),
              idTipoArchivo: ARCHIVO_IMAGEN,
              idTipoDocumento: DOCUMENTO_FOTO_PERFIL,
            }
          : undefined,
      };

      postTalent(cleanData);
    } catch (error) {
      enqueueSnackbar("error al cargar archivos", {
        variant: "warning",
      });
    }
  };

  // file
  const handleFileChange = async (
    field: keyof AddTalentType,
    file: File | null,
  ) => {
    if (field === "cv") {
      setCvFile(file);
      setCvFileErrors("");
    } else if (field === "foto") {
      setFotoFile(file);
      setFotoFileErrors("");
    }
    // Guardar archivos inmediatamente
    await saveFiles(
      field === "cv" ? file : cvFile,
      field === "foto" ? file : fotoFile,
    );
  };

  const { isModalOpen, openModal, closeModal } = useModal();

  /** Analize CV with IA */
  const { fetchCVDetails } = useFetchCVData();
  const { completeForm, idCiudad } = useAutoCompletTalForm();
  const [canClose, setCanClose] = useState(false);
  const [canCloseMessage, setCanCloseMessage] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (idCiudad) {
      setValue("idCiudad", idCiudad);
    }
  }, [idCiudad, setValue]);

  const handleAnalize = async () => {
    if (!cvFile) {
      enqueueSnackbar("Por favor, suba un CV para analizar", {
        variant: "warning",
      });
      return;
    }

    try {
      setCanClose(false);
      setCanCloseMessage(undefined);
      openModal(MODAL_AI_WORKING);

      // Extract data using backend service
      const cvDetails = await fetchCVDetails(cvFile);

      cvDetails.data.edExps?.forEach((edu) => {
        edu.fechaInicio = edu.fechaInicio?.slice(0, 4) || "";
        edu.fechaFin = edu.fechaFin?.slice(0, 4) || "";
      });

      completeForm(
        cvDetails,
        setValue,
        paises,
        ciudades,
        habilidadesTecnicas,
      );

      setTimeout(() => {
        const formData = watch();
        localStorage.setItem(
          FORM_STORAGE_KEY,
          JSON.stringify(formData),
        );
      }, 2000);

      setCanCloseMessage(
        "Formulario completado, revise los campos antes de enviar",
      );
    } catch (error: any) {
      setCanCloseMessage(error?.message || "Error al analizar el CV");
    } finally {
      setCanClose(true);
    }
  };

  return (
    <FormProvider {...methods}>
      <Dashboard>
        {loadingAddTalent && <Loading opacity="opacity-50" />}
        {isModalOpen(MODAL_AI_WORKING) && (
          <ModalWorkingAI
            randomPhrases={frasesIa}
            canCloseMessage={canCloseMessage}
            canClose={canClose}
            onClose={() => {
              closeModal(MODAL_AI_WORKING);
              setCanClose(false);
            }}
          />
        )}
        {/* main container */}
        <div className="flex h-full justify-center overflow-hidden">
          {/* form container */}
          <div className="rounded-lg border flex min-h-0 flex-col shadow-lg dark:border-slate-700">
            {/* form */}
            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* title */}
              <div className="flex shrink-0 p-4 bg-white w-full md:w-[39.9rem] z-10 border-b rounded-t-lg border-gray-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                <div className="flex flex-col gap-1 text-[#3f3f46] w-1/2 dark:text-slate-200">
                  <h2 className="font-semibold text-xl">
                    Nuevo Talento
                  </h2>
                  <h3 className="text-sm">
                    Ingresa datos del talento.
                  </h3>
                </div>
                <div className="flex justify-end gap-3 *:py-3 *:px-4 *:h-fit w-1/2">
                  <Button
                    onClick={() => {
                      reset(initialFormValues);
                      setCvFile(null);
                      setCvFileErrors("");
                      setFotoFile(null);
                      setFotoFileErrors("");
                      clearStorage();
                    }}
                    className="bg-red-600 text-base font-medium text-white shadow-md transition-all duration-200 hover:bg-red-700 hover:shadow-lg focus-visible:ring-red-400 focus-visible:ring-offset-2"
                  >
                    Limpiar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onGoBackClick}
                    className="border-[#3b82f6] text-base text-[#3b82f6] hover:bg-[#f5f9ff] dark:hover:bg-sky-500/10"
                  >
                    Volver
                  </Button>
                  <Button type="submit" className="text-base">
                    Guardar
                  </Button>
                </div>
              </div>
              {/* `relative` es imprescindible: Checkbox, Select, RadioGroup y
                  Switch de Radix dejan dentro del <form> un input nativo oculto
                  con position: absolute. Sin un contenedor posicionado, esos
                  inputs se salen del scroll y alargan la página con un gran
                  espacio en blanco debajo del recuadro. */}
              <div className="relative min-h-0 flex-1 px-8 pt-6 overflow-y-auto w-full md:w-[40rem]">
                {/* files */}
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-[#3f3f46] text-lg dark:text-slate-200">
                      Curriculum Vitae
                      <span className="text-red-500">*</span>
                    </h3>
                    {cvFile && (
                      <button
                        className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                        type="button"
                        onClick={handleAnalize}
                      >
                        Completar con IA
                      </button>
                    )}
                  </div>

                  <FileInput<AddTalentType>
                    register={register}
                    errors={errors}
                    name="cv"
                    initialText="Sube un archivo"
                    acceptedTypes=".pdf"
                    onChange={(file) => handleFileChange("cv", file)}
                    value={cvFile}
                  />
                  {cvFileErrors !== "" && (
                    <p className="text-red-400 text-sm">
                      {cvFileErrors}
                    </p>
                  )}
                  <h3 className="text-[#3f3f46] text-lg dark:text-slate-200">
                    Foto de perfil
                  </h3>
                  <FileInput<AddTalentType>
                    register={register}
                    errors={errors}
                    name="foto"
                    initialText="Sube una foto"
                    acceptedTypes=".png, .jpeg, .jpg"
                    onChange={(file) =>
                      handleFileChange("foto", file)
                    }
                    value={fotoFile}
                  />
                  {fotoFileErrors !== "" && (
                    <p className="text-red-400 text-sm">
                      {fotoFileErrors}
                    </p>
                  )}
                </div>
                {/* Data */}
                <div className="*:mb-4">
                  <h3 className="text-[#3f3f46] text-lg my-5 font-semibold dark:text-slate-200">
                    Datos
                  </h3>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="dni"
                      className="text-[#636d7c] text-sm px-1 dark:text-slate-400"
                    >
                      Doc. Identidad
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register("dni")}
                      id="dni"
                      type="text"
                      placeholder="Doc. Identidad"
                    />
                    {errors.dni && (
                      <p className="text-red-400 text-sm">
                        {errors.dni.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="name"
                      className="text-[#636d7c] text-sm px-1 dark:text-slate-400"
                    >
                      Nombres<span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register("nombres")}
                      id="name"
                      type="text"
                      placeholder="Nombres"
                    />
                    {errors.nombres && (
                      <p className="text-red-400 text-sm">
                        {errors.nombres.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="lastname-f"
                      className="text-[#636d7c] text-sm px-1 dark:text-slate-400"
                    >
                      Apellido paterno
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register("apellidoPaterno")}
                      id="lastname-f"
                      type="text"
                      placeholder="Apellido paterno"
                    />
                    {errors.apellidoPaterno && (
                      <p className="text-red-400 text-sm">
                        {errors.apellidoPaterno.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="lastname-s"
                      className="text-[#636d7c] text-sm px-1 dark:text-slate-400"
                    >
                      Apellido materno
                    </label>
                    <Input
                      {...register("apellidoMaterno")}
                      id="lastname-s"
                      type="text"
                      placeholder="Apellido materno"
                    />
                    {errors.apellidoMaterno && (
                      <p className="text-red-400 text-sm">
                        {errors.apellidoMaterno.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="countrycode"
                      className="text-[#636d7c] text-sm px-1 dark:text-slate-400"
                    >
                      Número de Celular
                      <span className="text-red-500">*</span>
                    </label>
                    {/* Los selects de este formulario iban con register y
                        valueAsNumber: el Select de Radix va con Controller y
                        entrega el mismo número (0 = sin elegir). */}
                    <Controller
                      name="codigoPais"
                      control={control}
                      render={({ field }) => (
                        <AppSelect
                          ref={field.ref}
                          id="countrycode"
                          name={field.name}
                          onBlur={field.onBlur}
                          value={field.value}
                          onChange={(v) =>
                            field.onChange(v === "" ? 0 : Number(v))
                          }
                          options={paises.map((pais) => ({
                            value: pais.num1,
                            label: pais.string1,
                          }))}
                          placeholder="Seleccione un país"
                          className={selectClass}
                        />
                      )}
                    />
                    {errors.codigoPais && (
                      <p className="text-red-400 text-sm">
                        {errors.codigoPais.message}
                      </p>
                    )}

                    <div className="flex">
                      <p
                        ref={countryCode}
                        className="rounded-l-lg border-l border-t border-b p-3 border-gray-300 bg-gray-100 flex items-center w-24 dark:border-slate-600 dark:bg-slate-700"
                      >
                        {watchCountryPhone
                          ? `${
                              paises.find(
                                (p) => p.num1 === watchCountryPhone,
                              )?.string3 || "00"
                            }`
                          : "+00"}
                      </p>
                      <Input
                        {...register("telefono")}
                        id="phone"
                        type="tel"
                        autoComplete="tel-national"
                        aria-label="Número de celular"
                        className="rounded-l-none border-gray-300 dark:border-slate-600"
                      />
                    </div>
                    {errors.telefono && (
                      <p className="text-red-400 text-sm">
                        {errors.telefono.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="email"
                      className="text-[#636d7c] text-sm px-1 dark:text-slate-400"
                    >
                      Correo electrónico
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register("email")}
                      type="email"
                      id="email"
                      placeholder="Correo electrónico"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center px-1">
                      <label
                        htmlFor="description"
                        className="text-[#636d7c] text-sm dark:text-slate-400"
                      >
                        Presentación
                      </label>
                      {/* CONTADOR DE CARACTERES */}
                      <span
                        className={`text-xs font-semibold ${(watch("descripcion")?.length ?? 0) > 5000 ? "text-red-500" : "text-gray-500 dark:text-slate-400"}`}
                      >
                        {watch("descripcion")?.length || 0} / 5000
                      </span>
                    </div>
                    <Controller
                      name="descripcion"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          id="description"
                          className="resize-none h-24"
                          placeholder="Cuéntanos sobre este talento..."
                          onBlur={(e) => {
                            const {
                              text,
                              wasSanitized,
                              wasTruncated,
                            } = processText(e.target.value, 5000);

                            if (text !== e.target.value) {
                              field.onChange(text);

                              if (wasTruncated) {
                                enqueueSnackbar(
                                  "La presentación se interrumpió a los 5.000 caracteres",
                                  { variant: "warning" },
                                );
                              } else if (wasSanitized) {
                                enqueueSnackbar(
                                  "Se limpiaron caracteres especiales de la presentación",
                                  { variant: "info" },
                                );
                              }
                            }

                            field.onBlur();
                          }}
                        />
                      )}
                    />
                    {errors.descripcion && (
                      <p className="text-red-400 text-sm">
                        {errors.descripcion.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[#636d7c] text-sm px-1 dark:text-slate-400">
                      Disponibilidad{" "}
                      <span className="text-red-400">*</span>
                    </label>

                    {/* Con register, el grupo de checkboxes guardaba un array
                        de strings (el `value` de cada uno); se mantiene. */}
                    <Controller
                      name="disponibilidad"
                      control={control}
                      render={({ field }) => {
                        const current: string[] = Array.isArray(field.value)
                          ? (field.value as unknown[]).map(String)
                          : [];
                        return (
                          <>
                            {disponibilidades?.map((d) => {
                              const value = String(d.num1);
                              return (
                                <label
                                  className="flex items-center gap-2"
                                  key={d.num1}
                                >
                                  <Checkbox
                                    checked={current.includes(value)}
                                    onCheckedChange={(checked) =>
                                      field.onChange(
                                        checked === true
                                          ? [...current, value]
                                          : current.filter((v) => v !== value),
                                      )
                                    }
                                    onBlur={field.onBlur}
                                    className="w-4 h-4"
                                  />
                                  <span>{d.string1}</span>
                                </label>
                              );
                            })}
                          </>
                        );
                      }}
                    />

                    {errors.disponibilidad && (
                      <p className="text-red-400 text-sm">
                        {errors.disponibilidad.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="procedencia"
                      className="text-[#636d7c] text-sm px-1 dark:text-slate-400"
                    >
                      Procedencia
                      <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="procedencia"
                      control={control}
                      render={({ field }) => (
                        <AppSelect
                          ref={field.ref}
                          id="procedencia"
                          name={field.name}
                          onBlur={field.onBlur}
                          value={field.value}
                          onChange={field.onChange}
                          options={PROCEDENCIA_OPTIONS.map((op) => ({
                            value: op,
                            label: op,
                          }))}
                          placeholder="Seleccione una procedencia"
                          className={selectClass}
                        />
                      )}
                    />
                    {errors.procedencia && (
                      <p className="text-red-400 text-sm">
                        {errors.procedencia.message}
                      </p>
                    )}
                  </div>
                </div>
                {/* Location */}
                <div className="*:mb-4">
                  <h3 className="text-[#3f3f46] text-lg my-5 font-semibold dark:text-slate-200">
                    Locación
                  </h3>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="country"
                      className="text-[#636d7c] text-sm px-1 dark:text-slate-400"
                    >
                      País<span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="idPais"
                      control={control}
                      render={({ field }) => (
                        <AppSelect
                          ref={field.ref}
                          id="country"
                          name={field.name}
                          onBlur={field.onBlur}
                          value={field.value}
                          onChange={(v) =>
                            field.onChange(v === "" ? 0 : Number(v))
                          }
                          options={paises.map((pais) => ({
                            value: pais.num1,
                            label: pais.string1,
                          }))}
                          placeholder="Seleccione un país"
                          className={`${selectClass} hover:bg-gray-100 dark:hover:bg-slate-700`}
                        />
                      )}
                    />
                    {errors.idPais && (
                      <p className="text-red-400 text-sm">
                        {errors.idPais.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="city"
                      className="text-[#636d7c] text-sm px-1 dark:text-slate-400"
                    >
                      Ciudad<span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="idCiudad"
                      control={control}
                      render={({ field }) => (
                        <AppSelect
                          ref={field.ref}
                          id="city"
                          name={field.name}
                          onBlur={field.onBlur}
                          value={field.value}
                          onChange={(v) =>
                            field.onChange(v === "" ? 0 : Number(v))
                          }
                          options={ciudadesFiltradas.map((ciudad) => ({
                            value: ciudad.num1,
                            label: ciudad.string1,
                          }))}
                          placeholder="Seleccione una ciudad"
                          className={selectClass}
                        />
                      )}
                    />
                    {errors.idCiudad && (
                      <p className="text-red-400 text-sm">
                        {errors.idCiudad.message}
                      </p>
                    )}
                  </div>
                </div>
                {/* Salary */}
                <SalaryExpectSection
                  coins={monedas.map((moneda) => ({
                    idCoin: moneda.num1,
                    stringVal: moneda.string1,
                  }))}
                  modalidades={modalidadesFacturacion.map((modalidad) => ({
                    idModalidad: modalidad.num1,
                    stringVal: modalidad.string1,
                  }))}
                  control={control}
                  errors={errors}
                />
                {/* Tech skills */}
                <TechSkillsSection<AddTalentType>
                  control={control}
                  errors={errors}
                  habilidadesTecnicas={habilidadesTecnicas}
                  dropdownWithSearch={true}
                  shouldShowEmptyForm={true}
                  itemVariant="card"
                />
                {/* Soft skills */}
                <SoftSkillsSection<AddTalentType>
                  control={control}
                  errors={errors}
                  habilidadesBlandas={habilidadesBlandas}
                  dropdownWithSearch={true}
                  shouldShowEmptyForm={false}
                  itemVariant="card"
                />
                {/* Experience */}
                <ExperiencesSection<AddTalentType>
                  control={control}
                  errors={errors}
                  shouldShowEmptyForm={false}
                  itemVariant="card"
                />

                {/* Education */}
                <EducationsSection<AddTalentType>
                  control={control}
                  errors={errors}
                  shouldShowEmptyForm={false}
                  itemVariant="card"
                />

                {/* Languages */}
                <LanguagesSection<AddTalentType>
                  control={control}
                  errors={errors}
                  idiomas={idiomas}
                  nivelesIdioma={nivelesIdioma}
                  shouldShowEmptyForm={false}
                  itemVariant="card"
                />
                {/* Social media */}
                <div className="*:mb-4">
                  <h3 className="text-[#3f3f46] text-lg my-5 font-semibold dark:text-slate-200">
                    Medios sociales
                  </h3>
                  <div className="flex flex-col my-2">
                    <label
                      htmlFor="linkedin"
                      className="text-[#71717A] text-sm px-1 dark:text-slate-400"
                    >
                      LinkedIn
                    </label>
                    <Input
                      {...register("linkedin")}
                      id="linkedin"
                      type="text"
                      className={socialInputClass}
                    />
                    {errors.linkedin && (
                      <p className="text-red-400 text-sm">
                        {errors.linkedin.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col my-2">
                    <label
                      htmlFor="github"
                      className="text-[#71717A] text-sm px-1 dark:text-slate-400"
                    >
                      Github
                    </label>
                    <Input
                      {...register("github")}
                      id="github"
                      type="text"
                      className={socialInputClass}
                    />
                    {errors.github && (
                      <p className="text-red-400 text-sm">
                        {errors.github.message}
                      </p>
                    )}
                  </div>
                </div>

                <Controller
                  name="tieneEquipo"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col my-4 gap-2">
                      <span
                        id="add-talent-equipo"
                        className="text-wrap max-w-[20rem]"
                      >
                        ¿Cuenta con equipo (Laptop)?{" "}
                        <span className="text-red-500">*</span>
                      </span>
                      {/* RadioGroup sobre el booleano: "" mientras no se elija. */}
                      <RadioGroup
                        aria-labelledby="add-talent-equipo"
                        value={
                          field.value === true
                            ? "si"
                            : field.value === false
                              ? "no"
                              : ""
                        }
                        onValueChange={(v) => field.onChange(v === "si")}
                        className="flex items-center gap-6"
                      >
                        <div className="flex items-center">
                          <RadioGroupItem
                            id="add-talent-equipo-si"
                            value="si"
                            className="h-4 w-4"
                          />
                          <Label
                            htmlFor="add-talent-equipo-si"
                            className="ml-2 cursor-pointer text-gray-700 dark:text-slate-200"
                          >
                            Sí
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <RadioGroupItem
                            id="add-talent-equipo-no"
                            value="no"
                            className="h-4 w-4"
                          />
                          <Label
                            htmlFor="add-talent-equipo-no"
                            className="ml-2 cursor-pointer text-gray-700 dark:text-slate-200"
                          >
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                      {errors.tieneEquipo && (
                        <p className="text-sm text-red-600 mt-2 dark:text-red-400">
                          {errors.tieneEquipo.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </form>
          </div>
        </div>
      </Dashboard>
    </FormProvider>
  );
};
