import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enqueueSnackbar } from "notistack";
import { useModal } from "../../context/ModalContext";
import { useApi } from "../../hooks/useApi";
import {
  AddOrUpdateFeedbackParams,
  BaseResponse,
  Feedback,
  FeedbackResponse,
  Talent,
} from "../../models";
import {
  addOrUpdateTalentFeedback,
  deleteTalenteFeedback,
} from "../../services/apiService";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { Modal } from "./Modal";
import { Loading } from "../ui/Loading";
import { useEffect } from "react";
import { z } from "zod";
import { trim } from "../../models/schemas/Validations";

interface Props {
  idTalento?: number;
  feedbackRef: React.MutableRefObject<Feedback | null>;
  onUpdate?: (idTalento: number) => void;
  updateTalentList?: (idTalento: number, fields: Partial<Talent>) => void;
}

export const feedbackSchema = z.object({
  feedback: z.preprocess(trim, z.string().min(1, "El feedback es requerido")),
  estrellas: z.coerce
    .number()
    .min(1, "Debe seleccionar al menos 1 estrella")
    .max(5, "Máximo 5 estrellas"),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;

export const ModalFeedback = ({
  idTalento,
  feedbackRef,
  onUpdate,
  updateTalentList,
}: Props) => {
  const isEditing = !!feedbackRef.current;
  const { closeModal, isModalOpen } = useModal();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    setValue,
    reset,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedback: "",
      estrellas: 0,
    },
    mode: "onChange",
  });

  // Efecto para cargar datos cuando el modal se abre
  useEffect(() => {
    if (isModalOpen("modalFeedback")) {
      if (feedbackRef.current) {
        setValue("feedback", feedbackRef.current.descripcion || "");
        setValue("estrellas", feedbackRef.current.estrellas || 0);
      } else {
        // Resetear a valores por defecto para nuevo feedback
        reset({
          feedback: "",
          estrellas: 0,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, feedbackRef.current, setValue, reset]);

  const { loading: addOrUpdateLoading, fetch: addOrUpdateData } = useApi<
    FeedbackResponse,
    AddOrUpdateFeedbackParams
  >(addOrUpdateTalentFeedback, {
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
    FeedbackResponse,
    number
  >(deleteTalenteFeedback, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) => {
      handleResponse({
        response: response,
        showSuccessMessage: true,
        enqueueSnackbar: enqueueSnackbar,
      });
    },
  });

  const onSubmit = (data: FeedbackFormData) => {
    if (!idTalento) return;

    const requestData: AddOrUpdateFeedbackParams = {
      idTalento: idTalento,
      feedback: data.feedback,
      estrellas: data.estrellas,
    };

    if (isEditing && feedbackRef.current) {
      requestData.idFeedback = feedbackRef.current.idFeedback;
    }

    addOrUpdateData(requestData).then((response) => {
      if (response.data.idMensaje === 2) {
        if (onUpdate && idTalento) {
          onUpdate(idTalento);
          if (response.data.avgEstrellas >= 0) {
            updateTalentList?.(idTalento, {
              estrellas: response.data.avgEstrellas,
            });
          }
        }
        handleCloseModal();
      }
    });
  };

  const handleOnDelete = () => {
    if (feedbackRef.current && idTalento) {
      deleteData(feedbackRef.current.idFeedback).then((response) => {
        if (response.data.idMensaje === 2) {
          onUpdate?.(idTalento);
          if (response.data.avgEstrellas >= 0) {
            updateTalentList?.(idTalento, {
              estrellas: response.data.avgEstrellas,
            });
          }
          handleCloseModal();
        }
      });
    }
  };

  const handleCloseModal = () => {
    // Resetear el formulario al cerrar el modal
    if (feedbackRef.current) {
      setValue("feedback", feedbackRef.current.descripcion || "");
      setValue("estrellas", feedbackRef.current.estrellas || 0);
    }
    closeModal("modalFeedback");
  };

  return (
    <Modal
      id="modalFeedback"
      title={isEditing ? "Editar feedback" : "Agregar feedback"}
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
            ? "Edita tu feedback"
            : "Agrega un nuevo puntaje y comentario"}
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Estrellas */}
          <div className="flex flex-col my-2">
            <label className="text-[#71717A] text-sm mb-2">
              Puntaje<span className="text-red-400">*</span>
            </label>
            <Controller
              name="estrellas"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2 *:cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} onClick={() => field.onChange(star)}>
                      <img
                        src={
                          field.value >= star
                            ? "/assets/ic_fill_star.svg"
                            : "/assets/ic_outline_star.svg"
                        }
                        alt={`Star ${star}`}
                        className="star-icon w-6 h-6"
                      />
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.estrellas && (
              <p className="text-red-500 text-sm mt-2">
                {errors.estrellas.message}
              </p>
            )}
          </div>

          {/* Feedback */}
          <div className="flex flex-col my-2">
            <label htmlFor="feedback" className="input-label">
              Feedback<span className="text-red-400">*</span>
            </label>
            <Controller
              name="feedback"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="feedback"
                  placeholder="Agrega un comentario"
                  className="input resize-none min-h-[100px]"
                />
              )}
            />
            {errors.feedback && (
              <p className="text-red-500 text-sm mt-2">
                {errors.feedback.message}
              </p>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};
