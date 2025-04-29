import { format } from 'date-fns';
import { useEffect, useMemo, useState } from "react";
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

    const totalVacantes = requirementResponse?.requerimiento.lstRqVacantes.reduce((total, vacante) => total + (vacante?.cantidad || 0), 0) || 0;

    const circleClass = useMemo(() => {
        if (totalVacantes > 99) return 'w-8 h-8 text-xs';
        if (totalVacantes > 9) return 'w-7 h-7 text-sm';
        return 'w-6 h-6 text-sm';
    }, [totalVacantes]);

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
                <div className="bg-white rounded-lg shadow-lg p-4 w-full md:w-[90%] lg:w-[1000px] h-[530px] overflow-y-auto relative">
                    <button className="absolute top-4 right-4 w-6 h-6 z-50" onClick={handleCancelClick}>
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
                                                            {...register("fechaSolicitud")}
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
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                ),
                            },
                            {
                                label: "Cliente",
                                children: (
                                    <>
                                        {/* Cliente */}
                                        <div className="flex items-center">
                                            <label className="text-sm font-medium text-gray-700">Cliente:</label>
                                            <select
                                                {...register("idCliente", { valueAsNumber: true })}
                                                disabled={true}
                                                aria-readonly={true}
                                                className="px-3 py-2 border-none outline-none appearance-none"
                                            >
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

                                        <div className="flex items-center justify-between">
                                            <h2 className="text-sm font-medium text-gray-700">Lista de contactos</h2>
                                        </div>

                                        <div className="mt-4 max-h-[30vh] overflow-y-auto">
                                            <div className="table-container">
                                                <div className="table-wrapper">
                                                    <table className="table">
                                                        <thead>
                                                            <tr className="table-header">
                                                                <th scope="col" className="table-header-cell">ID</th>
                                                                <th scope="col" className="table-header-cell">Nombres</th>
                                                                <th scope="col" className="table-header-cell">Apellidos</th>
                                                                <th scope="col" className="table-header-cell">Celular</th>
                                                                <th scope="col" className="table-header-cell">Correo</th>
                                                                <th scope="col" className="table-header-cell">Cargo</th>
                                                                <th scope="col" className="table-header-cell">Asignado</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {(requirementResponse?.requerimiento?.lstRqContactos || []).length <= 0 ? (
                                                                <tr>
                                                                    <td colSpan={8} className="table-empty">
                                                                        No hay contactos disponibles.
                                                                    </td>
                                                                </tr>
                                                            ) : (requirementResponse?.requerimiento?.lstRqContactos?.map((contacto) => (
                                                                <tr key={contacto.idClienteContacto} className="table-row">
                                                                    <td className="table-cell">{contacto.idClienteContacto}</td>
                                                                    <td className="table-cell">{contacto.nombre}</td>
                                                                    <td className="table-cell">{contacto.apellidoPaterno + ' ' + contacto.apellidoMaterno}</td>
                                                                    <td className="table-cell">{contacto.telefono}</td>
                                                                    <td className="table-cell">{contacto.correo}</td>
                                                                    <td className="table-cell">{contacto.cargo}</td>
                                                                    <td className="table-cell">
                                                                        <input
                                                                            type="checkbox"
                                                                            name="contact-asig"
                                                                            id="contact-asig"
                                                                            checked={contacto.asignado === 1}
                                                                            readOnly={true}
                                                                            className="input-checkbox-readonly"
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )
                            },
                            {
                                label: (
                                    <p className="flex items-center gap-2">
                                        Vacantes
                                        <span className={`inline-flex items-center justify-center rounded-full bg-[var(--color-blue)] text-white ${circleClass}`}>
                                            {totalVacantes}
                                        </span>
                                    </p>
                                ),
                                children: (
                                    <div className="p-1">
                                        <div className="table-container">
                                            <div className="table-wrapper">
                                                <table className="table">
                                                    <thead>
                                                        <tr className="table-header">
                                                            <th scope="col" className="table-header-cell">ID</th>
                                                            <th scope="col" className="table-header-cell">Perfil profesional</th>
                                                            <th scope="col" className="table-header-cell">Cantidad</th>
                                                            <th scope="col" className="table-header-cell"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {requirementResponse?.requerimiento.lstRqVacantes.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={4} className="table-empty">
                                                                    No hay vacantes disponibles.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            requirementResponse?.requerimiento.lstRqVacantes.map((vacante) => (
                                                                <tr key={vacante.idRequerimientoVacante} className="table-row">
                                                                    <td className="table-cell">{vacante.idRequerimientoVacante}</td>
                                                                    <td className="table-cell">{vacante.perfilProfesional}</td>
                                                                    <td className="table-cell">{vacante.cantidad}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
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
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Doc. Identidad</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Celular</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Email</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Situación</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Estado</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Perfil</th>
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
                                                        requirementResponse?.requerimiento?.lstRqTalento?.map((talento) => (
                                                            <tr key={talento.idTalento}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{talento.nombresTalento}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{talento.apellidosTalento}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{talento.dni}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{talento.celular}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{talento.email}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{talento.situacion}</td>
                                                                <td className="table-cell">
                                                                    <span className={`badge ${talento.idEstado === 2 ? 'badge-green' : 'badge-yellow'}`}>
                                                                        {(talento?.estado).toUpperCase()}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{talento.perfil}</td>
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