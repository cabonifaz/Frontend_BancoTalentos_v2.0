import { useLocation, useNavigate } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Loading } from "../../core/components";
import BackButton from "../../core/components/ui/BackButton";
import {
  DropdownForm,
  FormRow,
  InputForm,
} from "../../core/components/forms";
import { useParams } from "../../core/context/ParamsContext";
import { useApi } from "../../core/hooks/useApi";
import {
  BaseResponseFMI,
  DataFormSchema,
  DataFormType,
  SaveTalentFMIParams,
  TalentoFMI,
} from "../../core/models";
import {
  handleError,
  handleResponse,
} from "../../core/utilities/errorHandler";
import { enqueueSnackbar } from "notistack";
import { saveTalentFMI } from "../../core/services/apiService";
import useFetchTalento from "../../core/hooks/useFetchTalento";
import { format } from "date-fns";
import { Dashboard } from "./Dashboard";

const PantallaDatos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { talento, contract } =
    (location.state as {
      talento: TalentoFMI;
      contract: {
        duracionContrato: number;
        idDuracionContrato: number;
      };
    }) || {};

  // Función para convertir la duración del contrato al formato del formulario
  const convertContractDuration = (
    duration: number,
    durationTypeId: number
  ) => {
    if (!duration || !durationTypeId) {
      return { convertedDuration: 0, convertedTypeId: 1 };
    }

    switch (durationTypeId) {
      case 1: // Días -> convertir a meses (aproximado: 30 días = 1 mes)
        const monthsFromDays = Math.ceil(duration / 30);
        return {
          convertedDuration: monthsFromDays,
          convertedTypeId: 1, // meses en este formulario
        };

      case 2: // Semanas -> convertir a meses (aproximado: 4 semanas = 1 mes)
        const monthsFromWeeks = Math.ceil(duration / 4);
        return {
          convertedDuration: monthsFromWeeks,
          convertedTypeId: 1, // meses en este formulario
        };

      case 3: // Meses -> mantener como meses
        return {
          convertedDuration: duration,
          convertedTypeId: 1, // meses en este formulario
        };

      default:
        return { convertedDuration: 0, convertedTypeId: 1 };
    }
  };

  const { convertedDuration, convertedTypeId } =
    convertContractDuration(
      contract?.duracionContrato || 0,
      contract?.idDuracionContrato || 0
    );

  const { paramsByMaestro, loading: loadingParams } =
    useParams();
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

  const timeValues = paramsByMaestro[5] || [];
  const currencyValues = paramsByMaestro[2] || [];
  const modalityValues = paramsByMaestro[3] || [];

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
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
      tiempoContrato: convertedDuration,
      idTiempoContrato: convertedTypeId,
      fechaInicioLabores: "",
      // cargo: "",
      remuneracion: 0,
      idMoneda: 0,
      idModalidad: 0,
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
        tiempoContrato: convertedDuration,
        idTiempoContrato: convertedTypeId,
        fechaInicioLabores: talentoDetails?.fechaInicioLabores
          ? format(
              new Date(talentoDetails.fechaInicioLabores),
              "yyyy-MM-dd"
            )
          : format(new Date(), "yyyy-MM-dd"),
        // cargo: talentoDetails?.cargo || "",
        remuneracion: talentoDetails?.remuneracion || 0,
        idMoneda: talentoDetails?.idMoneda || 0,
        idModalidad: talentoDetails?.idModalidad || 0,
        ubicacion: talentoDetails?.ubicacion || "",
      });
    }
  }, [talentoDetails, reset, convertedDuration, convertedTypeId]);

  const saveData: SubmitHandler<DataFormType> = async (data) => {
    const { apellidoMaterno, ...cleanData } = data;

    const payload: SaveTalentFMIParams = {
      idTalento: talento.idTalento,
      APELLIDO_PATERNO: talento.apellidoPaterno,
      apellidoMaterno: apellidoMaterno || "",
      cargo: data?.cargo || "",
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
      {loadingParams && <Loading opacity="opacity-60" />}
      {loading && <Loading opacity="opacity-60" />}
      {loadingSaveTalent && <Loading opacity="opacity-60" />}
      <div>
        <div className="w-full lg:w-[65%] mx-auto p-4 border-2 rounded-lg">
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

          <FormRow>
            <InputForm
              required={true}
              name="tiempoContrato"
              regex={/^\d*$/}
              control={control}
              label="Tiempo contrato"
              type="number"
              error={errors.tiempoContrato}
            />
            <DropdownForm
              required={true}
              name="idTiempoContrato"
              control={control}
              error={errors.idTiempoContrato}
              options={
                timeValues?.map((time) => ({
                  value: time.num1,
                  label: time.string1,
                })) || []
              }
              flex={true}
            />
          </FormRow>

          <InputForm
            required={true}
            name="fechaInicioLabores"
            control={control}
            label="Inicio de labores"
            type="date"
            error={errors.fechaInicioLabores}
          />
          {/*<InputForm required={true} name="cargo" control={control} label="Cargo" type="text" error={errors.cargo} />*/}

          <FormRow>
            <InputForm
              required={true}
              name="remuneracion"
              regex={/^\d*(\.\d{0,2})?$/}
              control={control}
              label="Remuneración"
              type="number"
              error={errors.remuneracion}
            />
            <DropdownForm
              required={true}
              name="idMoneda"
              control={control}
              error={errors.idMoneda}
              options={
                currencyValues?.map((currency) => ({
                  value: currency.num1,
                  label: currency.string1,
                })) || []
              }
              flex={true}
            />
          </FormRow>

          <DropdownForm
            required={true}
            name="idModalidad"
            control={control}
            label="Modalidad"
            error={errors.idModalidad}
            options={
              modalityValues?.map((modality) => ({
                value: modality.num1,
                label: modality.string1,
              })) || []
            }
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
            <button
              type="submit"
              className={`btn ${
                isDirty ? "btn-primary" : "btn-disabled"
              }`}
              disabled={!isDirty}
            >
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
