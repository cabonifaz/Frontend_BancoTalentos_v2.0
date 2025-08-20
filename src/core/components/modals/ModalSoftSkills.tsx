import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enqueueSnackbar } from "notistack";
import { useParams } from "../../context/ParamsContext";
import { useApi } from "../../hooks/useApi";
import { BaseResponse } from "../../models";
import { TalentSoftSkillParams } from "../../models/params/TalentUpdateParams";
import { addTalentSoftSkill } from "../../services/apiService";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { Modal } from "./Modal";
import { useModal } from "../../context/ModalContext";
import { Loading } from "../ui/Loading";
import { z } from "zod";
import { SoftSkillsSection } from "..";
import { emptyToNull } from "../../models/schemas/Validations";
import { useFieldArray } from "react-hook-form";

interface Props {
  idTalento?: number;
  onUpdate?: (idTalento: number) => void;
}

export const softSkillSchema = z.object({
  idHabilidad: z.coerce
    .number({
      invalid_type_error: "Seleccione una habilidad blanda",
      required_error: "Seleccione una habilidad blanda",
    })
    .min(0, "Seleccione una habilidad blanda"),
  habilidad: z.preprocess(
    emptyToNull,
    z.string({
      invalid_type_error: "Seleccione una habilidad blanda",
      required_error: "Seleccione una habilidad blanda",
    }),
  ),
});

export type SoftSkillFormData = z.infer<typeof softSkillSchema>;

// Tipo para el formulario con array de habilidades
type SoftSkillsArrayFormData = {
  habilidadesBlandas: SoftSkillFormData[];
};

export const ModalSoftSkills = ({ idTalento, onUpdate }: Props) => {
  const { paramsByMaestro } = useParams();
  const { closeModal } = useModal();
  const habilidadesBlandas = paramsByMaestro[20] || [];

  const methods = useForm<SoftSkillsArrayFormData>({
    resolver: zodResolver(
      z.object({
        habilidadesBlandas: z
          .array(softSkillSchema)
          .min(1, "Debe agregar al menos una habilidad"),
      }),
    ),
    defaultValues: {
      habilidadesBlandas: [
        {
          idHabilidad: 0,
          habilidad: "",
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
    TalentSoftSkillParams
  >(addTalentSoftSkill, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) => {
      handleResponse({
        response: response,
        showSuccessMessage: true,
        enqueueSnackbar: enqueueSnackbar,
      });
    },
  });

  const onSubmit = (data: SoftSkillsArrayFormData) => {
    if (!idTalento) return;

    // Enviar la primera habilidad del array
    const primeraHabilidad = data.habilidadesBlandas[0];

    addData({
      idTalento: idTalento,
      idHabilidad: primeraHabilidad.idHabilidad,
      habilidad: primeraHabilidad.habilidad || "",
    }).then((response) => {
      if (response.data.idMensaje === 2) {
        if (onUpdate && idTalento) onUpdate(idTalento);
        handleCloseModal();
      }
    });
  };

  const handleCloseModal = () => {
    setValue("habilidadesBlandas", []);
    closeModal("modalSoftSkills");
  };

  return (
    <FormProvider {...methods}>
      <Modal
        id="modalSoftSkills"
        title="Agregar habilidad blanda"
        confirmationLabel="Agregar"
        onConfirm={handleSubmit(onSubmit)}
        onClose={handleCloseModal}
      >
        {loading && <Loading opacity="opacity-60" />}

        <div>
          <h3 className="text-[#71717A] text-sm mt-6 mb-4">
            Agrega tu nueva habilidad blanda
          </h3>

          <form onSubmit={handleSubmit(onSubmit)}>
            <SoftSkillsSection
              control={control}
              errors={errors}
              habilidadesBlandas={habilidadesBlandas}
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
