import { useLocation, useNavigate } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Loading } from "../../core/components";
import BackButton from "../../core/components/ui/BackButton";
import { DropdownForm, FormRow, InputForm } from "../../core/components/forms";
import { useParamContext } from "../../core/context/ParamsContext";
import { Utils } from "../../core/utilities/utils";
import { useApi } from "../../core/hooks/useApi";
import { BaseResponseFMI, DataFormSchema, DataFormType, SaveTalentFMIParams, TalentoFMI } from "../../core/models";
import { handleError, handleResponse } from "../../core/utilities/errorHandler";
import { enqueueSnackbar } from "notistack";
import { saveTalentFMI } from "../../core/services/apiService";
import useFetchTalento from "../../core/hooks/useFetchTalento";

const PantallaDatos = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { talento } = location.state as { talento: TalentoFMI } || {};

    const { paramsByMaestro, loading: loadingParams, fetchParams } = useParamContext();
    const { talentoDetails, loading } = useFetchTalento(talento.idTalento); // fmi

    const { loading: loadingSaveTalent, fetch: saveTalent } = useApi<BaseResponseFMI, SaveTalentFMIParams>(saveTalentFMI, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    const goBack = () => navigate(-1);

    useEffect(() => {
        const requiredParams = [5, 2, 3];

        if (requiredParams.some(key => !paramsByMaestro[key]) && !loadingParams) {
            fetchParams(requiredParams.join(","));
        }
    }, [fetchParams, loadingParams, paramsByMaestro]);

    const timeValues = paramsByMaestro[5];
    const currencyValues = paramsByMaestro[2];
    const modalityValues = paramsByMaestro[3];


    const { control, handleSubmit, formState: { errors, isDirty }, reset } = useForm<DataFormType>({
        resolver: zodResolver(DataFormSchema),
        mode: "onTouched",
        defaultValues: {
            nombres: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            telefono: "",
            dni: "",
            email: "",
            tiempoContrato: 0,
            idTiempoContrato: 0,
            fechaInicioLabores: "",
            cargo: "",
            remuneracion: 0,
            idMoneda: 0,
            idModalidad: 0,
            ubicacion: ""
        }
    });

    useEffect(() => {
        if (talentoDetails) {
            reset({
                nombres: talentoDetails?.nombres || "",
                apellidoPaterno: talentoDetails?.apellidoPaterno || "",
                apellidoMaterno: talentoDetails?.apellidoMaterno || "",
                telefono: talentoDetails?.telefono || "",
                dni: talentoDetails?.dni || "",
                email: talentoDetails?.email || "",
                tiempoContrato: talentoDetails?.tiempoContrato || 0,
                idTiempoContrato: talentoDetails?.idTiempoContrato || 0,
                fechaInicioLabores: Utils.formatDateToDMY(talentoDetails?.fechaInicioLabores),
                cargo: talentoDetails?.cargo || "",
                remuneracion: talentoDetails?.remuneracion || 0,
                idMoneda: talentoDetails?.idMoneda || 0,
                idModalidad: talentoDetails?.idModalidad || 0,
                ubicacion: talentoDetails?.ubicacion || ""
            });
        }
    }, [talentoDetails, reset]);

    const saveData: SubmitHandler<DataFormType> = async (data) => {
        saveTalent({ idTalento: talento.idTalento, APELLIDO_PATERNO: talento.apellidoPaterno, ...data }).then((response) => {
            if (response.data.idTipoMensaje === 2) {
                goBack();
            }
        });
    }

    return (
        <>
            {loadingParams && (<Loading opacity='opacity-60' />)}
            {loading && (<Loading opacity='opacity-60' />)}
            {loadingSaveTalent && (<Loading opacity='opacity-60' />)}
            <div className="w-full lg:w-[65%] m-auto p-4 border-2 rounded-lg my-8">
                {/* Data form */}
                <form onSubmit={handleSubmit(saveData)} className="flex flex-col gap-8">
                    <h3 className="text-2xl font-semibold flex gap-2">
                        <BackButton backClicked={goBack} />
                        Datos Personales
                    </h3>
                    <InputForm name="nombres" control={control} label="Nombres" error={errors.nombres} />
                    <InputForm name="apellidoPaterno" control={control} label="Apellido Paterno" error={errors.apellidoPaterno} />
                    <InputForm name="apellidoMaterno" control={control} label="Apellido Materno" error={errors.apellidoMaterno} />
                    <InputForm name="telefono" control={control} label="Contacto" error={errors.telefono} />
                    <InputForm name="dni" control={control} label="DNI" type="text" error={errors.dni} />
                    <InputForm name="email" control={control} label="Correo personal" error={errors.email} />

                    <FormRow>
                        <InputForm name="tiempoContrato" control={control} label="Tiempo contrato" type="number" error={errors.tiempoContrato} />
                        <DropdownForm name="idTiempoContrato" control={control} error={errors.idTiempoContrato}
                            options={timeValues?.map((time) => ({ value: time.num1, label: time.string1 })) || []}
                            flex={true}
                        />
                    </FormRow>

                    <InputForm name="fechaInicioLabores" control={control} label="Inicio de labores" type="date" error={errors.fechaInicioLabores} />
                    <InputForm name="cargo" control={control} label="Cargo" type="text" error={errors.cargo} />

                    <FormRow>
                        <InputForm name="remuneracion" control={control} label="Remuneración" type="number" error={errors.remuneracion} />
                        <DropdownForm name="idMoneda" control={control} error={errors.idMoneda}
                            options={currencyValues?.map((currency) => ({ value: currency.num1, label: currency.string1 })) || []}
                            flex={true}
                        />
                    </FormRow>

                    <DropdownForm name="idModalidad" control={control} label="Modalidad" error={errors.idModalidad}
                        options={modalityValues?.map((modality) => ({ value: modality.num1, label: modality.string1 })) || []}
                    />
                    <InputForm name="ubicacion" control={control} label="Ubicación" error={errors.ubicacion} />

                    {/* Form options */}
                    <div className="flex justify-center gap-4">
                        <button type="button" className="w-40 bg-slate-600 rounded-lg text-white py-2 hover:bg-slate-500" onClick={goBack}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`w-40 rounded-lg text-white py-2 ${isDirty ? "bg-green-700 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"}`}
                            disabled={!isDirty}>
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default PantallaDatos;
