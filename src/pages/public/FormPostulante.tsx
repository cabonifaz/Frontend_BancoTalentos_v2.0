import { useForm } from "react-hook-form";
import { InputForm } from "../../core/components/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddPostulanteSchema, AddPostulanteType, BaseResponse } from "../../core/models";
import { useApi } from "../../core/hooks/useApi";
import { handleError, handleResponse } from "../../core/utilities/errorHandler";
import { enqueueSnackbar } from "notistack";
import { addPostulanteService } from "../../core/services/apiService";
import { Loading } from "../../core/components";
import { useRef } from "react";

export const FormPostulante = () => {
    const registerRef = useRef(false);

    const { loading: loadingAddPostulante, fetch: addPostulante, } = useApi<BaseResponse, AddPostulanteType>(addPostulanteService, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    const { control, handleSubmit, formState: { errors, isDirty, isValid }, reset } = useForm<AddPostulanteType>({
        resolver: zodResolver(AddPostulanteSchema),
        mode: "onTouched",
        defaultValues: {
            nombres: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            dni: "",
            celular: "",
            email: "",
            disponibilidad: "",
        }
    });

    const onSubmit = (data: AddPostulanteType) => {
        // addPostulante(data).then((response) => {
        //     if (response.data.idMensaje === 2) {
        //         localStorage.removeItem("tempToken");
        //         registerRef.current = true;
        //         reset();
        //     }
        // });

        console.log(data);

    };

    return (
        <>
            {loadingAddPostulante && <Loading opacity="opacity-60" />}
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
                                <InputForm name="nombres" control={control} label="Nombres" error={errors.nombres} />
                                <InputForm name="apellidoPaterno" control={control} label="Apellido Paterno" error={errors.apellidoPaterno} />
                                <InputForm name="apellidoMaterno" control={control} label="Apellido Materno" error={errors.apellidoMaterno} />
                                <InputForm name="dni" control={control} label="DNI" type="text" error={errors.dni} />
                                <InputForm name="celular" control={control} label="Celular" error={errors.celular} />
                                <InputForm name="email" control={control} label="Correo personal" error={errors.email} />
                                <InputForm name="disponibilidad" control={control} label="Disponibilidad" error={errors.disponibilidad} />

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={!isDirty || !isValid || registerRef.current}
                                        className={`w-full py-3 px-4 rounded-md text-white font-medium transition-all duration-300
                                        ${(!isDirty || !isValid)
                                                ? 'bg-gray-400 cursor-not-allowed'
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