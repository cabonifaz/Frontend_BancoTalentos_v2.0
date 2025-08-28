import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosInstanceFMI } from "../../core/services/axiosService";
import BackButton from "../../core/components/ui/BackButton";
import Toast from "../../core/components/ui/Toast";
import { Dashboard } from "./Dashboard";
import {
  ESTADO_ATENDIDO,
  ESTADO_CONFIRMADO,
  ESTADO_DATOS_COMPLETOS,
  ESTADO_OBSERVADO,
} from "../../core/utilities/constants";
import { Loading } from "../../core/components";
import { AsignarTalentoType, ReqVacante } from "../../core/models";
import { format, parseISO } from "date-fns";
import { ModalIngreso } from "../../core/components/modals/ModalIngreso";
import { ModalSolicitudEquipo } from "../../core/components/modals/ModalSolicitudEquipo";

// Types
type RequerimientoType = {
  idCliente: number;
  cliente: string;
  codigoRQ: string;
  fechaSolicitud: string;
  descripcion: string;
  idEstado: number;
  estado: string;
  vacantes: number;
  idRequerimiento?: number;
  lstRqTalento?: any[];
  lstRqVacantes?: ReqVacante[];
};

// Componentes
const TableHeader = () => (
  <thead>
    <tr className="table-header">
      <th className="table-header-cell">ID</th>
      <th className="table-header-cell">Nombres y apellidos</th>
      <th className="table-header-cell">Doc. Identidad</th>
      <th className="table-header-cell">Celular</th>
      <th className="table-header-cell">Correo</th>
      <th className="table-header-cell">Situación</th>
      <th className="table-header-cell">Estado</th>
      <th className="table-header-cell">Perfil</th>
      <th className="table-header-cell">Confirmado</th>
      <th className="table-header-cell">Acciones</th>
    </tr>
  </thead>
);

interface TableRowProps {
  talento: AsignarTalentoType;
  onRemove: (id: number) => void;
  onUpdate: (talento: AsignarTalentoType) => void;
  onConfirmChange: (talento: AsignarTalentoType, confirm: boolean) => void;
  disabled: boolean;
}

