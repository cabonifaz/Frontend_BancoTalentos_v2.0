import { useForm } from "react-hook-form";
import { DropdownForm, FormRow, InputForm } from "../../core/components/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddPostulanteParams, AddPostulanteSchema, AddPostulanteType, AddTalentParams, BaseResponseFMI, InsertUpdateResponse } from "../../core/models";
import { useApi } from "../../core/hooks/useApi";
import { handleError, handleResponse } from "../../core/utilities/errorHandler";
import { enqueueSnackbar } from "notistack";
import { addPostulanteService, addTalent } from "../../core/services/apiService";
import { Loading } from "../../core/components";
import { useEffect, useRef } from "react";
import { useParamContext } from "../../core/context/ParamsContext";

export const FormPostulante = () => {
    const registerRef = useRef(false);
    const { paramsByMaestro, loading: loadingParams, fetchParams } = useParamContext();

    const { loading: loadingAddPostulante, fetch: addPostulante, } = useApi<BaseResponseFMI, AddPostulanteParams>(addPostulanteService, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    const { loading: loadingAddTalent, fetch: addNewTalent, } = useApi<InsertUpdateResponse, AddTalentParams>(addTalent, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: false, enqueueSnackbar: enqueueSnackbar }),
    });

    useEffect(() => {
        const requiredParams = [5, 2, 3];

        if (requiredParams.some(key => !paramsByMaestro[key]) && !loadingParams) {
            fetchParams(requiredParams.join(","));
        }
    }, [fetchParams, loadingParams, paramsByMaestro]);

    const timeValues = paramsByMaestro[5];
    const currencyValues = paramsByMaestro[2];
    const modalityValues = paramsByMaestro[3];

    const { control, handleSubmit, formState: { errors, isDirty, isValid }, reset } = useForm<AddPostulanteType>({
        resolver: zodResolver(AddPostulanteSchema),
        mode: "onTouched",
        defaultValues: {
            nombres: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            dni: "",
            telefono: "",
            email: "",
            disponibilidad: "",
            tiempoContrato: 0,
            idTiempoContrato: 0,
            fechaInicioLabores: "",
            cargo: "",
            remuneracion: 0,
            idMoneda: 0,
            idModalidad: 0,
            ubicacion: "",
        }
    });

    const onSubmit = (data: AddPostulanteType) => {
        const alreadyRegistered = registerRef.current;

        if (alreadyRegistered) return;

        const talentData: any = {
            dni: data.dni,
            nombres: data.nombres,
            apellidoPaterno: data.apellidoPaterno,
            apellidoMaterno: data.apellidoMaterno,
            email: data.email,
            telefono: data.telefono,
            disponibilidad: data.disponibilidad,
            puesto: data.cargo,
            idMoneda: data.idMoneda,
        };

        if (data.idModalidad === 1) { // RxH
            talentData.montoInicialRxH = data.remuneracion;
            talentData.montoFinalRxH = data.remuneracion;
        } else if (data.idModalidad === 2) { // Planilla
            talentData.montoInicialPlanilla = data.remuneracion;
            talentData.montoFinalPlanilla = data.remuneracion;
        }

        addNewTalent(talentData).then((response) => {
            // on success register postulante in FMI
            if (response.data.idMensaje === 2) {
                const idTalent = response.data.idNuevo;
                const { disponibilidad, ...cleanData } = data;

                if (idTalent) {
                    addPostulante({
                        idTalento: idTalent,
                        ...cleanData
                    }).then((response) => {
                        if (response.data.idTipoMensaje === 2) {
                            localStorage.removeItem("tempToken");
                            localStorage.removeItem("authToken");
                            registerRef.current = true;
                            reset();
                        }
                    });
                }
            }
        });
    };

    return (
        <>
            {(loadingAddPostulante || loadingAddTalent) && <Loading opacity="opacity-60" />}
            <div className="relative min-h-screen p-4 bg-gray-50 overflow-hidden flex items-center justify-center">
                {/* Background geometric elements */}
                <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-[#FAAB34]/10"></div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#0B85C3]/10 rounded-lg rotate-12"></div>
                <div className="absolute top-1/4 -right-16 w-32 h-32 bg-[#FAAB34]/10 rotate-45"></div>

                <div className="relative max-w-2xl w-full mx-auto">
                    {/* Form container with integrated bottom border */}
                    <div className="relative pb-2">
                        <div className="border border-gray-200 border-b-0 rounded-t-lg shadow-sm p-8 bg-white relative z-10">
                            <div className="flex justify-center">
                                <img src="/assets/fractal-logo-BDT.png" alt="fractal logo" />
                            </div>
                            <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
                                Registro de Postulante
                                <span className="block mx-auto mt-2 w-24 h-1 bg-[#0B85C3] rounded-full"></span>
                            </h2>

                            <p className="text-center text-gray-600 mb-8">Complete sus datos personales para postular</p>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <InputForm required={true} name="nombres" control={control} label="Nombres" error={errors.nombres} />
                                <InputForm required={true} name="apellidoPaterno" control={control} label="Apellido Paterno" error={errors.apellidoPaterno} />
                                <InputForm required={true} name="apellidoMaterno" control={control} label="Apellido Materno" error={errors.apellidoMaterno} />
                                <InputForm required={true} word_wrap={true} name="dni" control={control} label="Documento de Identidad" type="text" error={errors.dni} />
                                <InputForm required={true} name="telefono" control={control} label="Celular" error={errors.telefono} />
                                <InputForm required={true} name="email" control={control} label="Correo personal" error={errors.email} />
                                <InputForm required={true} name="disponibilidad" control={control} label="Disponibilidad" error={errors.disponibilidad} />
                                <FormRow>
                                    <InputForm required={true} name="tiempoContrato" control={control} label="Tiempo contrato" type="number" error={errors.tiempoContrato} />
                                    <DropdownForm name="idTiempoContrato" control={control} error={errors.idTiempoContrato}
                                        options={timeValues?.map((time) => ({ value: time.num1, label: time.string1 })) || []}
                                        flex={true}
                                    />
                                </FormRow>
                                <InputForm required={true} name="fechaInicioLabores" control={control} label="Inicio de labores" type="date" error={errors.fechaInicioLabores} />
                                <InputForm required={true} name="cargo" control={control} label="Cargo" type="text" error={errors.cargo} />
                                <FormRow>
                                    <InputForm required={true} name="remuneracion" control={control} label="Remuneración" type="number" error={errors.remuneracion} />
                                    <DropdownForm name="idMoneda" control={control} error={errors.idMoneda}
                                        options={currencyValues?.map((currency) => ({ value: currency.num1, label: currency.string1 })) || []}
                                        flex={true}
                                    />
                                </FormRow>

                                <DropdownForm name="idModalidad" control={control} label="Modalidad" error={errors.idModalidad}
                                    options={modalityValues?.map((modality) => ({ value: modality.num1, label: modality.string1 })) || []}
                                />
                                <InputForm required={true} name="ubicacion" control={control} label="Ubicación" error={errors.ubicacion} />

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={!isDirty || !isValid || registerRef.current}
                                        className={`w-full py-3 px-4 rounded-md text-white font-medium transition-all duration-300
                                        ${(!isDirty || !isValid)
                                                ? 'btn-disabled'
                                                : 'bg-[#0B85C3] hover:bg-[#0a7ab4] shadow-md hover:shadow-lg'}`}
                                    >
                                        Registrarse
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Integrated bottom border */}
                        <div className="h-2 bg-gradient-to-r from-[#FAAB34] to-[#0B85C3] rounded-b-lg"></div>
                    </div>

                    {/* Additional geometric elements outside form */}
                    <div className="absolute -bottom-40 left-1/4 w-20 h-20 bg-[#0B85C3]/10 rounded-lg rotate-45"></div>
                    <div className="absolute top-1/3 -left-12 w-16 h-16 bg-[#FAAB34]/10 rotate-12"></div>
                </div>
            </div>
        </>
    );
}