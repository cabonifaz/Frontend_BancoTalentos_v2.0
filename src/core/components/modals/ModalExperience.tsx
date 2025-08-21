import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enqueueSnackbar } from "notistack";
import { useModal } from "../../context/ModalContext";
import { useApi } from "../../hooks/useApi";
import {
  AddOrUpdateExperienceParams,
  BaseResponse,
  Experience,
} from "../../models";
import {
  addOrUpdateTalentExperience,
  deleteTalenteExperience,
} from "../../services/apiService";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { Modal } from "./Modal";
import { Loading } from "../ui/Loading";
import { ExperiencesSection } from "..";
import { useEffect } from "react";
import { z } from "zod";
import { trim, emptyToUndef } from "../../models/schemas/Validations";
import { Utils } from "../../utilities/utils";

interface Props {
  idTalento?: number;
  experienceRef: React.MutableRefObject<Experience | null>;
  onUpdate?: (idTalento: number) => void;
}

export const experienceSchema = z
  .object({
    empresa: z.preprocess(trim, z.string().min(1, "La empresa es requerida")),
    puesto: z.preprocess(trim, z.string().min(1, "El puesto es requerido")),
    funciones: z.preprocess(
      trim,
      z.string().min(1, "Las funciones son requeridas"),
    ),
    fechaInicio: z.preprocess(
      trim,
      z.string().min(1, "La fecha de inicio es requerida"),
    ),
    fechaFin: z.preprocess(emptyToUndef, z.string().optional()),
    flActualidad: z.coerce.boolean().optional().default(false),
  })
  .refine((data) => data.flActualidad || !!data.fechaFin, {
    message: "La fecha de fin es requerida",
    path: ["fechaFin"],
  });

export type ExperienceFormData = z.infer<typeof experienceSchema>;

// Tipo para el formulario con array de experiencias
type ExperiencesArrayFormData = {
  experiencias: ExperienceFormData[];
};

export const ModalExperience = ({
  idTalento,
  onUpdate,
  experienceRef,
}: Props) => {
  const isEditing = !!experienceRef.current;
  const { closeModal } = useModal();

  const methods = useForm<ExperiencesArrayFormData>({
    resolver: zodResolver(
      z.object({
        experiencias: z
          .array(experienceSchema)
          .min(1, "Debe agregar al menos una experiencia"),
      }),
    ),
    defaultValues: {
      experiencias: [
        {
          empresa: "",
          puesto: "",
          fechaInicio: "",
          fechaFin: "",
          flActualidad: false,
          funciones: "",
        },
      ],
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = methods;

  // Efecto para cargar datos cuando se edita
  useEffect(() => {
    if (experienceRef.current) {
      const experiencia = experienceRef.current;
      setValue("experiencias.0", {
        empresa: experiencia.nombreEmpresa || "",
        puesto: experiencia.puesto || "",
        fechaInicio: Utils.formatDateForInput(experiencia.fechaInicio) || "",
        fechaFin: Utils.formatDateForInput(experiencia.fechaFin) || "",
        flActualidad: experiencia.flActualidad || false,
        funciones: experiencia.funciones || "",
      });
    } else {
      reset({
        experiencias: [
          {
            empresa: "",
            puesto: "",
            fechaInicio: "",
            fechaFin: "",
            flActualidad: false,
            funciones: "",
          },
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experienceRef.current, setValue, reset]);

  const { loading: addOrUpdateLoading, fetch: addOrUpdateData } = useApi<
    BaseResponse,
    AddOrUpdateExperienceParams
  >(addOrUpdateTalentExperience, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) => {
      handleResponse({
        response: response,
        showSuccessMessage: true,
        enqueueSnackbar: enqueueSnackbar,
      });
    },
  });

  const { loading: deleteLoading, fetch: deleteData } = useApi<
    BaseResponse,
    number
  >(deleteTalenteExperience, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) => {
      handleResponse({
        response: response,
        showSuccessMessage: true,
        enqueueSnackbar: enqueueSnackbar,
      });
    },
  });

  const onSubmit = (data: ExperiencesArrayFormData) => {
    if (!idTalento) return;

    const primeraExperiencia = data.experiencias[0];

    const requestData: AddOrUpdateExperienceParams = {
      idTalento: idTalento,
      empresa: primeraExperiencia.empresa,
      puesto: primeraExperiencia.puesto,
      funciones: primeraExperiencia.funciones,
      fechaInicio: primeraExperiencia.fechaInicio,
      fechaFin: primeraExperiencia.flActualidad
        ? ""
        : primeraExperiencia.fechaFin || "",
      flActualidad: primeraExperiencia.flActualidad ? 1 : 0,
    };

    if (isEditing && experienceRef.current) {
      requestData.idExperiencia = experienceRef.current.idExperiencia;
    }

    addOrUpdateData(requestData).then((response) => {
      if (response.data.idMensaje === 2) {
        if (onUpdate && idTalento) onUpdate(idTalento);
        handleCloseModal();
      }
    });
  };

  const handleOnDelete = () => {
    if (experienceRef.current && idTalento) {
      deleteData(experienceRef.current.idExperiencia).then((response) => {
        if (response.data.idMensaje === 2) {
          if (onUpdate && idTalento) onUpdate(idTalento);
          handleCloseModal();
        }
      });
    }
  };

  const handleCloseModal = () => {
    if (experienceRef.current) {
      const experiencia = experienceRef.current;
      setValue("experiencias.0", {
        empresa: experiencia.nombreEmpresa || "",
        puesto: experiencia.puesto || "",
        fechaInicio: Utils.formatDateForInput(experiencia.fechaInicio) || "",
        fechaFin: Utils.formatDateForInput(experiencia.fechaFin) || "",
        flActualidad: experiencia.flActualidad || false,
        funciones: experiencia.funciones || "",
      });
    }
    closeModal("modalExperience");
  };

  return (
    <FormProvider {...methods}>
      <Modal
        id="modalExperience"
        title={isEditing ? "Editar experiencia" : "Agregar experiencia"}
        confirmationLabel={isEditing ? "Actualizar" : "Agregar"}
        onConfirm={handleSubmit(onSubmit)}
        onClose={handleCloseModal}
      >
        {(addOrUpdateLoading || deleteLoading) && (
          <Loading opacity="opacity-60" />
        )}

        <div className="relative">
          <h3 className="text-[#71717A] text-sm mt-6 mb-4">
            {isEditing
              ? "Edita tu experiencia laboral"
              : "Describe tu nueva experiencia laboral"}
          </h3>

          {/* Botón de eliminar */}
          {isEditing && (
            <button
              type="button"
              onClick={handleOnDelete}
              className="absolute -right-2 top-0 rounded-lg hover:bg-red-50 w-10 h-10"
            >
              <img
                src="/assets/ic_delete_bdt.svg"
                alt="delete icon"
                className="w-6 h-6 mx-auto"
              />
            </button>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <ExperiencesSection
              control={control}
              errors={errors}
              shouldShowEmptyForm={true}
              shouldAddElements={false}
              empresaValue={
                isEditing ? experienceRef.current?.nombreEmpresa : ""
              }
            />
          </form>
        </div>
      </Modal>
    </FormProvider>
  );
};
