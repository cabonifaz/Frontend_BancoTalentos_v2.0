import { useCallback, useEffect, useRef, useState } from "react";
import { ReqListParams, RequerimientosResponse, RequirementItem } from "../../core/models";
import { useParamContext } from "../../core/context/ParamsContext";
import { BaseOption, DateFilter, FilterDropDown, Loading, ModalDetallesRQ } from "../../core/components";
import { useApi } from "../../core/hooks/useApi";
import { handleError, handleResponse } from "../../core/utilities/errorHandler";
import { ClientListResponse } from "../../core/models/response/ClientsResponse";
import { getClients, getRequirements } from "../../core/services/apiService";
import { enqueueSnackbar } from "notistack";
import { format } from 'date-fns';
import { Dashboard } from "./Dashboard";

interface SearchProps {
    idCliente: number | null;
    codigoRQ: string | null;
    estado: number | null;
    fechaSolicitud: string | null;
}

export const Requirements = () => {
    // const navigate = useNavigate();
    const RequerimientoRef = useRef<HTMLInputElement>(null);
    const hasFetchedClients = useRef(false);
    const hasFetchedReqs = useRef(false);

    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [selectedEstado, setSelectedEstado] = useState<number | null>(null);
    const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isDetallesRQModalOpen, setIsDetallesRQModalOpen] = useState(false);
    const [selectedRQ, setSelectedRQ] = useState<RequirementItem | null>(null);

    const { paramsByMaestro, loading: loadingParams, fetchParams } = useParamContext();

    const {
        loading: loadingClientes,
        data: clientesResponse,
        fetch: fetchClients,
    } = useApi<ClientListResponse, null>(getClients, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: false, enqueueSnackbar: enqueueSnackbar }),
    });

    const {
        loading: loadingReqs,
        data: ReqsResponse,
        fetch: fetchRequerimientos,
    } = useApi<RequerimientosResponse, ReqListParams>(getRequirements, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: false, enqueueSnackbar: enqueueSnackbar }),
    });

    const paramOptions: BaseOption[] = paramsByMaestro[24]?.map((param) => ({
        value: param.num1.toString(),
        label: param.string1,
    })) || [];

    const clientOptions: BaseOption[] = clientesResponse?.clientes.filter((client) => client.total > 0).map((client) => ({
        value: client.idCliente.toString(),
        label: client.razonSocial,
    })) || [];

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const search = ({ idCliente, codigoRQ, estado, fechaSolicitud }: SearchProps) => {
        fetchRequerimientos({
            nPag: 1,
            idCliente: idCliente,
            codigoRQ: codigoRQ,
            estado: estado,
            fechaSolicitud: fechaSolicitud,
        });
    };

    const handleEstadoChangeFilter = (selectedValues: string[]) => {
        const newValue = selectedValues[0] ? Number(selectedValues[0]) : null;
        setSelectedEstado(newValue);
        executeSearch({
            estado: newValue,
            fechaSolicitud: selectedDate ? selectedDate : null,
        });
    };

    const handleClienteChangeFilter = (selectedValues: string[]) => {
        const newValue = selectedValues[0] ? Number(selectedValues[0]) : null;
        setSelectedCliente(newValue);
        executeSearch({
            estado: selectedEstado,
            fechaSolicitud: selectedDate ? selectedDate : null,
            idCliente: newValue
        });
    };

    const handleDateSelected = (date: Date | null) => {
        if (date !== null) {
            const searchDate = format(new Date(date), 'yyyy/MM/dd')
            setSelectedDate(searchDate);
            executeSearch({
                estado: selectedEstado,
                fechaSolicitud: date ? searchDate : null,
            });
        }
    };

    const executeSearch = useCallback((overrides: { estado?: number | null; fechaSolicitud?: string | null; idCliente?: number | null } = {}) => {
        if (!loadingReqs) {
            search({
                idCliente: overrides.idCliente !== undefined ? overrides.idCliente : selectedCliente,
                codigoRQ: RequerimientoRef.current?.value || null,
                estado: overrides.estado !== undefined ? overrides.estado : selectedEstado,
                fechaSolicitud: overrides.fechaSolicitud !== undefined ? overrides.fechaSolicitud : (selectedDate ? selectedDate : null),
            });
        }
    }, [loadingReqs, search, selectedCliente, selectedDate, selectedEstado]);

    useEffect(() => {
        if (!hasFetchedClients.current && !loadingClientes) {
            fetchClients(null);
            hasFetchedClients.current = true;
        }

        if (!hasFetchedReqs.current && !loadingReqs) {
            executeSearch();
            hasFetchedReqs.current = true;
        }
    }, [fetchClients, executeSearch, loadingClientes, loadingReqs]);

    useEffect(() => {
        const requiredParams = [24];

        if (requiredParams.some(key => !paramsByMaestro[key]) && !loadingParams) {
            fetchParams(requiredParams.join(","));
        }
    }, [fetchParams, loadingParams, paramsByMaestro]);

    const handleSearch = () => {
        executeSearch();
    };

    const openDetallesRQModal = (req: RequirementItem) => {
        setIsDetallesRQModalOpen(true);
        setSelectedRQ(req);
    }

    const updateRQData = () => {
        executeSearch();
        fetchClients(null);
    }

    const handleAsignarClick = (idRequerimiento: number) => {
        // navigate('/dashboard/tableAsignarTalento', { state: { idRequerimiento } });
    };

    return (
        <>
            {(loadingClientes || loadingParams || loadingReqs) && (<Loading opacity="opacity-60" />)}
            <Dashboard>
                <div className="p-4">
                    <h2 className="text-2xl font-semibold mb-4 flex gap-2">
                        Requerimientos
                    </h2>
                    {/* filters */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1">
                                    <label htmlFor="requerimiento" className="block text-sm font-medium text-gray-700">Requerimiento</label>
                                    <input
                                        type="text"
                                        name="requerimiento"
                                        id="requerimiento"
                                        ref={RequerimientoRef}
                                        className="mt-1 block w-full rounded-md border border-zinc-300 shadow-sm focus:outline-none sm:text-sm px-4 py-2"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <FilterDropDown
                                    name="cliente"
                                    label="Cliente"
                                    options={clientOptions}
                                    optionsType="radio"
                                    optionsPanelSize="w-36"
                                    inputPosition="right"
                                    isOpen={openDropdown === 0}
                                    onToggle={() => setOpenDropdown(openDropdown === 0 ? null : 0)}
                                    selectedValues={selectedCliente ? [selectedCliente.toString()] : []}
                                    onChange={handleClienteChangeFilter}
                                />
                                <FilterDropDown
                                    name="estado"
                                    label="Estado"
                                    options={paramOptions}
                                    optionsType="radio"
                                    optionsPanelSize="w-36"
                                    inputPosition="right"
                                    isOpen={openDropdown === 1}
                                    onToggle={() => setOpenDropdown(openDropdown === 1 ? null : 1)}
                                    selectedValues={selectedEstado ? [selectedEstado.toString()] : []}
                                    onChange={handleEstadoChangeFilter}
                                />
                                <DateFilter label="Seleccionar fecha" onDateSelected={handleDateSelected} />
                            </div>
                            <div className="flex justify-start">
                                <button
                                    type="button"
                                    onClick={handleSearch}
                                    className="bg-zinc-600 rounded-lg px-4 py-2 text-white hover:bg-zinc-700 transition duration-200">
                                    Buscar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-x-auto max-w-full">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Cliente</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Requerimiento</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Fecha Solicitud</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Estado</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Vacantes</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {ReqsResponse?.requerimientos === undefined || ReqsResponse.requerimientos.length < 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No hay requerimientos disponibles.
                                        </td>
                                    </tr>
                                ) : (
                                    ReqsResponse?.requerimientos.map((req) => (
                                        <tr key={req.idRequerimiento}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.idRequerimiento}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.cliente}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.codigoRQ}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.fechaSolicitud}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.estado}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.vacantes}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button
                                                    onClick={() => handleAsignarClick(req.idRequerimiento)}
                                                    className="bg-blue-500 text-white rounded-lg px-3 py-1 mr-2 hover:bg-blue-600 transition duration-200">
                                                    Asignar
                                                </button>
                                                <button
                                                    onClick={() => openDetallesRQModal(req)}
                                                    className="bg-[#009688] text-white rounded-lg px-3 py-1 hover:bg-[#359c92] transition duration-200">
                                                    Detalles
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Dashboard>
            {isDetallesRQModalOpen && <ModalDetallesRQ onClose={() => setIsDetallesRQModalOpen(false)} estadoOptions={paramsByMaestro[24] || []} RQ={selectedRQ} clientes={clientesResponse?.clientes || []} updateRQData={updateRQData} />}
        </>
    );
}