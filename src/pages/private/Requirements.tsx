import { useCallback, useEffect, useRef, useState } from "react";
import { ReqListParams, RequerimientosResponse, RequirementItem } from "../../core/models";
import { useParams } from "../../core/context/ParamsContext";
import { BaseOption, DateFilter, FilterDropDown, Loading, ModalDetallesRQ } from "../../core/components";
import { useApi } from "../../core/hooks/useApi";
import { handleError, handleResponse } from "../../core/utilities/errorHandler";
import { ClientListResponse } from "../../core/models/response/ClientsResponse";
import { getClients, getRequirements } from "../../core/services/apiService";
import { enqueueSnackbar } from "notistack";
import { format } from 'date-fns';
import { Dashboard } from "./Dashboard";
import { useNavigate } from "react-router-dom";
import { ESTADO_ATENDIDO } from "../../core/utilities/constants";

interface SearchProps {
    nPag: number | null;
    idCliente: number | null;
    buscar: string | null;
    estado: number | null;
    fechaSolicitud: string | null;
}

export const Requirements = () => {
    const navigate = useNavigate();
    const RequerimientoRef = useRef<HTMLInputElement>(null);
    const hasFetchedClients = useRef(false);
    const hasFetchedReqs = useRef(false);

    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [selectedEstado, setSelectedEstado] = useState<number | null>(null);
    const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isDetallesRQModalOpen, setIsDetallesRQModalOpen] = useState(false);
    const [selectedRQ, setSelectedRQ] = useState<RequirementItem | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const { paramsByMaestro, loading: loadingParams } = useParams("24");

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
    const search = ({ nPag, idCliente, buscar, estado, fechaSolicitud }: SearchProps) => {
        fetchRequerimientos({
            nPag: nPag || 1,
            idCliente: idCliente,
            buscar: buscar,
            estado: estado,
            fechaSolicitud: fechaSolicitud,
        });
    };

    const handleEstadoChangeFilter = (selectedValues: string[]) => {
        const newValue = selectedValues[0] ? Number(selectedValues[0]) : null;
        setSelectedEstado(newValue);
        setCurrentPage(1);
        executeSearch({
            nPag: 1,
            estado: newValue,
            fechaSolicitud: selectedDate ? selectedDate : null,
        });
    };

    const handleClienteChangeFilter = (selectedValues: string[]) => {
        const newValue = selectedValues[0] ? Number(selectedValues[0]) : null;
        setSelectedCliente(newValue);
        setCurrentPage(1);
        executeSearch({
            nPag: 1,
            estado: selectedEstado,
            fechaSolicitud: selectedDate ? selectedDate : null,
            idCliente: newValue
        });
    };

    const handleDateSelected = (date: Date | null) => {
        let searchDate = null;
        if (date !== null) {
            searchDate = format(new Date(date), 'yyyy/MM/dd')
        }

        setSelectedDate(searchDate);
        setCurrentPage(1);
        executeSearch({
            nPag: 1,
            estado: selectedEstado,
            fechaSolicitud: date ? searchDate : null,
        });
    };

    const executeSearch = useCallback((overrides: { nPag?: number | null, estado?: number | null; fechaSolicitud?: string | null; idCliente?: number | null } = {}) => {
        if (!loadingReqs) {
            search({
                nPag: overrides.nPag || 1,
                idCliente: overrides.idCliente !== undefined ? overrides.idCliente : selectedCliente,
                buscar: RequerimientoRef.current?.value || null,
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

    const handleSearch = () => {
        setCurrentPage(1);
        executeSearch({ nPag: 1 });

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
        navigate('/dashboard/tableAsignarTalento', { state: { idRequerimiento } });
    };

    const getAlertIconPath = (idAlerta: number): string => {
        switch (idAlerta) {
            case 1:
                return "/assets/ic_success.svg"; // Alerta baja
            case 2:
                return "/assets/ic_warning.svg"; // Alerta media
            case 3:
                return "/assets/ic_error.svg"; // Alerta alta
            default:
                return "/assets/ic_success.svg";
        }
    }

    return (
        <>
            {(loadingClientes || loadingParams || loadingReqs) && (<Loading opacity="opacity-60" />)}
            <Dashboard>
                <div className="p-4 mx-4 xl:mx-16">
                    <h2 className="text-2xl font-semibold flex gap-2">
                        Requerimientos
                    </h2>
                    {/* filters */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2 lg:flex-row lg:gap-4">
                                <div className="flex-1 ">
                                    <label htmlFor="requerimiento" className="block text-sm font-medium text-gray-700">Búsqueda por título o código de requerimiento</label>
                                    <input
                                        type="text"
                                        name="requerimiento"
                                        id="requerimiento"
                                        ref={RequerimientoRef}
                                        className="input w-full"
                                    />

                                </div>
                                <button
                                    type="button"
                                    onClick={handleSearch}
                                    className="btn btn-primary lg:self-end p-3 h-12">
                                    Buscar
                                </button>
                            </div>
                            <div className="flex gap-4 flex-wrap">
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
                                <DateFilter label="Fecha" onDateSelected={handleDateSelected} />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-container">
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr className="table-header">
                                        <th className="table-header-cell">ID</th>
                                        <th className="table-header-cell">Cliente</th>
                                        <th className="table-header-cell">Título</th>
                                        <th className="table-header-cell">Requerimiento</th>
                                        <th className="table-header-cell">Fecha Solicitud</th>
                                        <th className="table-header-cell">Estado</th>
                                        <th className="table-header-cell">Confirmados / Vacantes</th>
                                        <th className="table-header-cell">Acciones</th>
                                        <th className="table-header-cell"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(ReqsResponse?.requerimientos || []).length <= 0 ? (
                                        <tr>
                                            <td colSpan={8} className="table-empty">
                                                No hay requerimientos disponibles.
                                            </td>
                                        </tr>
                                    ) : (
                                        ReqsResponse?.requerimientos?.map((req) => (
                                            <tr key={req.idRequerimiento} className="table-row">
                                                <td className="table-cell">{req.idRequerimiento}</td>
                                                <td className="table-cell">{req.cliente}</td>
                                                <td className="table-cell">{req.titulo}</td>
                                                <td className="table-cell">{req.codigoRQ}</td>
                                                <td className="table-cell">{req.fechaSolicitud}</td>
                                                <td className="table-cell">{req.estado}</td>
                                                <td className="table-cell text-center">
                                                    <div className="min-w-full flex justify-center">
                                                        <div className="w-fit relative group">
                                                            <p className=" px-2 py-1 rounded-lg bg-slate-100 w-fit">
                                                                {req.vacantesCubiertas} / {req.vacantes}
                                                            </p>
                                                            <div className="absolute invisible group-hover:visible z-10 right-full top-1/2 transform -translate-y-1/2 mr-2 px-2 py-1 text-xs bg-[#484848] text-white rounded whitespace-nowrap">
                                                                {req?.lstPerfiles?.map((perfil, index) => (
                                                                    <p className="text-start" key={index}>{perfil.vacantesCubiertas} / {perfil.vacantesTotales} {perfil.perfil}</p>
                                                                ))}
                                                                <div className="absolute top-1/2 left-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-[#484848]"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="table-cell">
                                                    <button
                                                        onClick={() => handleAsignarClick(req.idRequerimiento)}
                                                        disabled={req.idEstado === ESTADO_ATENDIDO}
                                                        className={`btn btn-actions ${req.idEstado === ESTADO_ATENDIDO ? 'btn-disabled' : 'btn-blue'}`}>
                                                        Asignar
                                                    </button>
                                                    <button
                                                        onClick={() => openDetallesRQModal(req)}
                                                        className="btn btn-actions btn-primary">
                                                        Detalles
                                                    </button>
                                                </td>
                                                <td className="table-cell">
                                                    {req?.idAlerta !== null && req?.idAlerta > 0 && (
                                                        <div className="relative inline-block group">
                                                            <img
                                                                src={getAlertIconPath(req.idAlerta)}
                                                                alt="icon estado alerta RQ"
                                                                className="w-5 h-5 cursor-pointer min-w-5 min-h-5"
                                                            />
                                                            <div className="absolute invisible group-hover:visible z-10 right-full top-1/2 transform -translate-y-1/2 mr-2 px-2 py-1 text-xs bg-[#484848] text-white rounded whitespace-nowrap">
                                                                Vence: {req.fechaVencimiento}
                                                                <div className="absolute top-1/2 left-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-[#484848]"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {(ReqsResponse?.requerimientos || []).length > 0 && (
                        <div className="flex justify-center items-center gap-4 mt-4 mb-2">
                            <button
                                className={`btn ${currentPage === 1 ? 'btn-disabled' : 'btn-blue'}`}
                                onClick={() => {
                                    const newPage = currentPage - 1;
                                    setCurrentPage(newPage);
                                    executeSearch({ nPag: newPage });
                                }}
                                disabled={currentPage === 1}>
                                Anterior
                            </button>
                            <span>Página {currentPage}</span>
                            <button
                                className={`btn ${(ReqsResponse?.requerimientos || []).length < 8 ? 'btn-disabled' : 'btn-blue'}`}
                                onClick={() => {
                                    const newPage = currentPage + 1;
                                    setCurrentPage(newPage);
                                    executeSearch({ nPag: newPage });
                                }}
                                disabled={(ReqsResponse?.requerimientos || []).length < 8}>
                                Siguiente
                            </button>
                        </div>
                    )}
                </div>
            </Dashboard>
            {isDetallesRQModalOpen && <ModalDetallesRQ onClose={() => setIsDetallesRQModalOpen(false)} estadoOptions={paramsByMaestro[24] || []} RQ={selectedRQ} clientes={clientesResponse?.clientes || []} updateRQData={updateRQData} />}
        </>
    );
}