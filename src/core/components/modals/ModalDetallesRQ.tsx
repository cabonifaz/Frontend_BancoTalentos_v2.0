import { format } from 'date-fns';
import { useEffect, useState } from "react";
import { useApi } from '../../hooks/useApi';
import { enqueueSnackbar } from 'notistack';
import { Utils } from '../../utilities/utils';
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { Client } from '../../models/interfaces/Client';
import { handleError, handleResponse } from '../../utilities/errorHandler';
import { addReqFiles, deleteReqFile, getRequirementById, updateRequirement } from '../../services/apiService';
import { addFilesSchema, AddFilesSchemaType, AddReqFilesParams, BaseResponse, newRQSchema, newRQSchemaType, Param, RequirementItem, RequirementResponse, UpdateReqParams } from '../../models';
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
    const [archivos, setArchivos] = useState<Archivo[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState("");

    const { loading: loadingUpdateReq, fetch: updateReq } = useApi<BaseResponse, UpdateReqParams>(updateRequirement, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    const { loading: loadingReq, data: requirementResponse, fetch: fetchRequirement } = useApi<RequirementResponse, number>(getRequirementById, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: false, enqueueSnackbar: enqueueSnackbar }),
        autoFetch: true,
        params: RQ?.idRequerimiento || 0,
    });

    const { loading: loadingDeleteFile, fetch: deleteFile } = useApi<BaseResponse, number>(deleteReqFile, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    const { loading: loadingAddFiles, fetch: addFiles } = useApi<BaseResponse, AddReqFilesParams>(addReqFiles, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<newRQSchemaType>({
        resolver: zodResolver(newRQSchema),
        defaultValues: {
            idCliente: "",
            fechaSolicitud: "",
            descripcion: "",
            estado: "pendiente",
            vacantes: 0,
            lstArchivos: [],
        },
    });

    const {
        handleSubmit: handleSubmitFiles,
        setValue: setValueFiles,
    } = useForm<AddFilesSchemaType>({
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
            setValue("estado", requirementResponse.requerimiento.estado.toString());
            setValue("vacantes", requirementResponse.requerimiento.vacantes);
            setClienteSeleccionado(requirementResponse.requerimiento.cliente);

            const archivosFormateados = requirementResponse.requerimiento.lstRqArchivo.map((archivo) => ({
                idRequerimientoArchivo: archivo.idRequerimientoArchivo,
                name: archivo.nombreArchivo,
                size: 0,
                file: new File([], archivo.nombreArchivo),
            }));

            setArchivos(archivosFormateados);
            setValueFiles("lstArchivos", archivosFormateados);
        }
    }, [requirementResponse?.requerimiento, setValue, setValueFiles]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const nuevosArchivos = Array.from(event.target.files).map((file) => ({
                idRequerimientoArchivo: 0,
                name: file.name,
                size: file.size,
                file,
            }));

            setArchivos((prevArchivos) => [...prevArchivos, ...nuevosArchivos]);
            setValueFiles("lstArchivos", nuevosArchivos, { shouldValidate: true });
        }
    };

    const handleRemoveFile = async (index: number, idArchivo: number) => {
        const updatedArchivos = archivos.filter((_, i) => i !== index);

        if (idArchivo !== 0) {
            deleteFile(idArchivo).then((response) => {
                if (response.data.idMensaje === 2) {
                    fetchRequirement(RQ?.idRequerimiento || 0);
                }
            });
            return;
        }
        setArchivos(updatedArchivos);
        setValueFiles("lstArchivos", updatedArchivos, { shouldValidate: true });
    };

    const handleClienteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedClienteId = event.target.value;
        const selectedClienteText = clientes.find(cliente => cliente.idCliente === Number(selectedClienteId))?.razonSocial || "";
        setClienteSeleccionado(selectedClienteText);
        setValue("idCliente", selectedClienteId);
    };

    const onSubmitAddFiles: SubmitHandler<AddFilesSchemaType> = async (data) => {
        if (RQ) {
            // new files only
            const nuevosArchivos = data.lstArchivos.filter((archivo) => archivo.idRequerimientoArchivo === 0);

            const lstArchivos = await Promise.all(
                nuevosArchivos.map(async (archivo) => {
                    const base64 = await Utils.fileToBase64(archivo.file);
                    const { nombreArchivo, extensionArchivo } = Utils.getFileNameAndExtension(archivo.name);
                    const idTipoArchivo = Utils.getTipoArchivoId(extensionArchivo);
                    return {
                        string64: base64,
                        nombreArchivo,
                        extensionArchivo,
                        idTipoArchivo,
                    };
                }) || []
            );

            const payload: AddReqFilesParams = {
                idRequerimiento: RQ.idRequerimiento,
                lstArchivos: lstArchivos,
            }

            addFiles(payload).then((response) => {
                if (response.data.idMensaje === 2) {
                    fetchRequirement(RQ.idRequerimiento);
                }
            });
        }
    };

    const onSubmit: SubmitHandler<newRQSchemaType> = async (data) => {
        try {
            const estadoNumber = Number(data.estado);
            const idCliente = Number(data.idCliente);

            const { lstArchivos, ...cleanData } = data;

            if (RQ) {
                const payload = {
                    ...cleanData,
                    idRequerimiento: RQ.idRequerimiento,
                    idCliente: idCliente,
                    cliente: clienteSeleccionado,
                    estado: estadoNumber,
                };

                updateReq(payload).then((response) => {
                    if (response.data.idMensaje === 2) {
                        setIsEditing(false);
                        updateRQData();
                        onClose();
                    }
                });
            }
        } catch (error) {
            console.error("Error al transformar los datos:", error);
        }
    };

    const handleEditClick = () => {
        setIsEditing((prev) => !prev);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        onClose();
    };

    const newFiles = archivos.some((archivo) => archivo.idRequerimientoArchivo === 0);

    return (
        <>
            {(loadingAddFiles || loadingDeleteFile || loadingUpdateReq || loadingReq) && <Loading opacity='opacity-60' />}
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
                                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1">
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleEditClick}
                                                className="focus:outline-none"
                                            >
                                                <img src="/assets/ic_edit.svg" alt="Editar" className="w-5 h-5 my-1" />
                                            </button>
                                        </div>

                                        {/* Campos del formulario */}
                                        <div className="space-y-4 flex-1">
                                            {/* Cliente */}
                                            <div className="flex items-center">
                                                <label className="w-1/3 text-sm font-medium text-gray-700">Cliente:</label>
                                                <select
                                                    {...register("idCliente")}
                                                    disabled={!isEditing}
                                                    onChange={handleClienteChange}
                                                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                                    {...register("fechaSolicitud")}
                                                    disabled={!isEditing}
                                                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                />
                                            </div>
                                            {errors.descripcion && (
                                                <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.descripcion.message}</p>
                                            )}

                                            {/* Estado */}
                                            <div className="flex items-center">
                                                <label className="w-1/3 text-sm font-medium text-gray-700">Estado:</label>
                                                <select
                                                    {...register("estado")}
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
                                            {errors.estado && (
                                                <p className="text-red-500 text-sm mt-1 ml-[33%]">{errors.estado.message}</p>
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

                                        {/* Botones de acción */}
                                        <div className="flex justify-end space-x-4 mt-4">
                                            <button
                                                type="submit"
                                                disabled={!isEditing}
                                                className={`px-4 py-2 text-white rounded-md ${isEditing ? "bg-[#009688]  hover:bg-[#359c92]" : "bg-zinc-400"}`}
                                            >
                                                Actualizar
                                            </button>
                                        </div>
                                    </form>
                                ),
                            },
                            {
                                label: "Archivos",
                                children: (
                                    <div className="p-4 ">
                                        {/* Lista de archivos */}
                                        <div>
                                            <form onSubmit={handleSubmitFiles(onSubmitAddFiles)} className="flex flex-col">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-medium text-gray-700">Archivos elegidos:</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => document.getElementById("fileInput")?.click()}
                                                        className="text-blue-500 hover:text-blue-600 focus:outline-none"
                                                    >
                                                        Elegir archivos
                                                    </button>
                                                </div>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    id="fileInput"
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                                                />
                                                <div className="mt-2 max-h-80 overflow-y-auto">
                                                    {archivos.map((archivo, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-md mb-1"
                                                        >
                                                            <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                                                                {archivo.name}
                                                            </span>
                                                            {archivo.idRequerimientoArchivo === 0 && (
                                                                <span className="text-sm w-fit px-2 py-1 rounded-lg bg-green-100 text-green-700 truncate mr-2">
                                                                    Nuevo
                                                                </span>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveFile(index, archivo.idRequerimientoArchivo)}
                                                                className="text-red-500 hover:text-red-600 focus:outline-none"
                                                            >
                                                                <img src="/assets/ic_remove_fmi.svg" alt="icon close" className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={!newFiles}
                                                    className={`px-4 py-2 mt-4 w-fit self-end text-white rounded-md ${newFiles ? "bg-[#009688] hover:bg-[#359c92]" : "bg-zinc-400"
                                                        }`}>
                                                    Agregar archivos nuevos
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )
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
                            {
                                label: "Otros",
                                children: (
                                    <div className="p-4 space-y-4">
                                        <div className="flex items-center">
                                            <label className="w-1/3 text-sm font-medium text-gray-700">PPto:</label>
                                            <input
                                                type="text"
                                                placeholder="PPto"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                disabled
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <label className="w-1/3 text-sm font-medium text-gray-700">Duración:</label>
                                            <input
                                                type="text"
                                                placeholder="Duración"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                disabled
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <label className="w-1/3 text-sm font-medium text-gray-700">Moneda:</label>
                                            <input
                                                type="text"
                                                placeholder="Moneda"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                disabled
                                            />
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