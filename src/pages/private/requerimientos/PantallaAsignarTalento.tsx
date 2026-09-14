import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CircleAlert } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosInstanceFMI } from "@/core/services/axiosService";
import BackButton from "@/core/components/ui/BackButton";
import Toast from "@/core/components/ui/Toast";
import { Dashboard } from "@/pages/private/Dashboard";
import {
  ESTADO_ASIGNADO,
  ESTADO_ATENDIDO,
  ESTADO_CONFIRMADO,
  ESTADO_DATOS_COMPLETOS,
  ESTADO_OBSERVADO,
} from "@/core/utilities/constants";
import { Loading } from "@/core/components";
import {
  AsignarTalentoType,
  BlacklistValidation,
  ReqVacante,
} from "@/core/models";
import { validateBlacklist } from "@/core/services/blacklist.service";
import { format, parseISO, set } from "date-fns";
import { ModalIngreso } from "@/core/components/requerimientos/modals/ModalIngreso";
import { ModalSolicitudEquipo } from "@/core/components/requerimientos/modals/ModalSolicitudEquipo";
import { ModalRiesgoTalento } from "@/core/components/requerimientos/modals/ModalRiesgoTalento";
import { useFetchTarifario } from "@/core/hooks/requerimientos/useFetchTarifario";
import type { FilaBanda } from "@/core/utilities/riesgoTalento";
import { Button } from "@/core/components/ui/shadcn/button";
import { Input } from "@/core/components/ui/shadcn/input";
import { Label } from "@/core/components/ui/shadcn/label";
import { Checkbox } from "@/core/components/ui/shadcn/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/core/components/ui/shadcn/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/shadcn/table";
import { AppSelect } from "@/core/components/ui/AppSelect";
import { Hint } from "@/core/components/ui/Hint";

// Types
type RequerimientoType = {
  idCliente: number;
  cliente: string;
  titulo: string;
  codigoRQ: string;
  fechaSolicitud: string;
  descripcion: string;
  idEstado: number;
  estado: string;
  vacantes: number;
  idRequerimiento?: number;
  lstRqTalento?: any[];
  lstRqVacantes?: ReqVacante[];
  // La banda salarial del RQ ya viaja en la respuesta (SP_REQUERIMIENTO_SEL
  // invoca a SP_REQUERIMIENTO_FACTURACION_SEL); solo faltaba declararla.
  lstRqFacturacion?: FilaBanda[];
  duracionContrato?: number;
  idDuracionContrato?: number;
};

/**
 * Agrega el talento, o reemplaza su fila si ya existía. Remover marca la fila
 * con idEstadoRegistro = 0 en vez de sacarla de la lista, así que volver a
 * seleccionar al mismo talento debe revivir esa fila y no crear un duplicado
 * con el mismo idTalento.
 */
const upsertTalent = (
  talents: AsignarTalentoType[],
  talent: AsignarTalentoType
): AsignarTalentoType[] => {
  const index = talents.findIndex((t) => t.idTalento === talent.idTalento);
  if (index === -1) return [...talents, talent];
  const next = [...talents];
  next[index] = talent;
  return next;
};

// Componentes. Llevan el prefijo Talent para no chocar con TableHeader /
// TableRow de shadcn, que se usan dentro.
const TalentTableHeader = () => (
  <TableHeader>
    <TableRow className="table-header">
      <TableHead className="table-header-cell">ID</TableHead>
      <TableHead className="table-header-cell">Nombres y apellidos</TableHead>
      <TableHead className="table-header-cell">Doc. Identidad</TableHead>
      <TableHead className="table-header-cell">Celular</TableHead>
      <TableHead className="table-header-cell">Correo</TableHead>
      <TableHead className="table-header-cell">Situación</TableHead>
      <TableHead className="table-header-cell">Estado</TableHead>
      <TableHead className="table-header-cell">Perfil</TableHead>
      <TableHead className="table-header-cell">Confirmado</TableHead>
      <TableHead className="table-header-cell">Acciones</TableHead>
    </TableRow>
  </TableHeader>
);

interface TableRowProps {
  talento: AsignarTalentoType;
  onRemove: (id: number) => void;
  onUpdate: (talento: AsignarTalentoType) => void;
  onInterview: (talento: AsignarTalentoType) => void;
  onRisk: (talento: AsignarTalentoType) => void;
  onConfirmChange: (
    talento: AsignarTalentoType,
    confirm: boolean
  ) => void;
  disabled: boolean;
}

