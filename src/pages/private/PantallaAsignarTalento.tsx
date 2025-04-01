import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { axiosInstanceFMI } from '../../core/services/axiosService';
import BackButton from '../../core/components/ui/BackButton';
import Toast from '../../core/components/ui/Toast';
import { Dashboard } from './Dashboard';
import { ESTADO_ATENDIDO } from '../../core/utilities/constants';
import { Loading } from '../../core/components';

// Types
type TalentoType = {
  idTalento: number;
  nombres: string;
  apellidos?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  dni: string;
  telefono?: string;
  celular?: string;
  email: string;
  estado?: string;
  idEstado?: number;
  situacion?: string;
  idSituacion?: number;
  confirmado?: boolean;
  isFromAPI?: boolean; // Nueva propiedad para identificar talentos cargados desde API
};

type RequerimientoType = {
  cliente: string;
  codigoRQ: string;
  fechaSolicitud: string;
  descripcion: string;
  idEstado: number;
  estado: string;
  vacantes: number;
  idRequerimiento?: number;
  lstRqTalento?: any[];
};

// Componentes
const TableHeader = () => (
  <thead>
    <tr className="bg-gray-100 text-gray-700 text-sm">
      <th className="py-3 px-4 text-left font-semibold">ID</th>
      <th className="py-3 px-4 text-left font-semibold">Nombres</th>
      <th className="py-3 px-4 text-left font-semibold">Apellidos</th>
      <th className="py-3 px-4 text-left font-semibold">DNI</th>
      <th className="py-3 px-4 text-left font-semibold">Cel</th>
      <th className="py-3 px-4 text-left font-semibold">Email</th>
      <th className="py-3 px-4 text-left font-semibold">Situación</th>
      <th className="py-3 px-4 text-left font-semibold">Estado</th>
      <th className="py-3 px-4 text-left font-semibold">Confirmado</th>
      <th className="py-3 px-4 text-left font-semibold">Acciones</th>
    </tr>
  </thead>
);

interface TableRowProps {
  talento: TalentoType;
  onRemove: (id: number) => void;
  onUpdate: (talento: TalentoType) => void;
  onConfirmChange: (talento: TalentoType, confirm: boolean) => void;
  disabled: boolean;
}

const TableRow: React.FC<TableRowProps> = ({
  talento,
  onRemove,
  onUpdate,
  onConfirmChange,
  disabled
}) => {
  const isConfirmedFromAPI = talento.isFromAPI && talento.confirmado;
  const isAceptado = talento.estado?.toUpperCase() === 'ACEPTADO' || talento.idEstado === 2;
  const isObservado = talento.estado?.toUpperCase() === 'OBSERVADO' || talento.idEstado === 1;

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
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-4 whitespace-nowrap">{talento.idTalento}</td>
      <td className="py-3 px-4 whitespace-nowrap">{talento.nombres}</td>
      <td className="py-3 px-4 whitespace-nowrap">
        {talento.apellidos || `${talento.apellidoPaterno || ''} ${talento.apellidoMaterno || ''}`}
      </td>
      <td className="py-3 px-4 whitespace-nowrap">{talento.dni}</td>
      <td className="py-3 px-4 whitespace-nowrap">{talento.telefono || talento.celular}</td>
      <td className="py-3 px-4 whitespace-nowrap">{talento.email}</td>
      <td className="py-3 px-4 whitespace-nowrap">
        {talento.situacion || (talento.idSituacion === 1 ? 'LIBRE' : 'OCUPADO')}
      </td>
      <td className="py-3 px-4 whitespace-nowrap">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isAceptado ? 'bg-green-100 text-green-800' :
          isObservado ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
          {(talento.estado || (talento.idEstado === 2 ? 'ACEPTADO' : 'OBSERVADO')).toUpperCase()}
        </span>
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-center">
        <input
          type="checkbox"
          checked={talento.confirmado || false}
          disabled={isConfirmedFromAPI || !isAceptado}
          onChange={handleCheckboxChange}
          className="input-checkbox"
        />
      </td>
      <td className="py-3 px-4 flex gap-2 whitespace-nowrap">
        <button
          onClick={() => onUpdate(talento)}
          disabled={disabled || isConfirmedFromAPI || !isObservado}
          className={`btn ${!disabled && !isConfirmedFromAPI && isObservado ? 'btn-blue' : 'btn-disabled'} text-sm`}
        >
          Actualizar
        </button>
        <button
          onClick={() => onRemove(talento.idTalento)}
          disabled={disabled || isConfirmedFromAPI}
          className={`btn ${disabled || isConfirmedFromAPI ? 'btn-disabled' : 'btn-red'} text-sm`}
        >
          Remover
        </button>
      </td>
    </tr>
  );
};

