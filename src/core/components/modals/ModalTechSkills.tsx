import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enqueueSnackbar } from "notistack";
import { useParams } from "../../context/ParamsContext";
import { useApi } from "../../hooks/useApi";
import { BaseResponse } from "../../models";
import { TalentTechSkillParams } from "../../models/params/TalentUpdateParams";
import { addTalentTechSkill } from "../../services/apiService";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { Modal } from "./Modal";
import { useModal } from "../../context/ModalContext";
import { Loading } from "../ui/Loading";
import { z } from "zod";
import { TechSkillsSection } from "..";
import { emptyToNull } from "../../models/schemas/Validations";

interface Props {
  idTalento?: number;
  onUpdate?: (idTalento: number) => void;
}

export const techSkillSchema = z.object({
  idHabilidad: z.coerce
    .number({
      invalid_type_error: "Seleccione una habilidad técnica",
      required_error: "Seleccione una habilidad técnica",
    })
    .min(0, "Seleccione una habilidad técnica"),
  anios: z.coerce
    .number({
      invalid_type_error: "Los años de experiencia son requeridos",
    })
    .min(1, "Los años de experiencia son requeridos"),
  habilidad: z.preprocess(
    emptyToNull,
    z.string({
      invalid_type_error: "Seleccione una habilidad técnica",
      required_error: "Seleccione una habilidad técnica",
    }),
  ),
});

export type TechSkillFormData = z.infer<typeof techSkillSchema>;

// Tipo para el formulario con array de habilidades
type TechSkillsArrayFormData = {
  habilidadesTecnicas: TechSkillFormData[];
};

export const ModalTechSkills = ({ idTalento, onUpdate }: Props) => {
  const { paramsByMaestro } = useParams();
  const { closeModal } = useModal();
  const habilidadesTecnicas = paramsByMaestro[19] || [];

  const methods = useForm<TechSkillsArrayFormData>({
    resolver: zodResolver(
      z.object({
        habilidadesTecnicas: z
          .array(techSkillSchema)
          .min(1, "Debe agregar al menos una habilidad"),
      }),
    ),
    defaultValues: {
      habilidadesTecnicas: [
        {
          idHabilidad: 0,
          habilidad: "",
          anios: 0,
        },
      ],
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = methods;

  const { loading, fetch: addData } = useApi<
    BaseResponse,
    TalentTechSkillParams
  >(addTalentTechSkill, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) => {
      handleResponse({
        response: response,
        showSuccessMessage: true,
        enqueueSnackbar: enqueueSnackbar,
      });
    },
  });

  const onSubmit = (data: TechSkillsArrayFormData) => {
    if (!idTalento) return;

    // Enviar la primera habilidad del array
    const primeraHabilidad = data.habilidadesTecnicas[0];

    addData({
      idTalento: idTalento,
      idHabilidad: primeraHabilidad.idHabilidad,
      habilidad: primeraHabilidad.habilidad || "",
      anios: primeraHabilidad.anios,
    }).then((response) => {
      if (response.data.idMensaje === 2) {
        if (onUpdate && idTalento) onUpdate(idTalento);
        handleCloseModal();
      }
    });
  };

  const handleCloseModal = () => {
    setValue("habilidadesTecnicas", []);
    closeModal("modalTechSkills");
  };

  return (
    <FormProvider {...methods}>
      <Modal
        id="modalTechSkills"
        title="Agregar habilidad técnica"
        confirmationLabel="Agregar"
        onConfirm={handleSubmit(onSubmit)}
        onClose={handleCloseModal}
      >
        {loading && <Loading opacity="opacity-60" />}

        <div>
          <h3 className="text-[#71717A] text-sm mt-6 mb-4">
            Agrega tu nueva experiencia técnica
          </h3>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TechSkillsSection
              control={control}
              errors={errors}
              habilidadesTecnicas={habilidadesTecnicas}
              dropdownWithSearch={true}
              shouldShowEmptyForm={true}
              shouldAddElements={false}
            />
          </form>
        </div>
      </Modal>
    </FormProvider>
  );
};
