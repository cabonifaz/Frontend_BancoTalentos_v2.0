import { format } from 'date-fns';
import { useEffect, useState } from "react";
import { useApi } from '../../hooks/useApi';
import { enqueueSnackbar } from 'notistack';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Client } from '../../models/interfaces/Client';
import { handleError, handleResponse } from '../../utilities/errorHandler';
import { getRequirementById } from '../../services/apiService';
import { addFilesSchema, AddFilesSchemaType, newRQSchema, newRQSchemaType, Param, RequirementItem, RequirementResponse } from '../../models';
import { Tabs } from '../ui/Tabs';
import { Loading } from '../ui/Loading';

interface Archivo {
    idRequerimientoArchivo: number;
    name: string;
    size: number;
    file: File;
}

interface Props {
    onClose: () => void;
    updateRQData: () => void;
    RQ: RequirementItem | null;
    estadoOptions: Param[];
    clientes: Client[];
}

export const ModalDetallesRQ = ({ onClose, updateRQData, estadoOptions, RQ, clientes }: Props) => {
    const [isEditing, setIsEditing] = useState(false);

    const { loading: loadingReq, data: requirementResponse } = useApi<RequirementResponse, number>(getRequirementById, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: false, enqueueSnackbar: enqueueSnackbar }),
        autoFetch: true,
        params: RQ?.idRequerimiento || 0,
    });

    const { register, setValue, formState: { errors }, } = useForm<newRQSchemaType>({
        resolver: zodResolver(newRQSchema),
        defaultValues: {
            idCliente: "",
            fechaSolicitud: "",
            descripcion: "",
            idEstado: 0,
            vacantes: 0,
            lstArchivos: [],
        },
    });

    const { setValue: setValueFiles, } = useForm<AddFilesSchemaType>({
        resolver: zodResolver(addFilesSchema),
        defaultValues: {
            lstArchivos: [],
        },
    });

    useEffect(() => {
        if (requirementResponse?.requerimiento) {
            setValue("idCliente", requirementResponse.requerimiento.idCliente.toString());
            setValue("codigoRQ", requirementResponse.requerimiento.codigoRQ);
            setValue("fechaSolicitud", format(new Date(requirementResponse.requerimiento.fechaSolicitud), 'yyyy-MM-dd'));
            setValue("descripcion", requirementResponse.requerimiento.descripcion);
            setValue("idEstado", requirementResponse.requerimiento.idEstado);
            setValue("vacantes", requirementResponse.requerimiento.vacantes);

            const archivosFormateados = requirementResponse.requerimiento.lstRqArchivo.map((archivo) => ({
                idRequerimientoArchivo: archivo.idRequerimientoArchivo,
                name: archivo.nombreArchivo,
                size: 0,
                file: new File([], archivo.nombreArchivo),
            }));

            setValueFiles("lstArchivos", archivosFormateados);
        }
    }, [requirementResponse?.requerimiento, setValue, setValueFiles]);

    const handleCancelClick = () => {
        setIsEditing(false);
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
                <div className="bg-white rounded-lg shadow-lg p-4 w-full md:w-[90%] lg:w-[1000px] h-[530px] overflow-y-auto relative">
                    <button className="absolute top-4 right-4 w-6 h-6" onClick={handleCancelClick}>
                        <img src="/assets/ic_close_x.svg" alt="icon close" />
                    </button>
                    <Tabs
                        tabs={[
                            {
                                label: "Detalles RQ",
                                children: (
                                    <div>
                                        {loadingReq ? (<p className="text-gray-500 text-center">Cargando Requerimiento...</p>) : (
                                            <form className="flex flex-col flex-1 mt-8">
                                                {/* Campos del formulario */}
                                                <div className="space-y-4 flex-1 px-4">
                                                    {/* Cliente */}
                                                    <div className="flex items-center">
                                                        <label className="w-1/3 text-sm font-medium text-gray-700">Cliente:</label>
                                                        <select
                                                            {...register("idCliente")}
                                                            disabled={!isEditing}
                                                            className="w-2/3 input"
                                                        >
                                                            <option value="">Elige un cliente</option>
                                                            {clientes.map((cliente) => (
                                                                <option key={cliente.idCliente} value={cliente.idCliente}>
                                                                    {cliente.razonSocial}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {errors.idCliente && (
                                                        <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.idCliente.message}</p>
                                                    )}

                                                    {/* Código RQ */}
                                                    <div className="flex items-center">
                                                        <label className="w-1/3 text-sm font-medium text-gray-700">Código RQ:</label>
                                                        <input
                                                            {...register("codigoRQ")}
                                                            disabled={!isEditing}
                                                            className="w-2/3 input"
                                                        />
                                                    </div>
                                                    {errors.codigoRQ && (
                                                        <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.codigoRQ.message}</p>
                                                    )}

                                                    {/* Fecha de Solicitud */}
                                                    <div className="flex items-center">
                                                        <label className="w-1/3 text-sm font-medium text-gray-700">Fecha de Solicitud:</label>
                                                        <input
                                                            type="date"
                                                            disabled={!isEditing}
                                                            className="w-2/3 input"
                                                        />
                                                    </div>
                                                    {errors.fechaSolicitud && (
                                                        <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.fechaSolicitud.message}</p>
                                                    )}

                                                    {/* Descripción */}
                                                    <div className="flex items-center">
                                                        <label className="w-1/3 text-sm font-medium text-gray-700">Descripción:</label>
                                                        <textarea
                                                            {...register("descripcion")}
                                                            disabled={!isEditing}
                                                            className="w-2/3 input resize-none"
                                                        />
                                                    </div>
                                                    {errors.descripcion && (
                                                        <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.descripcion.message}</p>
                                                    )}

                                                    {/* Estado */}
                                                    <div className="flex items-center">
                                                        <label className="w-1/3 text-sm font-medium text-gray-700">Estado:</label>
                                                        <select
                                                            {...register("idEstado")}
                                                            disabled={!isEditing}
                                                            className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            {estadoOptions.map((option) => (
                                                                <option key={option.num1} value={option.num1}>
                                                                    {option.string1}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {errors.idEstado && (
                                                        <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.idEstado.message}</p>
                                                    )}

                                                    {/* Vacantes */}
                                                    <div className="flex items-center">
                                                        <label className="w-1/3 text-sm font-medium text-gray-700">Vacantes:</label>
                                                        <input
                                                            type="number"
                                                            {...register("vacantes", { valueAsNumber: true })}
                                                            onFocus={(e) => e.target.select()}
                                                            disabled={!isEditing}
                                                            min={0}
                                                            className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                    {errors.vacantes && (
                                                        <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.vacantes.message}</p>
                                                    )}
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                label: "Postulantes",
                                children: (
                                    <div className="p-1">
                                        <div className="bg-white rounded-lg shadow-md overflow-auto max-w-full max-h-[445px]">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Nombres</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Apellidos</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">DNI</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Celular</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Email</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Situación</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {requirementResponse?.requerimiento.lstRqTalento.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                                                No hay postulantes disponibles.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        requirementResponse?.requerimiento.lstRqTalento.map((talento) => (
                                                            <tr key={talento.idTalento}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{talento.nombresTalento}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{talento.apellidosTalento}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{talento.dni}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{talento.celular}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{talento.email}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{talento.situacion}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{talento.estado}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ),
                            },
                        ]}
                    />
                </div>
            </div>
        </>
    );
};