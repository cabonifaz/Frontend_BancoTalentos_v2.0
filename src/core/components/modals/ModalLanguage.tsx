import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enqueueSnackbar } from "notistack";
import { useModal } from "../../context/ModalContext";
import { useParams } from "../../context/ParamsContext";
import { useApi } from "../../hooks/useApi";
import {
  AddOrUpdateLanguageParams,
  BaseResponse,
  Language,
} from "../../models";
import {
  addOrUpdateTalentLanguage,
  deleteTalenteLanguage,
} from "../../services/apiService";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { Modal } from "./Modal";
import { Loading } from "../ui/Loading";
import { LanguagesSection } from "..";
import { useEffect } from "react";
import { z } from "zod";

interface Props {
  idTalento?: number;
  languageRef: React.MutableRefObject<Language | null>;
  onUpdate?: (idTalento: number) => void;
}

export const languageSchema = z.object({
  idIdioma: z.coerce.number().min(1, "Seleccione un idioma"),
  idNivel: z.coerce.number().min(1, "Seleccione un nivel"),
  estrellas: z.coerce.number().min(0, "Las estrellas son requeridas"),
});

export type LanguageFormData = z.infer<typeof languageSchema>;

// Tipo para el formulario con array de idiomas
type LanguagesArrayFormData = {
  idiomas: LanguageFormData[];
};

export const ModalLanguage = ({ idTalento, languageRef, onUpdate }: Props) => {
  const { paramsByMaestro } = useParams();
  const isEditing = !!languageRef.current;
  const { closeModal } = useModal();

  const idiomas = paramsByMaestro[15] || [];
  const nivelesIdioma = paramsByMaestro[16] || [];

  const methods = useForm<LanguagesArrayFormData>({
    resolver: zodResolver(
      z.object({
        idiomas: z
          .array(languageSchema)
          .min(1, "Debe agregar al menos un idioma"),
      }),
    ),
    defaultValues: {
      idiomas: [
        {
          idIdioma: 0,
          idNivel: 0,
          estrellas: 0,
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
    if (languageRef.current) {
      const idioma = languageRef.current;
      setValue("idiomas.0", {
        idIdioma: idioma.idIdioma || 0,
        idNivel: idioma.idNivel || 0,
        estrellas: idioma.estrellas || 0,
      });
    } else {
      reset({
        idiomas: [
          {
            idIdioma: 0,
            idNivel: 0,
            estrellas: 0,
          },
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageRef.current, setValue, reset]);

  const { loading: addOrUpdateLoading, fetch: addOrUpdateData } = useApi<
    BaseResponse,
    AddOrUpdateLanguageParams
  >(addOrUpdateTalentLanguage, {
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
  >(deleteTalenteLanguage, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) => {
      handleResponse({
        response: response,
        showSuccessMessage: true,
        enqueueSnackbar: enqueueSnackbar,
      });
    },
  });

  const onSubmit = (data: LanguagesArrayFormData) => {
    if (!idTalento) return;

    const primerIdioma = data.idiomas[0];

    const requestData: AddOrUpdateLanguageParams = {
      idTalento: idTalento,
      idIdioma: primerIdioma.idIdioma,
      idNivel: primerIdioma.idNivel,
      estrellas: primerIdioma.estrellas,
    };

    if (isEditing && languageRef.current) {
      requestData.idTalentoIdioma = languageRef.current.idTalentoIdioma;
    }

    addOrUpdateData(requestData).then((response) => {
      if (response.data.idMensaje === 2) {
        if (onUpdate && idTalento) onUpdate(idTalento);
        handleCloseModal();
      }
    });
  };

  const handleOnDelete = () => {
    if (languageRef.current && idTalento) {
      deleteData(languageRef.current.idTalentoIdioma).then((response) => {
        if (response.data.idMensaje === 2) {
          if (onUpdate && idTalento) onUpdate(idTalento);
          handleCloseModal();
        }
      });
    }
  };

  const handleCloseModal = () => {
    if (languageRef.current) {
      const idioma = languageRef.current;
      setValue("idiomas.0", {
        idIdioma: idioma.idIdioma || 0,
        idNivel: idioma.idNivel || 0,
        estrellas: idioma.estrellas || 0,
      });
    }
    closeModal("modalLanguage");
  };

  return (
    <FormProvider {...methods}>
      <Modal
        id="modalLanguage"
        title={isEditing ? "Editar idioma" : "Agregar idioma"}
        confirmationLabel={isEditing ? "Actualizar" : "Agregar"}
        onConfirm={handleSubmit(onSubmit)}
        onClose={handleCloseModal}
      >
        {(addOrUpdateLoading || deleteLoading) && (
          <Loading opacity="opacity-60" />
        )}

        <div className="relative">
          <h3 className="text-[#71717A] text-sm mt-6 mb-4">
            {isEditing ? "Edita tu idioma" : "Agrega un nuevo idioma aprendido"}
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
                className="w-7 h-7 mx-auto"
              />
            </button>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <LanguagesSection
              control={control}
              errors={errors}
              idiomas={idiomas}
              nivelesIdioma={nivelesIdioma}
              shouldShowEmptyForm={true}
              shouldAddElements={false}
            />
          </form>
        </div>
      </Modal>
    </FormProvider>
  );
};