const TableRow: React.FC<TableRowProps> = ({
  talento,
  onRemove,
  onUpdate,
  onConfirmChange,
  disabled,
}) => {
  const isConfirmedFromAPI = talento.isFromAPI && talento.confirmado;
  const isAceptado =
    talento.estado?.toUpperCase() === "DATOS COMPLETOS" ||
    talento.idEstado === 2;
  const isObservado =
    talento.estado?.toUpperCase() === "OBSERVADO" || talento.idEstado === 1;

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Si ya está confirmado desde API o no es ACEPTADO, no hacer nada
    if (isConfirmedFromAPI || !isAceptado) return;

    // Intentar cambiar el estado
    const newValue = e.target.checked;
    onConfirmChange(talento, newValue);

    // Forzar el estado del checkbox si no se pudo cambiar
    if (newValue !== talento.confirmado) {
      e.target.checked = !!talento.confirmado;
    }
  };

  return (
    <tr className="bg-white divide-y divide-gray-200">
      <td className="table-cell">{talento.idTalento}</td>
      <td className="table-cell">
        {talento.nombres}{" "}
        {talento.apellidos ||
          `${talento.apellidoPaterno || ""} ${talento.apellidoMaterno || ""}`}
      </td>
      <td className="table-cell">{talento.dni}</td>
      <td className="table-cell">{talento.celular}</td>
      <td className="table-cell">{talento.email}</td>
      <td className="table-cell">
        <div className="min-w-full flex justify-center gap-1 items-center">
          <p>{talento?.situacion || ""}</p>
          {talento.idSituacion === 2 && (
            <div className="w-fit relative group">
              <img
                src="/assets/ic_error.svg"
                alt="icon tooltip ocupado"
                className="min-w-5 min-h-5 w-5 h-5 cursor-pointer"
              />
              <div className="absolute invisible group-hover:visible z-10 left-full top-1/2 transform -translate-y-1/2 mr-2 px-2 py-1 text-xs bg-[#484848] text-white rounded whitespace-nowrap">
                <p className="text-start">{talento?.tooltip || ""}</p>
                <div className="absolute top-1/2 right-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-[#484848]"></div>
              </div>
            </div>
          )}
        </div>
      </td>
      <td className="table-cell">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isAceptado
              ? "bg-green-100 text-green-800"
              : isObservado
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
          }`}
        >
          {(
            talento.estado ||
            (talento.idEstado === 2 ? "DATOS COMPLETOS" : "OBSERVADO")
          ).toUpperCase()}
        </span>
      </td>
      <td className="table-cell">{talento?.perfil}</td>
      <td className="table-cell text-center">
        <input
          type="checkbox"
          checked={talento.confirmado || false}
          disabled={
            isConfirmedFromAPI ||
            !isAceptado ||
            disabled ||
            talento?.idSituacion === 2
          }
          onChange={handleCheckboxChange}
          className={
            isConfirmedFromAPI ||
            !isAceptado ||
            disabled ||
            talento?.idSituacion === 2
              ? "input-checkbox-readonly"
              : "input-checkbox"
          }
        />
      </td>
      <td className="py-3 px-4 flex gap-2 whitespace-nowrap">
        <button
          onClick={() => onUpdate(talento)}
          disabled={disabled || isConfirmedFromAPI || !isObservado}
          className={`btn ${!disabled && !isConfirmedFromAPI && isObservado ? "btn-blue" : "btn-disabled"} text-sm`}
        >
          Actualizar
        </button>
        <button
          onClick={() => onRemove(talento.idTalento)}
          disabled={disabled || isConfirmedFromAPI}
          className={`btn ${disabled || isConfirmedFromAPI ? "btn-disabled" : "btn-red"} text-sm`}
        >
          Remover
        </button>
      </td>
    </tr>
  );
};

interface TalentoSelectionProps {
  talent: AsignarTalentoType;
  perfil: string;
  idPerfil: number;
  onSelect: (
    talent: AsignarTalentoType,
    perfil: string,
    idPerfil: number,
  ) => void;
  isSelected: boolean;
  isPerfilSet: boolean;
}

const TalentoSelection: React.FC<TalentoSelectionProps> = ({
  talent,
  onSelect,
  isSelected,
  idPerfil,
  perfil,
  isPerfilSet,
}) => (
  <div className="flex items-center justify-between p-4 border-b">
    <div>
      <p className="font-medium">
        {talent.nombres} {talent.apellidoPaterno} {talent.apellidoMaterno}
      </p>
    </div>
    <button
      onClick={() => onSelect(talent, perfil, idPerfil)}
      disabled={isSelected || !isPerfilSet}
      className={`btn ${isSelected || !isPerfilSet ? "btn-disabled" : "btn-blue"}`}
    >
      {isSelected ? "Seleccionado" : "Seleccionar"}
    </button>
  </div>
);

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTalents: AsignarTalentoType[];
  selectedTalents: AsignarTalentoType[];
  onSelectTalent: (
    talent: AsignarTalentoType,
    perfil: string,
    idPerfil: number,
  ) => void;
  onSearch: (term: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading: boolean;
  lstRqVacantes: ReqVacante[];
}

const SelectionModal: React.FC<SelectionModalProps> = ({
  isOpen,
  onClose,
  availableTalents,
  selectedTalents,
  onSelectTalent,
  onSearch,
  searchTerm,
  setSearchTerm,
  isLoading,
  lstRqVacantes,
}) => {
  const [idPerfil, setIdPerfil] = useState<number>(0);
  const [perfil, setPerfil] = useState<string>("");

  useEffect(() => {
    if (lstRqVacantes.length === 1) {
      setIdPerfil(lstRqVacantes[0].idPerfil);
      setPerfil(lstRqVacantes[0].perfilProfesional);
    }
  }, [lstRqVacantes]);

  const handleClearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  const handleSearchSubmit = () => {
    onSearch(searchTerm);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Seleccione el talento</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div className="p-4 border-b flex flex-col">
          <div className="flex items-center pb-4">
            <label htmlFor="t-perfil" className="dropdown-label w-1/2">
              Perfil
            </label>
            <select
              id="t-perfil"
              className="dropdown text-sm"
              onChange={(e) => {
                setIdPerfil(Number(e.target.value));
                setPerfil(e.target.options[e.target.selectedIndex].text);
              }}
              defaultValue={idPerfil}
            >
              <option value={0}>Seleccione un perfil</option>
              {lstRqVacantes.map((vacante) => (
                <option key={vacante.idPerfil} value={vacante.idPerfil}>
                  {vacante.perfilProfesional}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Buscar por nombre"
                className="w-full px-4 py-2 border rounded-lg pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={handleSearchSubmit}
              className="ml-2 btn btn-primary"
            >
              Buscar
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-grow">
          {isLoading ? (
            <>
              <Loading opacity="opacity-60" />
              <div className="p-4 text-center text-gray-500">
                Cargando talentos...
              </div>
            </>
          ) : availableTalents.length > 0 ? (
            availableTalents.map((talent) => (
              <TalentoSelection
                key={talent.idTalento}
                talent={talent}
                onSelect={onSelectTalent}
                isSelected={selectedTalents.some(
                  (t) => t.idTalento === talent.idTalento,
                )}
                perfil={perfil}
                idPerfil={idPerfil}
                isPerfilSet={idPerfil !== 0}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchTerm
                ? "No se encontraron talentos con ese criterio de búsqueda"
                : "Ingrese un término para buscar talentos"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Confirmación</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="btn btn-outline-gray">
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn btn-blue">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

const TalentTable: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { idRequerimiento } = location.state || { idRequerimiento: 1 };
  const [remainingVacancies, setRemainingVacancies] = useState(0);

  // Estados
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localTalents, setLocalTalents] = useState<AsignarTalentoType[]>([]);
  const [searchResults, setSearchResults] = useState<AsignarTalentoType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [requerimiento, setRequerimiento] = useState<RequerimientoType | null>(
    null,
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [dateFormatted, setDateFormatted] = useState("");
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: "success" | "error" | "warning";
  } | null>(null);
  const [currentTalento, setCurrentTalento] =
    useState<AsignarTalentoType | null>(null);
  const [showModalIngreso, setShowModalIngreso] = useState(false);
  const [showModalSolicitudEquipo, setShowModalSolicitudEquipo] =
    useState(false);

  const calculateRemainingVacancies = useCallback(
    (talents: AsignarTalentoType[], req: RequerimientoType | null) => {
      if (!req) return 0;

      // Contar confirmados iniciales (desde API)
      const initialConfirmed = talents.filter(
        (t) => t.isFromAPI && t.confirmado,
      ).length;
      // Contar confirmados locales (no desde API)
      const localConfirmed = talents.filter(
        (t) => !t.isFromAPI && t.confirmado,
      ).length;

      return req.vacantes - initialConfirmed - localConfirmed;
    },
    [],
  );

  useEffect(() => {
    if (requerimiento) {
      setRemainingVacancies(
        calculateRemainingVacancies(localTalents, requerimiento),
      );
    }
  }, [localTalents, requerimiento, calculateRemainingVacancies]);

  // Mostrar y ocultar Toast
  const showToast = (
    message: string,
    type: "success" | "error" | "warning",
  ) => {
    setToastMessage({ message, type });
  };

  const closeToast = () => {
    setToastMessage(null);
  };

  // Obtener datos del requerimiento
  const fetchRequerimiento = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstanceFMI.get(
        `/fmi/requirement/data?idRequerimiento=${idRequerimiento}&showfiles=false&showVacantesList=true&showContactList=false`,
      );

      if (response.data.idTipoMensaje === 2) {
        setRequerimiento(response.data.requerimiento);

        // Formatear fecha
        if (response.data.requerimiento.fechaSolicitud) {
          const date = response.data.requerimiento.fechaSolicitud;
          setDateFormatted(format(parseISO(date), "dd/MM/yyyy"));
        }

        // Inicializar talentos desde API
        if (response.data.requerimiento.lstRqTalento?.length > 0) {
          const formattedTalents = response.data.requerimiento.lstRqTalento.map(
            (talent: any) => ({
              idTalento: talent.idTalento,
              idCliente: response.data.requerimiento.idCliente || 0,
              nombres: talent.nombresTalento,
              apellidos: talent.apellidosTalento,
              dni: talent.dni,
              telefono: talent.celular,
              celular: talent.celular,
              email: talent.email,
              estado: talent.estado,
              idEstado: talent.idEstado,
              situacion: talent.situacion,
              idSituacion: talent.idSituacion,
              confirmado: talent.confirmado,
              tooltip: talent.tooltip,
              tieneEquipo: talent.tieneEquipo,
              idPerfil: talent.idPerfil,
              perfil: talent.perfil,
              // comfirmed from api
              isFromAPI: talent.confirmado ? true : false,
            }),
          );

          setLocalTalents(formattedTalents);
        }
      }
    } catch (error) {
      console.error("Error fetching requerimiento:", error);
      showToast("Error al cargar los datos del requerimiento", "error");
    } finally {
      setIsLoading(false);
    }
  }, [idRequerimiento]);

  useEffect(() => {
    fetchRequerimiento();
  }, [fetchRequerimiento]);

  // Buscar talentos
  const handleSearch = async (term: string) => {
    try {
      setIsLoading(true);
      const response = await axiosInstanceFMI.get(
        `/fmi/talent/requirement/list?nPag=1&busqueda=${term}`,
      );

      if (response.data.idTipoMensaje === 2) {
        const formattedTalents = response.data.talentos.map((talent: any) => ({
          idTalento: talent.idTalento,
          idCliente: requerimiento?.idCliente,
          nombres: talent.nombres,
          apellidoPaterno: talent.apellidoPaterno,
          apellidoMaterno: talent.apellidoMaterno,
          dni: talent.dni || "",
          email: talent.email || "",
          idEstado: talent.idEstado || 1,
          idSituacion: talent.idSituacion || 1,
          tooltip: talent.tooltip || "",
          idPerfil: talent.idPerfil || 0,
          perfil: talent.perfil || "",
        }));

        setSearchResults(formattedTalents);
      }
    } catch (error) {
      console.error("Error searching talents:", error);
      showToast("Error al buscar talentos", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Seleccionar talento
  const handleSelectTalent = async (
    talent: AsignarTalentoType,
    perfil: string,
    idPerfil: number,
  ) => {
    try {
      setIsLoading(true);
      const response = await axiosInstanceFMI.get(
        `/fmi/requirement/talents/data?idTalento=${talent.idTalento}&idRequerimiento=${idRequerimiento}`,
      );

      let formattedTalent: AsignarTalentoType;

      if (response.data.idTipoMensaje === 2) {
        const talentDetails = response.data.talento;
        formattedTalent = {
          idTalento: talentDetails.idTalento,
          idCliente: requerimiento?.idCliente,
          nombres: talentDetails.nombres,
          apellidos: talentDetails.apellidos || "",
          dni: talentDetails.dni || "",
          celular: talentDetails.celular || "",
          email: talentDetails.email || "",
          estado: talentDetails.estado || "OBSERVADO",
          idEstado: talentDetails.idEstado || 1,
          situacion: talentDetails.situacion || "LIBRE",
          idSituacion: talentDetails.idSituacion || 1,
          confirmado: talentDetails.confirmado || false,
          // comfirmed from api
          isFromAPI: talentDetails.confirmado ? true : false,
          tooltip: talentDetails.tooltip || "",
          idPerfil: idPerfil,
          perfil: perfil,
          tieneEquipo: talentDetails.tieneEquipo || 0,
        };
      } else {
        formattedTalent = formatTalentFromBasicData(talent);
      }

      setLocalTalents((prev) => [...prev, formattedTalent]);
      await handleFinalize({
        talents: [...localTalents, formattedTalent],
        flagCorreo: false,
      });
    } catch (error) {
      console.error("Error fetching talent details:", error);
      setLocalTalents((prev) => [...prev, formatTalentFromBasicData(talent)]);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear talento con datos básicos
  const formatTalentFromBasicData = (
    talent: AsignarTalentoType,
  ): AsignarTalentoType => {
    return {
      idTalento: talent.idTalento,
      idCliente: requerimiento?.idCliente,
      nombres: talent.nombres,
      apellidos:
        talent.apellidoPaterno && talent.apellidoMaterno
          ? `${talent.apellidoPaterno} ${talent.apellidoMaterno}`
          : talent.apellidos || "",
      dni: talent.dni || "",
      celular: talent.celular || "",
      email: talent.email || "",
      estado: talent.estado || "",
      situacion: talent.situacion || "",
      idEstado: talent.idEstado || 1,
      idSituacion: talent.idSituacion || 1,
      tooltip: talent.tooltip || "",
      idPerfil: talent.idPerfil || 0,
      perfil: talent.perfil || "",
      confirmado: talent.confirmado || false,
    };
  };

  // Manejar cambios en la confirmación
  const handleConfirmChange = (
    talento: AsignarTalentoType,
    confirm: boolean,
  ) => {
    // Si intenta confirmar pero no hay vacantes disponibles
    if (confirm && remainingVacancies <= 0) {
      showToast(
        "No hay vacantes disponibles. Ya ha cubierto todas las vacantes.",
        "error",
      );
      return false;
    }

    if (confirm) {
      setCurrentTalento(talento);
      setShowModalIngreso(true);
      return;
    }

    setLocalTalents((prev) =>
      prev.map((talent) =>
        talent.idTalento === talento.idTalento
          ? { ...talent, confirmado: confirm, isFromAPI: false, ingreso: 0 }
          : talent,
      ),
    );
    showToast(
      `Confirmación cancelada. Vacantes restantes: ${remainingVacancies + 1}`,
      "warning",
    );
  };

  // Remover talento
  const handleRemoveTalent = (id: number) => {
    setLocalTalents((prev) => prev.filter((talent) => talent.idTalento !== id));
  };

  // Actualizar talento
  const handleUpdateTalent = (talent: AsignarTalentoType) => {
    navigate("/dashboard/formDatos", { state: { talento: talent } });
  };

  // Verificar confirmación
  const handleConfirmOpen = () => {
    const acceptedTalents = localTalents.filter(
      (talent) => talent.idEstado === 2,
    );

    if (acceptedTalents.length === 0) {
      showToast(
        "Debe seleccionar al menos un talento con estado DATOS COMPLETOS para finalizar.",
        "error",
      );
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // Finalizar selección
  const handleFinalize = async ({
    talents,
    flagCorreo,
  }: {
    talents?: AsignarTalentoType[];
    flagCorreo: boolean;
  }) => {
    try {
      setIsLoading(true);
      const talentsToUse = talents || localTalents;

      const talentos = talentsToUse.map((talent) => ({
        idTalento: talent.idTalento,
        nombres: talent.nombres,
        apellidos:
          talent.apellidos ||
          talent.apellidoPaterno + " " + talent.apellidoMaterno ||
          "",
        dni: talent.dni,
        celular: talent.celular || "",
        email: talent.email,
        idEstado: !talent.confirmado
          ? talent.idEstado ||
            (talent.estado === "DATOS COMPLETOS"
              ? ESTADO_DATOS_COMPLETOS
              : ESTADO_OBSERVADO)
          : ESTADO_CONFIRMADO,
        idSituacion:
          talent.idSituacion || (talent.situacion === "LIBRE" ? 1 : 2),
        idPerfil: talent.idPerfil || 0,
        confirmado: talent.confirmado || false,

        ingreso: talent.ingreso || 0,
        idCliente: requerimiento?.idCliente || 0,
        cliente: requerimiento?.cliente || "",
        idArea: talent.idArea || 0,
        area: talent.area || "",
        cargo: talent.cargo || "",
        fchInicioContrato: talent.fchInicioContrato || "",
        fchTerminoContrato: talent.fchTerminoContrato || "",
        proyectoServicio: talent.proyectoServicio || "",
        objetoContrato: talent.objetoContrato || "",
        // remuneracion: talent.remuneracion || 0,
        idModalidadContrato: talent.idModalidadContrato || 0,
        horario: talent.horario || "",
        tieneEquipo: talent.tieneEquipo || 0,
        // idTiempoContrato: talent.idTiempoContrato || 0,
        // tiempoContrato: talent.tiempoContrato || 0,
        ubicacion: talent.ubicacion || "",
        idMotivo: talent.idMotivo || 0,
        idMoneda: talent.idMoneda || 1,
        declararSunat: talent.declararSunat || 0,
        sedeDeclarar: talent.sedeDeclarar || "",
        montoBase: talent.montoBase || 0,
        montoMovilidad: talent.montoMovilidad || 0,
        montoTrimestral: talent.montoTrimestral || 0,
        montoSemestral: talent.montoSemestral || 0,
        // isFromApi: talent?.isFromAPI,

        solicitudEquipo: talent?.solicitudEquipo || null,
      }));

      const payload = {
        idRequerimiento,
        flagCorreo: flagCorreo,
        lstTalentos: talentos,
      };

      const response = await axiosInstanceFMI.post(
        "/fmi/requirement/talents/save",
        payload,
      );

      if (response.data.idTipoMensaje === 2) {
        setIsConfirmModalOpen(false);
        showToast("Operación completada con éxito", "success");
        fetchRequerimiento();
      } else {
        showToast(response.data.mensaje, "error");
      }
    } catch (error) {
      console.error("Error saving talents:", error);
      showToast(
        "Error al guardar los datos. Por favor, intente nuevamente.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Navegación
  const goBack = () => navigate(-1);

  // Validaciones
  const buttonsDisabled = requerimiento?.idEstado === ESTADO_ATENDIDO;

  const handleModalIngresoClose = () => {
    setShowModalIngreso(false);
  };

  const handleModalSolicitudEquipoClose = () => {
    setShowModalSolicitudEquipo(false);
  };

  const handleModalSolicitudEquipoCancel = (talento: AsignarTalentoType) => {
    setLocalTalents((prevTalents) =>
      prevTalents.map((t) => (t.idTalento === talento.idTalento ? talento : t)),
    );
    setShowModalIngreso(false);
  };

  const handleOnConfirmModalIngreso = (talento: AsignarTalentoType) => {
    if (talento?.tieneEquipo === 0) {
      setCurrentTalento(talento);
      setShowModalSolicitudEquipo(true);
      return;
    } else {
      setLocalTalents((prevTalents) =>
        prevTalents.map((t) =>
          t.idTalento === talento.idTalento ? talento : t,
        ),
      );

      showToast(
        `Talento confirmado. Vacantes restantes: ${remainingVacancies - 1}`,
        "success",
      );
    }
  };

  const handleOnConfirmModalSolicitudEquipo = (talento: AsignarTalentoType) => {
    setLocalTalents((prevTalents) =>
      prevTalents.map((t) => (t.idTalento === talento.idTalento ? talento : t)),
    );

    showToast(
      `Talento confirmado. Vacantes restantes: ${remainingVacancies - 1}`,
      "success",
    );
  };

  return (
    <Dashboard>
      {isLoading && <Loading opacity="opacity-60" />}
      {showModalIngreso && (
        <ModalIngreso
          onConfirm={handleOnConfirmModalIngreso}
          currentTalent={currentTalento}
          onClose={handleModalIngresoClose}
        />
      )}
      {showModalSolicitudEquipo && (
        <ModalSolicitudEquipo
          onConfirm={handleOnConfirmModalSolicitudEquipo}
          onCancel={handleModalSolicitudEquipoCancel}
          currentTalent={currentTalento}
          onClose={handleModalSolicitudEquipoClose}
        />
      )}
      <div className="p-4">
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-semibold flex gap-2">
            <BackButton backClicked={goBack} />
            Módulo para búsqueda de talentos
          </h3>

          {/* Información del requerimiento */}
          <div className="bg-white shadow-md rounded-lg p-4 w-full">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Id:</span> {idRequerimiento}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Cliente:</span>{" "}
                {requerimiento?.cliente || "Cargando..."}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Rq:</span>{" "}
                {requerimiento?.codigoRQ || "Cargando..."}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Fecha Solicitud:</span>{" "}
                {dateFormatted || "Cargando..."}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Estado:</span>{" "}
                {requerimiento?.estado || "Cargando..."}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Vacantes: </span>
                {`${requerimiento?.lstRqVacantes?.map((vacante) => `${vacante.cantidad} ${vacante.perfilProfesional}`).join(", ") || "Cargando..."}`}
              </p>
            </div>
          </div>

          {/* Acciones principales */}
          <div className="flex justify-between w-full pb-4">
            <button
              onClick={() => {
                setSearchTerm("");
                setSearchResults([]);
                setIsModalOpen(true);
                handleSearch("");
              }}
              disabled={buttonsDisabled}
              className={`btn ${buttonsDisabled ? "btn-disabled" : "btn-blue"}`}
            >
              Agregar Talento
            </button>
            <button
              onClick={handleConfirmOpen}
              disabled={buttonsDisabled}
              className={`btn ${buttonsDisabled ? "btn-disabled" : "btn-primary"}`}
            >
              Finalizar
            </button>
          </div>
        </div>

        {/* Tabla de talentos */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <TableHeader />
              <tbody>
                {localTalents.length > 0 ? (
                  localTalents.map((talento) => (
                    <TableRow
                      key={talento.idTalento}
                      talento={talento}
                      onRemove={handleRemoveTalent}
                      onUpdate={handleUpdateTalent}
                      onConfirmChange={handleConfirmChange}
                      disabled={buttonsDisabled}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-4 text-center text-gray-500">
                      No hay talentos seleccionados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modales */}
        <SelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          availableTalents={searchResults}
          selectedTalents={localTalents}
          onSelectTalent={handleSelectTalent}
          onSearch={handleSearch}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isLoading={isLoading}
          lstRqVacantes={requerimiento?.lstRqVacantes || []}
        />

        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={() => handleFinalize({ flagCorreo: true })}
          message="¿Está seguro que desea finalizar y guardar los talentos seleccionados?"
        />

        {/* Notificaciones */}
        {toastMessage && (
          <Toast
            message={toastMessage.message}
            type={toastMessage.type}
            onClose={closeToast}
          />
        )}
      </div>
    </Dashboard>
  );
};

export default TalentTable;
