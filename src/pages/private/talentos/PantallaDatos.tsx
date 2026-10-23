import { useLocation, useNavigate } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Loading } from "../../../core/components";
import BackButton from "../../../core/components/ui/BackButton";
import { InputForm } from "../../../core/components/forms";
import { useApi } from "../../../core/hooks/useApi";
import {
  BaseResponseFMI,
  DataFormSchema,
  DataFormType,
  SaveTalentFMIParams,
  TalentoFMI,
} from "../../../core/models";
import {
  handleError,
  handleResponse,
} from "../../../core/utilities/errorHandler";
import { enqueueSnackbar } from "notistack";
import { saveTalentFMI } from "../../../core/services/talents.service";
import useFetchTalento from "../../../core/hooks/talentos/useFetchTalento";
import { Dashboard } from "../Dashboard";

/**
 * Datos personales del talento observado en AsignarTalento. Los datos de
 * colaborador (contrato, remuneración, modalidad, ubicación) no se piden aquí:
 * se completan en el modal de confirmación.
 */
const PantallaDatos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { talento } =
    (location.state as { talento: TalentoFMI }) || {};

  const { talentoDetails, loading } = useFetchTalento(
    talento.idTalento
  ); // fmi

  const { loading: loadingSaveTalent, fetch: saveTalent } = useApi<
    BaseResponseFMI,
    SaveTalentFMIParams
  >(saveTalentFMI, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) =>
      handleResponse({
        response: response,
        showSuccessMessage: true,
        enqueueSnackbar: enqueueSnackbar,
      }),
  });

  const goBack = () => navigate(-1);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DataFormType>({
    resolver: zodResolver(DataFormSchema),
    mode: "onChange",
    defaultValues: {
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      telefono: "",
      dni: "",
      email: "",
      ubicacion: "",
    },
  });

  useEffect(() => {
    if (talentoDetails) {
      reset({
        nombres: talentoDetails?.nombres || "",
        apellidoPaterno: talentoDetails?.apellidoPaterno || "",
        apellidoMaterno: talentoDetails?.apellidoMaterno || "",
        telefono: talentoDetails?.celular || "",
        dni: talentoDetails?.dni || "",
        email: talentoDetails?.email || "",
        ubicacion: talentoDetails?.ubicacion || "",
      });
    }
  }, [talentoDetails, reset]);

  const saveData: SubmitHandler<DataFormType> = async (data) => {
    const { apellidoMaterno, ...cleanData } = data;

    const payload: SaveTalentFMIParams = {
      idTalento: talento.idTalento,
      APELLIDO_PATERNO: talento.apellidoPaterno,
      apellidoMaterno: apellidoMaterno || "",
      ...cleanData,
    };

    saveTalent(payload).then((response) => {
      if (response.data.idTipoMensaje === 2) {
        goBack();
      }
    });
  };

  return (
    <Dashboard>
      {loading && <Loading opacity="opacity-60" />}
      {loadingSaveTalent && <Loading opacity="opacity-60" />}
      <div>
        <div className="w-full lg:w-[65%] mx-auto p-4 border-2 rounded-lg dark:border-slate-700">
          {/* Data form */}
          <form
            onSubmit={handleSubmit(saveData)}
            className="flex flex-col gap-4"
          >
            <h3 className="text-2xl font-semibold flex gap-2">
              <BackButton backClicked={goBack} />
              Datos Personales
            </h3>
            <InputForm
              required={true}
              name="nombres"
              control={control}
              label="Nombres"
              error={errors.nombres}
            />
          <InputForm
            required={true}
            name="apellidoPaterno"
            control={control}
            label="Apellido Paterno"
            error={errors.apellidoPaterno}
          />
          <InputForm
            required={false}
            name="apellidoMaterno"
            control={control}
            label="Apellido Materno"
            error={errors.apellidoMaterno}
          />
          <InputForm
            required={true}
            name="telefono"
            control={control}
            label="Contacto"
            error={errors.telefono}
          />
          <InputForm
            required={true}
            name="dni"
            control={control}
            label="Doc. Identidad"
            type="text"
            error={errors.dni}
          />
          <InputForm
            required={true}
            name="email"
            control={control}
            label="Correo personal"
            error={errors.email}
          />
          <InputForm
            required={true}
            name="ubicacion"
            control={control}
            label="Ubicación"
            error={errors.ubicacion}
          />

          {/* Form options */}
          <div className="flex justify-center gap-4">
            <button
              type="button"
              className="btn btn-outline-gray"
              onClick={goBack}
            >
              Cancelar
            </button>
            {/* Sin exigir cambios: un talento con datos personales completos que
                estaba Observado solo por los de colaborador pasa a Datos Completos al guardar */}
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
          </div>
          </form>
        </div>
      </div>
    </Dashboard>
  );
};

export default PantallaDatos;