interface TalentoSelectionProps {
  talent: TalentoType;
  onSelect: (talent: TalentoType) => void;
  isSelected: boolean;
}

const TalentoSelection: React.FC<TalentoSelectionProps> = ({ talent, onSelect, isSelected }) => (
  <div className="flex items-center justify-between p-4 border-b">
    <div>
      <p className="font-medium">{talent.nombres} {talent.apellidoPaterno} {talent.apellidoMaterno}</p>
    </div>
    <button
      onClick={() => onSelect(talent)}
      disabled={isSelected}
      className={`btn ${isSelected ? 'btn-disabled' : 'btn-blue'}`}
    >
      {isSelected ? 'Seleccionado' : 'Seleccionar'}
    </button>
  </div>
);

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTalents: TalentoType[];
  selectedTalents: TalentoType[];
  onSelectTalent: (talent: TalentoType) => void;
  onSearch: (term: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading: boolean;
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
  isLoading
}) => {
  const handleClearSearch = () => {
    setSearchTerm('');
    onSearch('');
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
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-4 border-b">
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
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
            <div className="p-4 text-center text-gray-500">
              Cargando talentos...
            </div>
          ) : availableTalents.length > 0 ? (
            availableTalents.map((talent) => (
              <TalentoSelection
                key={talent.idTalento}
                talent={talent}
                onSelect={onSelectTalent}
                isSelected={selectedTalents.some(t => t.idTalento === talent.idTalento)}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? "No se encontraron talentos con ese criterio de búsqueda" : "Ingrese un término para buscar talentos"}
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

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Confirmación</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="btn btn-outline-gray"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-blue"
          >
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
  const [localTalents, setLocalTalents] = useState<TalentoType[]>([]);
  const [searchResults, setSearchResults] = useState<TalentoType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requerimiento, setRequerimiento] = useState<RequerimientoType | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [dateFormatted, setDateFormatted] = useState('');
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const calculateRemainingVacancies = useCallback((talents: TalentoType[], req: RequerimientoType | null) => {
    if (!req) return 0;

    // Contar confirmados iniciales (desde API)
    const initialConfirmed = talents.filter(t => t.isFromAPI && t.confirmado).length;
    // Contar confirmados locales (no desde API)
    const localConfirmed = talents.filter(t => !t.isFromAPI && t.confirmado).length;

    return req.vacantes - initialConfirmed - localConfirmed;
  }, []);

  useEffect(() => {
    if (requerimiento) {
      setRemainingVacancies(calculateRemainingVacancies(localTalents, requerimiento));
    }
  }, [localTalents, requerimiento, calculateRemainingVacancies]);

  // Mostrar y ocultar Toast
  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
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
        `/fmi/requirement/data?idRequerimiento=${idRequerimiento}&showfiles=false`
      );

      if (response.data.idTipoMensaje === 2) {
        setRequerimiento(response.data.requerimiento);

        // Formatear fecha
        if (response.data.requerimiento.fechaSolicitud) {
          const date = new Date(response.data.requerimiento.fechaSolicitud);
          setDateFormatted(date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }));
        }

        // Inicializar talentos desde API
        if (response.data.requerimiento.lstRqTalento?.length > 0) {
          const formattedTalents = response.data.requerimiento.lstRqTalento.map((talent: any) => ({
            idTalento: talent.idTalento,
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
            isFromAPI: true // Marcar como proveniente de API
          }));

          setLocalTalents(formattedTalents);
        }
      }
    } catch (error) {
      console.error('Error fetching requerimiento:', error);
      showToast('Error al cargar los datos del requerimiento', 'error');
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
        `/fmi/talent/requirement/list?nPag=1&busqueda=${term}`
      );

      if (response.data.idTipoMensaje === 2) {
        const formattedTalents = response.data.talentos.map((talent: any) => ({
          idTalento: talent.idTalento,
          nombres: talent.nombres,
          apellidoPaterno: talent.apellidoPaterno,
          apellidoMaterno: talent.apellidoMaterno,
          dni: talent.dni || '',
          email: talent.email || '',
          idEstado: 1,
          idSituacion: 1,
        }));

        setSearchResults(formattedTalents);
      }
    } catch (error) {
      console.error('Error searching talents:', error);
      showToast('Error al buscar talentos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Seleccionar talento
  const handleSelectTalent = async (talent: TalentoType) => {
    try {
      setIsLoading(true);
      const response = await axiosInstanceFMI.get(
        `/fmi/requirement/talents/data?idTalento=${talent.idTalento}`
      );

      let formattedTalent: TalentoType;

      if (response.data.idTipoMensaje === 2) {
        const talentDetails = response.data.talento;
        formattedTalent = {
          idTalento: talentDetails.idTalento,
          nombres: talentDetails.nombres,
          apellidos: talentDetails.apellidos || '',
          dni: talentDetails.dni || '',
          celular: talentDetails.celular || '',
          telefono: talentDetails.celular || '',
          email: talentDetails.email || '',
          estado: talentDetails.estado || 'OBSERVADO',
          idEstado: talentDetails.idEstado || 2,
          situacion: talentDetails.situacion || 'LIBRE',
          idSituacion: talentDetails.idSituacion || 1,
          confirmado: talentDetails.confirmado || false
        };
      } else {
        formattedTalent = formatTalentFromBasicData(talent);
      }

      setLocalTalents(prev => [...prev, formattedTalent]);
    } catch (error) {
      console.error('Error fetching talent details:', error);
      setLocalTalents(prev => [...prev, formatTalentFromBasicData(talent)]);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear talento con datos básicos
  const formatTalentFromBasicData = (talent: TalentoType): TalentoType => {
    return {
      idTalento: talent.idTalento,
      nombres: talent.nombres,
      apellidos: talent.apellidoPaterno && talent.apellidoMaterno ?
        `${talent.apellidoPaterno} ${talent.apellidoMaterno}` :
        talent.apellidos || '',
      dni: talent.dni || '',
      telefono: talent.telefono || talent.celular || '',
      celular: talent.telefono || talent.celular || '',
      email: talent.email || '',
      estado: talent.estado?.toUpperCase() || (talent.idEstado === 2 ? 'ACEPTADO' : 'OBSERVADO'),
      situacion: talent.situacion || (talent.idSituacion === 1 ? 'LIBRE' : 'OCUPADO'),
      idEstado: talent.idEstado || 1,
      idSituacion: talent.idSituacion || 1,
      confirmado: talent.confirmado || false
    };
  };

  // Manejar cambios en la confirmación
  const handleConfirmChange = (talento: TalentoType, confirm: boolean) => {
    // Si intenta confirmar pero no hay vacantes disponibles
    if (confirm && remainingVacancies <= 0) {
      showToast('No hay vacantes disponibles. Ya ha cubierto todas las vacantes.', 'error');
      return false;
    }

    setLocalTalents(prev =>
      prev.map(talent =>
        talent.idTalento === talento.idTalento
          ? { ...talent, confirmado: confirm }
          : talent
      )
    );

    // Mostrar mensaje informativo
    if (confirm) {
      showToast(`Talento confirmado. Vacantes restantes: ${remainingVacancies - 1}`, 'success');
    } else {
      showToast(`Confirmación cancelada. Vacantes restantes: ${remainingVacancies + 1}`, 'warning');
    }
  };

  // Remover talento
  const handleRemoveTalent = (id: number) => {
    setLocalTalents(prev => prev.filter(talent => talent.idTalento !== id));
  };

  // Actualizar talento
  const handleUpdateTalent = (talent: TalentoType) => {
    navigate('/dashboard/formDatos', { state: { talento: talent } });
  };

  // Verificar confirmación
  const handleConfirmOpen = () => {
    const acceptedTalents = localTalents.filter(
      talent => talent.estado?.toUpperCase() === 'ACEPTADO' || talent.idEstado === 2
    );

    if (acceptedTalents.length === 0) {
      showToast('Debe seleccionar al menos un talento con estado ACEPTADO para finalizar.', 'error');
      return;
    }

    if (acceptedTalents.length > (requerimiento?.vacantes || 0)) {
      showToast('No puede seleccionar más talentos ACEPTADOS que las vacantes disponibles.', 'error');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // Finalizar selección
  const handleFinalize = async () => {
    try {
      setIsLoading(true);

      const talentos = localTalents.map(talent => ({
        idTalento: talent.idTalento,
        nombres: talent.nombres,
        apellidos: talent.apellidos || `${talent.apellidoPaterno || ''} ${talent.apellidoMaterno || ''}`,
        dni: talent.dni,
        celular: talent.telefono || talent.celular || '',
        email: talent.email,
        idEstado: talent.idEstado || (talent.estado === 'ACEPTADO' ? 2 : 1),
        idSituacion: talent.idSituacion || (talent.situacion === 'LIBRE' ? 1 : 2),
        confirmado: talent.confirmado || false
      }));

      const payload = {
        idRequerimiento,
        lstTalentos: talentos
      };

      const response = await axiosInstanceFMI.post(
        '/fmi/requirement/talents/save',
        payload
      );

      if (response.data.idTipoMensaje === 2) {
        setIsConfirmModalOpen(false);
        showToast('Operación completada con éxito', 'success');
        fetchRequerimiento();
      } else {
        showToast(response.data.mensaje, 'error');
      }
    } catch (error) {
      console.error('Error saving talents:', error);
      showToast('Error al guardar los datos. Por favor, intente nuevamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Navegación
  const goBack = () => navigate(-1);

  // Validaciones
  const buttonsDisabled = requerimiento?.idEstado === ESTADO_ATENDIDO;
  const acceptedTalentsCount = localTalents.filter(t => t.estado?.toUpperCase() === 'ACEPTADO' || t.idEstado === 2).length;
  const canFinalize = acceptedTalentsCount > 0 && acceptedTalentsCount <= (requerimiento?.vacantes || 0) && !buttonsDisabled;

  return (
    <Dashboard>
      {isLoading && (<Loading opacity='opacity-60' />)}
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-semibold flex gap-2">
            <BackButton backClicked={goBack} />
            Módulo para búsqueda de talentos
          </h3>

          {/* Información del requerimiento */}
          <div className="bg-white shadow-md rounded-lg p-4 w-full">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-600"><span className="font-medium">Id:</span> {idRequerimiento}</p>
              <p className="text-sm text-gray-600"><span className="font-medium">Cliente:</span> {requerimiento?.cliente || 'Cargando...'}</p>
              <p className="text-sm text-gray-600"><span className="font-medium">Rq:</span> {requerimiento?.codigoRQ || 'Cargando...'}</p>
              <p className="text-sm text-gray-600"><span className="font-medium">Fecha Solicitud:</span> {dateFormatted || 'Cargando...'}</p>
              <p className="text-sm text-gray-600"><span className="font-medium">Estado:</span> {requerimiento?.estado || 'Cargando...'}</p>
              <p className="text-sm text-gray-600"><span className="font-medium">Vacantes:</span> {requerimiento?.vacantes || 'Cargando...'}</p>
            </div>
          </div>

          {/* Acciones principales */}
          <div className="flex justify-between w-full pb-4">
            <button
              onClick={() => {
                setSearchTerm('');
                setSearchResults([]);
                setIsModalOpen(true);
                handleSearch('');
              }}
              disabled={buttonsDisabled}
              className={`btn ${buttonsDisabled ? 'btn-disabled' : 'btn-blue'}`}
            >
              Agregar Talento
            </button>
            <button
              onClick={handleConfirmOpen}
              disabled={!canFinalize}
              className={`btn ${canFinalize ? 'btn-primary' : 'btn-disabled'}`}
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
                  localTalents.map(talento => (
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
        />

        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleFinalize}
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