const TalentTableRow: React.FC<TableRowProps> = ({
  talento,
  onRemove,
  onUpdate,
  onInterview,
  onRisk,
  onConfirmChange,
  disabled,
}) => {
  const isConfirmedFromAPI = talento.isFromAPI && talento.confirmado;
  const isAceptado =
    talento.estado?.toUpperCase() === "DATOS COMPLETOS" ||
    talento.idEstado === 2;
  const isObservado =
    talento.estado?.toUpperCase() === "OBSERVADO" ||
    talento.idEstado === 1;

  // La casilla es controlada: solo cambia si el padre acepta el cambio. Antes,
  // cuando no lo aceptaba, había que forzar `e.target.checked` a mano.
  const handleCheckedChange = (checked: boolean) => {
    // Si ya está confirmado desde API o no es ACEPTADO, no hacer nada
    if (isConfirmedFromAPI || !isAceptado) return;
    onConfirmChange(talento, checked);
  };

  const nombreCompleto = `${talento.nombres} ${
    talento.apellidos ||
    `${talento.apellidoPaterno || ""} ${talento.apellidoMaterno || ""}`
  }`.trim();

  return (
    <TableRow className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
      <TableCell className="table-cell">{talento.idTalento}</TableCell>
      <TableCell className="table-cell">
        {talento.nombres}{" "}
        {talento.apellidos ||
          `${talento.apellidoPaterno || ""} ${
            talento.apellidoMaterno || ""
          }`}
      </TableCell>
      <TableCell className="table-cell">{talento.dni}</TableCell>
      <TableCell className="table-cell">{talento.celular}</TableCell>
      <TableCell className="table-cell">{talento.email}</TableCell>
      <TableCell className="table-cell">
        <div className="min-w-full flex justify-center gap-1 items-center">
          <p>{talento?.situacion || ""}</p>
          {talento.idSituacion === 2 && (
            // Era un tooltip hecho con group-hover: solo con ratón. Ahora el
            // icono es un botón y el motivo se lee también con teclado.
            <Hint label={talento?.tooltip || ""} side="right">
              <button
                type="button"
                aria-label="Ver motivo de la situación"
                className="w-fit"
              >
                <CircleAlert
                  className="min-w-5 min-h-5 w-5 h-5 cursor-pointer"
                  color="#ef4444"
                />
              </button>
            </Hint>
          )}
        </div>
      </TableCell>
      <TableCell className="table-cell">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isAceptado
              ? "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300"
              : isObservado
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300"
              : "bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-100"
          }`}
        >
          {(
            talento.estado ||
            (talento.idEstado === 2 ? "DATOS COMPLETOS" : "OBSERVADO")
          ).toUpperCase()}
        </span>
      </TableCell>
      <TableCell className="table-cell">{talento?.perfil}</TableCell>
      <TableCell className="table-cell text-center">
        <Checkbox
          aria-label={`Confirmar a ${nombreCompleto}`}
          checked={talento.confirmado || false}
          disabled={
            isConfirmedFromAPI || !isAceptado || disabled //||
            // talento?.idSituacion === 2
          }
          onCheckedChange={(checked) => handleCheckedChange(checked === true)}
          className={
            isConfirmedFromAPI ||
            !isAceptado ||
            disabled ||
            talento?.idSituacion === 2
              ? "cursor-default"
              : undefined
          }
        />
      </TableCell>
      <TableCell className="py-3 px-4 flex gap-2 whitespace-nowrap">
        <Button
          variant="blue"
          onClick={() => onUpdate(talento)}
          disabled={disabled || isConfirmedFromAPI || !isObservado}
          className="mx-1 text-sm"
        >
          Actualizar
        </Button>
        <Button
          variant="destructive"
          onClick={() => onRemove(talento.idTalento)}
          disabled={disabled || isConfirmedFromAPI}
          className="mx-1 text-sm"
        >
          Remover
        </Button>
        <Hint label="Comparar su pretensión salarial con la tarifa del perfil">
          <Button
            variant="yellow"
            onClick={() => onRisk(talento)}
            className="mx-1 gap-1.5 text-sm"
          >
            Calcular Riesgo
          </Button>
        </Hint>
        <Button onClick={() => onInterview(talento)} className="mx-1 text-sm">
          Entrevistar
        </Button>
      </TableCell>
    </TableRow>
  );
};

interface TalentoSelectionProps {
  talent: AsignarTalentoType;
  perfil: string;
  idPerfil: number;
  onSelect: (
    talent: AsignarTalentoType,
    perfil: string,
    idPerfil: number
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
  <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
    <div>
      <p className="font-medium">
        {talent.nombres} {talent.apellidoPaterno}{" "}
        {talent.apellidoMaterno}
      </p>
    </div>
    <Button
      variant="blue"
      onClick={() => onSelect(talent, perfil, idPerfil)}
      disabled={isSelected || !isPerfilSet}
      className="mx-1"
    >
      {isSelected ? "Seleccionado" : "Seleccionar"}
    </Button>
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
    idPerfil: number
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

  // Perfiles únicos: un RQ no debería repetir perfil, pero se deduplica por robustez
  // (evita opciones duplicadas y colisión de keys en el combo).
  const vacantesUnicas = useMemo(() => {
    const porPerfil = new Map<number, ReqVacante>();
    lstRqVacantes.forEach((v) => {
      if (!porPerfil.has(v.idPerfil)) porPerfil.set(v.idPerfil, v);
    });
    return Array.from(porPerfil.values());
  }, [lstRqVacantes]);

  useEffect(() => {
    if (vacantesUnicas.length === 1) {
      setIdPerfil(vacantesUnicas[0].idPerfil);
      setPerfil(vacantesUnicas[0].perfilProfesional);
    }
  }, [vacantesUnicas]);

  const handleClearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  const handleSearchSubmit = () => {
    onSearch(searchTerm);
  };

  if (!isOpen) return null;

  return (
    // Escape cierra como la X; un clic fuera no (como antes).
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="flex w-[calc(100%-2rem)] max-w-md max-h-[80vh] flex-col gap-0 p-0"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="p-4 border-b flex justify-between items-center dark:border-slate-700">
          <DialogTitle className="text-xl font-semibold">
            Seleccione el talento
          </DialogTitle>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-50"
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

        <div className="p-4 border-b flex flex-col dark:border-slate-700">
          <div className="flex items-center pb-4">
            <Label
              htmlFor="t-perfil"
              className="dropdown-label w-1/2"
            >
              Perfil
            </Label>
            <AppSelect
              id="t-perfil"
              className="text-sm"
              value={idPerfil}
              onChange={(v) => {
                const id = Number(v);
                setIdPerfil(id);
                setPerfil(
                  vacantesUnicas.find((vac) => vac.idPerfil === id)
                    ?.perfilProfesional ?? ""
                );
              }}
              options={vacantesUnicas.map((vacante) => ({
                value: vacante.idPerfil,
                label: vacante.perfilProfesional,
              }))}
              placeholder="Seleccione un perfil"
            />
          </div>
          <div className="flex items-center">
            <div className="relative flex-grow">
              <Input
                type="text"
                aria-label="Buscar talento por nombre"
                placeholder="Buscar por nombre"
                className="px-4 py-2 pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  aria-label="Limpiar búsqueda"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
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
            <Button onClick={handleSearchSubmit} className="ml-2 mr-1">
              Buscar
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto flex-grow">
          {isLoading ? (
            <>
              <Loading opacity="opacity-60" />
              <div className="p-4 text-center text-gray-500 dark:text-slate-400">
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
                  (t) => t.idTalento === talent.idTalento
                )}
                perfil={perfil}
                idPerfil={idPerfil}
                isPerfilSet={idPerfil !== 0}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-slate-400">
              {searchTerm
                ? "No se encontraron talentos con ese criterio de búsqueda"
                : "Ingrese un término para buscar talentos"}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface BlacklistWarningModalProps {
  validation: BlacklistValidation | null;
  talentName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Aviso al asignar un talento que está en la lista negra para el cliente del
 * requerimiento. No bloquea: informa y deja decidir.
 */
const BlacklistWarningModal: React.FC<BlacklistWarningModalProps> = ({
  validation,
  talentName,
  onCancel,
  onConfirm,
}) => {
  if (!validation) return null;

  const esGlobal = validation.idCliente === 0;

  return (
    // Escape equivale a Cancelar; un clic fuera no (como antes).
    <Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent
        className="block w-[calc(100%-2rem)] max-w-md p-6"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="text-xl font-semibold mb-4 text-red-700 dark:text-red-300">
          Talento restringido
        </DialogTitle>

        <div className="rounded-lg border border-red-300 bg-red-50 p-3 mb-4 dark:bg-red-500/10">
          <p className="text-sm text-red-800 dark:text-red-300">
            <span className="font-semibold">{talentName}</span> está en la lista
            negra{" "}
            {esGlobal ? (
              "para todos los clientes."
            ) : (
              <>
                para{" "}
                <span className="font-semibold">{validation.cliente}</span>.
              </>
            )}
          </p>
          {validation.motivo && (
            <p className="text-sm text-gray-700 mt-2 dark:text-slate-200">
              <span className="font-medium">Motivo: </span>
              {validation.motivo}
            </p>
          )}
        </div>

        <p className="mb-6 text-sm text-gray-700 dark:text-slate-200">
          ¿Desea asignarlo a este requerimiento de todas formas?
        </p>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onCancel} className="mx-1">
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="mx-1">
            Asignar igual
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
    // Antes iba a z-20, por DEBAJO del sidebar (z-40), que seguía clicable
    // detrás del overlay. El Dialog va a z-[60] como el resto.
    // Escape equivale a Cancelar; un clic fuera no (como antes).
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        aria-describedby="asignar-confirm-desc"
        className="block w-[calc(100%-2rem)] max-w-md p-6"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="text-xl font-semibold mb-4">Confirmación</DialogTitle>
        <DialogDescription id="asignar-confirm-desc" className="mb-6 text-base text-inherit">
          {message}
        </DialogDescription>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose} className="mx-1">
            Cancelar
          </Button>
          <Button variant="blue" onClick={onConfirm} className="mx-1">
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TalentTable: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { idRequerimiento } = location.state || {
    idRequerimiento: 1,
  };
  const [remainingVacancies, setRemainingVacancies] = useState(0);

  // Estados
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localTalents, setLocalTalents] = useState<
    AsignarTalentoType[]
  >([]);
  // Los datos del formulario de ingreso (cargo, horario, motivo, montos, proyecto,
  // objeto, solicitud de equipo...) solo viven en memoria: cada auto-guardado recarga
  // y los borra del talento. Se conserva aquí el talento confirmado por idTalento para
  // reenviarlo en "Finalizar" y no crear el HISTORIAL (ni el PDF) incompleto.
  const confirmedByTalento = useRef<Record<number, AsignarTalentoType>>({});
  const [searchResults, setSearchResults] = useState<
    AsignarTalentoType[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [requerimiento, setRequerimiento] =
    useState<RequerimientoType | null>(null);
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
  // Talento restringido a la espera de que el usuario decida si lo asigna.
  const [pendingRestricted, setPendingRestricted] = useState<{
    talent: AsignarTalentoType;
    perfil: string;
    idPerfil: number;
    validation: BlacklistValidation;
  } | null>(null);
  // Talento cuyo riesgo se está viendo (null = modal cerrado).
  const [riskTalent, setRiskTalent] = useState<AsignarTalentoType | null>(null);
  // Tarifario del cliente del RQ. El modal solo busca dentro de esta lista por
  // idPerfil.
  const { tarifario, fetchTarifario, loading: loadingTarifario } =
    useFetchTarifario();
  const tarifarioPedido = useRef(false);

  const calculateRemainingVacancies = useCallback(
    (
      talents: AsignarTalentoType[],
      req: RequerimientoType | null
    ) => {
      if (!req) return 0;

      // Contar confirmados iniciales (desde API)
      const initialConfirmed = talents.filter(
        (t) => t.isFromAPI && t.confirmado
      ).length;
      // Contar confirmados locales (no desde API)
      const localConfirmed = talents.filter(
        (t) => !t.isFromAPI && t.confirmado
      ).length;

      return req.vacantes - initialConfirmed - localConfirmed;
    },
    []
  );

  useEffect(() => {
    if (requerimiento) {
      setRemainingVacancies(
        calculateRemainingVacancies(localTalents, requerimiento)
      );
    }
  }, [localTalents, requerimiento, calculateRemainingVacancies]);

  // Cobertura por perfil: cuántas vacantes pide cada perfil vs cuántos talentos
  // confirmados (y no removidos) tiene. Base para habilitar "Finalizar" y para
  // evitar sobre-asignar un perfil.
  const coverageByPerfil = useMemo(() => {
    const map = new Map<
      number,
      { required: number; confirmed: number; perfil: string }
    >();
    (requerimiento?.lstRqVacantes || []).forEach((v) => {
      const prev = map.get(v.idPerfil);
      map.set(v.idPerfil, {
        required: (prev?.required || 0) + v.cantidad,
        confirmed: prev?.confirmed || 0,
        perfil: v.perfilProfesional,
      });
    });
    localTalents.forEach((t) => {
      if (t.confirmado && t.idEstadoRegistro !== 0 && t.idPerfil) {
        const entry = map.get(t.idPerfil);
        if (entry) entry.confirmed += 1;
      }
    });
    return map;
  }, [requerimiento, localTalents]);

  const perfilesFaltantes = useMemo(
    () =>
      Array.from(coverageByPerfil.values())
        .filter((e) => e.confirmed < e.required)
        .map((e) => `${e.required - e.confirmed} ${e.perfil}`),
    [coverageByPerfil]
  );

  // Completo = todos los perfiles con al menos sus vacantes cubiertas.
  const isFullyCovered = useMemo(() => {
    const entries = Array.from(coverageByPerfil.values());
    return entries.length > 0 && entries.every((e) => e.confirmed >= e.required);
  }, [coverageByPerfil]);

  // Mostrar y ocultar Toast
  const showToast = (
    message: string,
    type: "success" | "error" | "warning"
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
        `/fmi/requirement/data?idRequerimiento=${idRequerimiento}&showfiles=false&showVacantesList=true&showContactList=false`
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
          const formattedTalents =
            response.data.requerimiento.lstRqTalento.map(
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
                ingreso: talent.ingreso ?? 0,
                // "Bloqueado" solo si ya fue ingresado (contrato), no por estar marcado.
                isFromAPI: talent.ingreso === 1 ? true : false,
                ubicacion: talent?.ubicacion || "",
                idModalidadContrato: talent?.idModalidadContrato || 0,
                fchInicioContrato: talent?.fchInicioContrato || "",
                fchTerminoContrato: talent?.fchTerminoContrato || "",
                montoBase: talent?.montoBase || 0,
                // Pretensión salarial (modal "Calcular Riesgo").
                montoInicialPlanilla: talent?.montoInicialPlanilla ?? 0,
                montoFinalPlanilla: talent?.montoFinalPlanilla ?? 0,
                montoInicialRxH: talent?.montoInicialRxH ?? 0,
                montoFinalRxH: talent?.montoFinalRxH ?? 0,
                idMonedaPlan: talent?.idMonedaPlan ?? 0,
                idMonedaRxh: talent?.idMonedaRxh ?? 0,
                idModalidadFacturacion: talent?.idModalidadFacturacion ?? 0,
              })
            );

          // Deduplicar por idTalento: el SEL puede devolver la misma fila si el
          // talento tiene más de un CV activo.
          const dedupById = Array.from(
            new Map(
              formattedTalents.map((t: AsignarTalentoType) => [t.idTalento, t])
            ).values()
          ) as AsignarTalentoType[];
          setLocalTalents(dedupById);
        }
      }
    } catch (error) {
      console.error("Error fetching requerimiento:", error);
      showToast(
        "Error al cargar los datos del requerimiento",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, [idRequerimiento]);

  useEffect(() => {
    fetchRequerimiento();
  }, [fetchRequerimiento]);

  /**
   * El tarifario se pide la PRIMERA vez que alguien abre "Calcular Riesgo", no al
   * cargar la pantalla: el endpoint exige la funcionalidad 26 (LISTAR_TARIFARIO)
   * y, pidiéndolo de entrada, los roles que no la tienen recibirían un aviso de
   * permiso denegado sin haber pedido nada. El ref evita repetir la llamada
   * cuando el cliente simplemente no tiene tarifas cargadas.
   */
  const handleShowRisk = useCallback(
    (talento: AsignarTalentoType) => {
      if (requerimiento?.idCliente && !tarifarioPedido.current) {
        tarifarioPedido.current = true;
        fetchTarifario(requerimiento.idCliente);
      }
      setRiskTalent(talento);
    },
    [requerimiento?.idCliente, fetchTarifario]
  );

  // Buscar talentos
  const handleSearch = async (term: string) => {
    try {
      setIsLoading(true);
      const response = await axiosInstanceFMI.get(
        `/fmi/talent/requirement/list?nPag=1&busqueda=${term}`
      );

      if (response.data.idTipoMensaje === 2) {
        const formattedTalents = response.data.talentos.map(
          (talent: any) => ({
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
          })
        );

        setSearchResults(formattedTalents);
      }
    } catch (error) {
      console.error("Error searching talents:", error);
      showToast("Error al buscar talentos", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Agregar el talento a la tabla y persistir. Separado de handleSelectTalent
  // para poder llamarlo también tras aceptar el aviso de lista negra.
  const addTalent = async (
    talent: AsignarTalentoType,
    perfil: string,
    idPerfil: number
  ) => {
    try {
      setIsLoading(true);
      const response = await axiosInstanceFMI.get(
        `/fmi/requirement/talents/data?idTalento=${talent.idTalento}&idRequerimiento=${idRequerimiento}`
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
          // "Bloqueado" solo si ya fue ingresado (contrato creado), no por estar marcado.
          isFromAPI: talentDetails.ingreso ? true : false,
          ingreso: talentDetails.ingreso || 0,
          tooltip: talentDetails.tooltip || "",
          idPerfil: idPerfil,
          perfil: perfil,
          tieneEquipo: talentDetails.tieneEquipo || 0,
          ubicacion: talent?.ubicacion || "",
          idModalidadContrato: talent?.idModalidadContrato || 0,
          fchInicioContrato: talent?.fchInicioContrato || "",
          fchTerminoContrato: talent?.fchTerminoContrato || "",
          montoBase: talent?.montoBase || 0,
          // Pretensión salarial (modal "Calcular Riesgo"). Sale del detalle, no del
          // talento de la búsqueda: el listado de búsqueda no la trae.
          montoInicialPlanilla: talentDetails?.montoInicialPlanilla ?? 0,
          montoFinalPlanilla: talentDetails?.montoFinalPlanilla ?? 0,
          montoInicialRxH: talentDetails?.montoInicialRxH ?? 0,
          montoFinalRxH: talentDetails?.montoFinalRxH ?? 0,
          idMonedaPlan: talentDetails?.idMonedaPlan ?? 0,
          idMonedaRxh: talentDetails?.idMonedaRxh ?? 0,
          idModalidadFacturacion: talentDetails?.idModalidadFacturacion ?? 0,
        };
      } else {
        formattedTalent = formatTalentFromBasicData(talent);
      }

      const nextTalents = upsertTalent(localTalents, formattedTalent);
      setLocalTalents(nextTalents);
      await handleFinalize({
        talents: nextTalents,
        flagCorreo: false,
        finalizar: false,
      });
    } catch (error) {
      console.error("Error fetching talent details:", error);
      setLocalTalents((prev) =>
        upsertTalent(prev, formatTalentFromBasicData(talent))
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Seleccionar talento: antes de agregarlo se valida contra la lista negra.
  // Si está restringido para el cliente del RQ se avisa y se espera decisión;
  // si la validación falla no se bloquea el trabajo, solo se advierte.
  const handleSelectTalent = async (
    talent: AsignarTalentoType,
    perfil: string,
    idPerfil: number
  ) => {
    try {
      setIsLoading(true);
      const { data } = await validateBlacklist({
        idTalento: talent.idTalento,
        idRequerimiento,
      });

      if (data.result?.idMensaje !== 2) {
        showToast(
          "No se pudo verificar la lista negra. Continúe con precaución.",
          "warning"
        );
      } else if (data.validacion?.bloqueado) {
        setPendingRestricted({
          talent,
          perfil,
          idPerfil,
          validation: data.validacion,
        });
        return;
      }
    } catch (error) {
      console.error("Error validating blacklist:", error);
      showToast(
        "No se pudo verificar la lista negra. Continúe con precaución.",
        "warning"
      );
    } finally {
      setIsLoading(false);
    }

    await addTalent(talent, perfil, idPerfil);
  };

  // El usuario decidió asignar al talento restringido de todas formas.
  const handleConfirmRestricted = async () => {
    if (!pendingRestricted) return;
    const { talent, perfil, idPerfil } = pendingRestricted;
    setPendingRestricted(null);
    await addTalent(talent, perfil, idPerfil);
  };

  // Formatear talento con datos básicos
  const formatTalentFromBasicData = (
    talent: AsignarTalentoType
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
    confirm: boolean
  ) => {
    if (confirm) {
      // No permitir confirmar si el perfil de este talento ya está cubierto.
      const entry = talento.idPerfil
        ? coverageByPerfil.get(talento.idPerfil)
        : undefined;
      if (entry && entry.confirmed >= entry.required) {
        showToast(
          `Ya se cubrieron todas las vacantes del perfil ${entry.perfil}.`,
          "error"
        );
        return false;
      }
      setCurrentTalento(talento);
      setShowModalIngreso(true);
      return;
    }

    const nextTalents = localTalents.map((talent) =>
      talent.idTalento === talento.idTalento
        ? { ...talent, confirmado: confirm, isFromAPI: false, ingreso: 0 }
        : talent
    );
    setLocalTalents(nextTalents);
    // Persistir el desmarcado de inmediato (sin ingresar).
    handleFinalize({ talents: nextTalents, flagCorreo: false, finalizar: false });
    showToast(
      `Confirmación cancelada. Vacantes restantes: ${
        remainingVacancies + 1
      }`,
      "warning"
    );
  };

  // Remover talento: marca la fila como eliminada y persiste de inmediato, igual
  // que seleccionar. Si solo se marcara en memoria, salir sin pulsar "Finalizar"
  // dejaría al talento asignado en BD. Los ya asignados y confirmados no llegan
  // aquí: para ellos el botón Remover está deshabilitado (isConfirmedFromAPI).
  const handleRemoveTalent = async (id: number) => {
    const nextTalents = localTalents.map((talent) =>
      talent.idTalento === id
        ? { ...talent, idEstadoRegistro: 0 } // marcar eliminado
        : talent
    );
    setLocalTalents(nextTalents);
    await handleFinalize({ talents: nextTalents, flagCorreo: false, finalizar: false });
  };

  // Actualizar talento
  const handleUpdateTalent = (talent: AsignarTalentoType) => {
    navigate("/dashboard/formDatos", {
      state: { talento: talent },
    });
  };

  // Entrevistar talento
  const handleInterviewTalent = (talent: AsignarTalentoType) => {
    const fullName = `${talent.nombres} ${
      talent.apellidos ||
      `${talent.apellidoPaterno || ""} ${talent.apellidoMaterno || ""}`.trim()
    }`;
    navigate("/dashboard/entrevistas/nueva", {
      state: {
        idTalento: talent.idTalento,
        talentName: fullName,
        idRequerimiento: idRequerimiento,
        rqLabel: `${requerimiento?.codigoRQ} - ${requerimiento?.titulo}` || requerimiento?.codigoRQ || "",
        cliente: requerimiento?.cliente || "",
      },
    });
  };

  // Verificar confirmación: solo se puede finalizar cuando TODAS las vacantes
  // (por perfil) están cubiertas por talentos confirmados.
  const handleConfirmOpen = () => {
    if (!isFullyCovered) {
      showToast(
        perfilesFaltantes.length > 0
          ? `Aún faltan vacantes por cubrir: ${perfilesFaltantes.join(
              ", "
            )}. Debe cubrirlas todas para finalizar.`
          : "Debe cubrir todas las vacantes del requerimiento para finalizar.",
        "error"
      );
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // Finalizar selección
  const handleFinalize = async ({
    talents,
    flagCorreo,
    finalizar = false,
  }: {
    talents?: AsignarTalentoType[];
    flagCorreo: boolean;
    /** true = "Finalizar" (ejecuta el ingreso). false = auto-guardado (solo persiste la marca). */
    finalizar?: boolean;
  }) => {
    try {
      setIsLoading(true);
      const talentsToUse = talents || localTalents;

      // Deduplicar por idTalento antes de enviar: el MERGE del SP no admite el
      // mismo talento repetido en el lote.
      const talentosDedup = Array.from(
        new Map(talentsToUse.map((t) => [t.idTalento, t])).values()
      );

      const talentos = talentosDedup.map((talent) => {
        // Datos del formulario de ingreso: se recuperan del ref porque las recargas
        // los borran del talento. El estado de control (confirmado/estado/perfil) lo
        // manda el talento actual; los detalles de ingreso, el ref.
        const saved = confirmedByTalento.current[talent.idTalento] || {};
        return {
          idTalento: talent.idTalento,
          nombres: talent.nombres,
          apellidos:
            talent.apellidos ||
            talent.apellidoPaterno + " " + talent.apellidoMaterno ||
            "",
          dni: talent.dni,
          celular: talent.celular || "",
          email: talent.email,
          // El estado pasa a CONFIRMADO solo al FINALIZAR. En auto-guardado la marca
          // vive en el flag `confirmado`, conservando el estado de datos (2/1).
          idEstado:
            talent.confirmado && finalizar
              ? ESTADO_CONFIRMADO
              : talent.idEstado ||
                (talent.estado === "DATOS COMPLETOS"
                  ? ESTADO_DATOS_COMPLETOS
                  : ESTADO_OBSERVADO),
          idSituacion:
            talent.idSituacion ||
            (talent.situacion === "LIBRE" ? 1 : 2),
          idPerfil: talent.idPerfil || 0,
          confirmado: talent.confirmado || false,

          ingreso: talent.ingreso || 0,
          idCliente: requerimiento?.idCliente || 0,
          cliente: requerimiento?.cliente || "",
          idArea: talent.idArea || saved.idArea || 0,
          area: talent.area || saved.area || "",
          cargo: talent.cargo || saved.cargo || "",
          fchInicioContrato:
            talent.fchInicioContrato || saved.fchInicioContrato || "",
          fchTerminoContrato:
            talent.fchTerminoContrato || saved.fchTerminoContrato || "",
          proyectoServicio:
            talent.proyectoServicio || saved.proyectoServicio || "",
          objetoContrato: talent.objetoContrato || saved.objetoContrato || "",
          idModalidadContrato:
            talent.idModalidadContrato || saved.idModalidadContrato || 0,
          horario: talent.horario || saved.horario || "",
          tieneEquipo: talent.tieneEquipo || 0,
          ubicacion: talent.ubicacion || saved.ubicacion || "",
          idMotivo: talent.idMotivo || saved.idMotivo || 0,
          idMoneda: talent.idMoneda || saved.idMoneda || 1,
          declararSunat: talent.declararSunat || saved.declararSunat || 0,
          sedeDeclarar: talent.sedeDeclarar || saved.sedeDeclarar || "",
          montoBase: talent.montoBase || saved.montoBase || 0,
          montoMovilidad: talent.montoMovilidad || saved.montoMovilidad || 0,
          montoMensual: talent.montoMensual || saved.montoMensual || 0,
          montoTrimestral: talent.montoTrimestral || saved.montoTrimestral || 0,
          montoSemestral: talent.montoSemestral || saved.montoSemestral || 0,

          solicitudEquipo:
            talent?.solicitudEquipo || saved.solicitudEquipo || null,
          idEstadoRegistro: talent?.idEstadoRegistro,
        };
      });

      const payload = {
        idRequerimiento,
        flagCorreo: flagCorreo,
        finalizar: finalizar,
        lstTalentos: talentos,
      };

      const response = await axiosInstanceFMI.post(
        "/fmi/requirement/talents/save",
        payload
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
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Navegación
  const goBack = () => navigate("/dashboard/requerimientos");

  // Validaciones: una vez ASIGNADO (o ATENDIDO) la pantalla queda de solo lectura,
  // incluido "Finalizar", aunque se vuelva por el botón atrás del navegador.
  const buttonsDisabled =
    requerimiento?.idEstado === ESTADO_ASIGNADO ||
    requerimiento?.idEstado === ESTADO_ATENDIDO;

  const handleModalIngresoClose = () => {
    setShowModalIngreso(false);
  };

  const handleModalSolicitudEquipoClose = () => {
    setShowModalSolicitudEquipo(false);
  };

  const handleModalSolicitudEquipoCancel = (
    talento: AsignarTalentoType
  ) => {
    // El usuario canceló la solicitud de equipo: el talento queda SIN confirmar.
    // Limpiar el ref para que no reinyecte datos de un talento cancelado en el Finalizar.
    delete confirmedByTalento.current[talento.idTalento];
    const nextTalents = localTalents.map((t) =>
      t.idTalento === talento.idTalento ? talento : t
    );
    setLocalTalents(nextTalents);
    setShowModalSolicitudEquipo(false);
    // Persistir el des-confirmado de inmediato (sin ingresar), igual que el resto
    // de cancelaciones, para que la fila RT no quede marcada como confirmada.
    handleFinalize({ talents: nextTalents, flagCorreo: false, finalizar: false });
  };

  const handleOnConfirmModalIngreso = async (
    talento: AsignarTalentoType
  ) => {
    // Conservar los datos del formulario de ingreso para reenviarlos en el Finalizar.
    confirmedByTalento.current[talento.idTalento] = talento;
    if (talento?.tieneEquipo === 0) {
      setCurrentTalento(talento);
      setShowModalSolicitudEquipo(true);
      return;
    } else {
      const nextTalents = localTalents.map((t) =>
        t.idTalento === talento.idTalento ? talento : t
      );
      setLocalTalents(nextTalents);
      // Persistir la MARCA (sin ingresar): finalizar = false. Se espera a que
      // termine para que la fila RT quede persistida antes de un posible "Finalizar".
      await handleFinalize({ talents: nextTalents, flagCorreo: false, finalizar: false });

      showToast(
        `Talento confirmado. Vacantes restantes: ${
          remainingVacancies - 1
        }`,
        "success"
      );
    }
  };

  const handleOnConfirmModalSolicitudEquipo = async (
    talento: AsignarTalentoType
  ) => {
    // Conservar el talento (datos de ingreso + solicitud de equipo) para el Finalizar.
    confirmedByTalento.current[talento.idTalento] = talento;
    const nextTalents = localTalents.map((t) =>
      t.idTalento === talento.idTalento ? talento : t
    );
    setLocalTalents(nextTalents);
    // Persistir la MARCA (sin ingresar): finalizar = false. Se espera para que la
    // fila RT quede persistida antes de un posible "Finalizar".
    await handleFinalize({ talents: nextTalents, flagCorreo: false, finalizar: false });

    showToast(
      `Talento confirmado. Vacantes restantes: ${
        remainingVacancies - 1
      }`,
      "success"
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
      <div className="flex h-full flex-col overflow-x-hidden">
        <div className="flex shrink-0 items-center justify-between mb-2">
          <h3 className="text-2xl font-semibold flex gap-2">
            <BackButton backClicked={goBack} />
            Módulo para búsqueda de talentos
          </h3>

          {/* Acciones principales */}
          <div className="flex gap-2">
            <Button
              variant="blue"
              onClick={() => {
                setSearchTerm("");
                setSearchResults([]);
                setIsModalOpen(true);
                handleSearch("");
              }}
              disabled={buttonsDisabled}
              className="mx-1"
            >
              Agregar Talento
            </Button>
            <Button
              onClick={handleConfirmOpen}
              disabled={buttonsDisabled}
              className="mx-1"
            >
              Finalizar
            </Button>
          </div>
        </div>

        {/* Información del requerimiento */}
        <div className="shrink-0 bg-white shadow-md rounded-lg p-4 w-full mb-4 dark:bg-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-2">
              <p className="text-sm text-gray-600 dark:text-slate-300">
                <span className="font-medium">Id:</span>{" "}
                {idRequerimiento}
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-300">
                <span className="font-medium">Cliente:</span>{" "}
                {requerimiento?.cliente || "Cargando..."}
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-300">
                <span className="font-medium">Rq:</span>{" "}
                {requerimiento?.codigoRQ || "Cargando..."}
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-300">
                <span className="font-medium">Fecha Solicitud:</span>{" "}
                {dateFormatted || "Cargando..."}
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-300">
                <span className="font-medium">Estado:</span>{" "}
                {requerimiento?.estado || "Cargando..."}
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-300">
                <span className="font-medium">Vacantes: </span>
                {`${
                  requerimiento?.lstRqVacantes
                    ?.map(
                      (vacante) =>
                        `${vacante.cantidad} ${vacante.perfilProfesional}`
                    )
                    .join(", ") || "Cargando..."
                }`}
              </p>
          </div>
        </div>

        {/* Tabla de talentos */}
        <div className="table-container min-h-0 flex-1">
          <div className="table-wrapper h-full overflow-auto">
            <Table className="table">
              <TalentTableHeader />
              <TableBody>
                {localTalents.length > 0 ? (
                  localTalents.map(
                    (talento) =>
                      talento.idEstadoRegistro !== 0 && (
                        <TalentTableRow
                          key={talento.idTalento}
                          talento={talento}
                          onRemove={handleRemoveTalent}
                          onUpdate={handleUpdateTalent}
                          onInterview={handleInterviewTalent}
                          onRisk={handleShowRisk}
                          onConfirmChange={handleConfirmChange}
                          disabled={buttonsDisabled}
                        />
                      )
                  )
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="py-4 text-center text-gray-500 dark:text-slate-400"
                    >
                      No hay talentos seleccionados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Modales */}
        <SelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          availableTalents={searchResults}
          // Los removidos siguen en localTalents marcados con idEstadoRegistro
          // = 0: no cuentan como seleccionados, hay que poder volver a elegirlos.
          selectedTalents={localTalents.filter(
            (t) => t.idEstadoRegistro !== 0
          )}
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
          onConfirm={() => handleFinalize({ flagCorreo: true, finalizar: true })}
          message="¿Está seguro que desea finalizar y guardar los talentos confirmados?"
        />

        <BlacklistWarningModal
          validation={pendingRestricted?.validation || null}
          talentName={
            pendingRestricted
              ? `${pendingRestricted.talent.nombres} ${
                  pendingRestricted.talent.apellidos ||
                  `${pendingRestricted.talent.apellidoPaterno || ""} ${
                    pendingRestricted.talent.apellidoMaterno || ""
                  }`.trim()
                }`
              : ""
          }
          onCancel={() => setPendingRestricted(null)}
          onConfirm={handleConfirmRestricted}
        />

        <ModalRiesgoTalento
          talento={riskTalent}
          tarifa={tarifario.find((t) => t.idPerfil === riskTalent?.idPerfil)}
          cargandoTarifa={loadingTarifario}
          banda={requerimiento?.lstRqFacturacion}
          onClose={() => setRiskTalent(null)}
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
