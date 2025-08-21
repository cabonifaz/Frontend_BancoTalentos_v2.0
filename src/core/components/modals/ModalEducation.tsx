import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enqueueSnackbar } from "notistack";
import { useModal } from "../../context/ModalContext";
import { useApi } from "../../hooks/useApi";
import {
  AddOrUpdateEducationParams,
  BaseResponse,
  Education,
} from "../../models";
import {
  addOrUpdateTalentEducation,
  deleteTalenteEducation,
} from "../../services/apiService";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { Modal } from "./Modal";
import { Loading } from "../ui/Loading";
import { EducationsSection } from "..";
import { useEffect } from "react";
import { z } from "zod";
import { trim, emptyToUndef } from "../../models/schemas/Validations";
import { Utils } from "../../utilities/utils";

interface Props {
  idTalento?: number;
  educationRef: React.MutableRefObject<Education | null>;
  onUpdate?: (idTalento: number) => void;
}

export const educationSchema = z
  .object({
    institucion: z.preprocess(
      trim,
      z.string().min(1, "La institución es requerida"),
    ),
    carrera: z.preprocess(trim, z.string().min(1, "La carrera es requerida")),
    grado: z.preprocess(trim, z.string().min(1, "El grado es requerido")),
    fechaInicio: z.preprocess(
      trim,
      z.string().min(1, "La fecha de inicio es requerida"),
    ),
    fechaFin: z.preprocess(emptyToUndef, z.string().optional()),
    flActualidad: z.coerce.boolean(),
  })
  .refine((data) => data.flActualidad || !!data.fechaFin, {
    message: "La fecha de fin es requerida",
    path: ["fechaFin"],
  });

export type EducationFormData = z.infer<typeof educationSchema>;

// Tipo para el formulario con array de educaciones
type EducationsArrayFormData = {
  educaciones: EducationFormData[];
};

export const ModalEducation = ({
  idTalento,
  educationRef,
  onUpdate,
}: Props) => {
  const isEditing = !!educationRef.current;
  const { closeModal } = useModal();

  const methods = useForm<EducationsArrayFormData>({
    resolver: zodResolver(
      z.object({
        educaciones: z
          .array(educationSchema)
          .min(1, "Debe agregar al menos una educación"),
      }),
    ),
    defaultValues: {
      educaciones: [
        {
          institucion: "",
          carrera: "",
          grado: "",
          fechaInicio: "",
          fechaFin: "",
          flActualidad: false,
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
    if (educationRef.current) {
      const educacion = educationRef.current;
      setValue("educaciones.0", {
        institucion: educacion.nombreInstitucion || "",
        carrera: educacion.carrera || "",
        grado: educacion.grado || "",
        fechaInicio: Utils.formatDateForInput(educacion.fechaInicio) || "",
        fechaFin: Utils.formatDateForInput(educacion.fechaFin) || "",
        flActualidad: educacion.flActualidad || false,
      });
    } else {
      reset({
        educaciones: [
          {
            institucion: "",
            carrera: "",
            grado: "",
            fechaInicio: "",
            fechaFin: "",
            flActualidad: false,
          },
        ],
      });
    }
  }, [educationRef, educationRef.current, setValue, reset]);

  const { loading: addOrUpdateLoading, fetch: addOrUpdateData } = useApi<
    BaseResponse,
    AddOrUpdateEducationParams
  >(addOrUpdateTalentEducation, {
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
  >(deleteTalenteEducation, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) => {
      handleResponse({
        response: response,
        showSuccessMessage: true,
        enqueueSnackbar: enqueueSnackbar,
      });

      if (response.data.idMensaje === 2) {
        if (onUpdate && idTalento) onUpdate(idTalento);
        handleCloseModal();
      }
    },
  });

  const onSubmit = (data: EducationsArrayFormData) => {
    if (!idTalento) return;

    const primeraEducacion = data.educaciones[0];

    const requestData: AddOrUpdateEducationParams = {
      idTalento: idTalento,
      institucion: primeraEducacion.institucion,
      carrera: primeraEducacion.carrera,
      grado: primeraEducacion.grado,
      fechaInicio: primeraEducacion.fechaInicio,
      fechaFin: primeraEducacion.flActualidad
        ? ""
        : primeraEducacion.fechaFin || "",
      flActualidad: primeraEducacion.flActualidad ? 1 : 0,
    };

    if (isEditing && educationRef.current) {
      requestData.idTalentoEducacion = educationRef.current.idEducacion;
    }

    addOrUpdateData(requestData).then((response) => {
      if (response.data.idMensaje === 2) {
        if (onUpdate) onUpdate(idTalento);
        handleCloseModal();
      }
    });
  };

  const handleOnDelete = () => {
    if (educationRef.current && idTalento) {
      deleteData(educationRef.current.idEducacion).then((response) => {
        if (response.data.idMensaje === 2) {
          if (onUpdate) onUpdate(idTalento);
          handleCloseModal();
        }
      });
    }
  };

  const handleCloseModal = () => {
    if (educationRef.current) {
      const educacion = educationRef.current;
      setValue("educaciones.0", {
        institucion: educacion.nombreInstitucion || "",
        carrera: educacion.carrera || "",
        grado: educacion.grado || "",
        fechaInicio: Utils.formatDateForInput(educacion.fechaInicio) || "",
        fechaFin: Utils.formatDateForInput(educacion.fechaFin) || "",
        flActualidad: educacion.flActualidad || false,
      });
    }
    closeModal("modalEducation");
  };

  return (
    <FormProvider {...methods}>
      <Modal
        id="modalEducation"
        title={isEditing ? "Editar educación" : "Agregar educación"}
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
              ? "Edita tu experiencia educativa"
              : "Describe tu nueva experiencia educativa"}
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
            <EducationsSection
              control={control}
              errors={errors}
              shouldShowEmptyForm={true}
              shouldAddElements={false}
            />
          </form>
        </div>
      </Modal>
    </FormProvider>
  );
};
