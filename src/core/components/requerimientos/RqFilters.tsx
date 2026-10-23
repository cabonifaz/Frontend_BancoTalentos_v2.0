import { ReactNode, RefObject, useEffect, useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { Building2, Check, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { BaseOption } from "../ui/FilterDropDown";
import {
  FilterOption,
  FilterOptions,
  getContactFilterOptions,
} from "../../services/requirements.service";
import { BaseResponseFMI, OperationResult } from "../../models";
import { AxiosResponse } from "axios";

/** Valor elegido en un filtro buscado en el servidor: el id va al SP, el texto al chip. */
export interface FilterSelection {
  id: number;
  label: string;
}

/** Contacto elegido: recuerda su cliente para agruparlo y reabrir el panel en él. */
export interface ContactSelection extends FilterSelection {
  idCliente: number;
}

type Fetcher = (buscar: string) => Promise<AxiosResponse<OperationResult<FilterOptions | null>>>;

/** Cierra el panel al hacer clic fuera del filtro. */
const useCloseOnOutsideClick = (
  ref: RefObject<HTMLDivElement>,
  isOpen: boolean,
  onClose: () => void,
) => {
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [ref, isOpen, onClose]);
};

const cantidadRq = (n: number) => `${n} ${n === 1 ? "RQ" : "RQs"}`;

/** Agrega o quita una opción de la selección. */
const alternar = <T extends FilterSelection>(values: T[], item: T): T[] =>
  values.some((v) => v.id === item.id)
    ? values.filter((v) => v.id !== item.id)
    : [...values, item];

/**
 * Chip con el mismo aspecto que FilterDropDown (clases .filter), pero muestra
 * lo elegido: con búsquedas en el servidor no hay otra forma de saber qué
 * contactos, perfiles o talentos está filtrando. Con varios: "primero +N".
 */
const FilterChip = ({
  label,
  values,
  onToggle,
  onClear,
}: {
  label: string;
  values: FilterSelection[];
  onToggle: () => void;
  onClear: () => void;
}) => (
  <div
    className={`filter inline-flex items-center gap-2 ${
      values.length > 0 ? "btn-filter-active" : "btn-filter"
    }`}
  >
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex max-w-[300px] items-center gap-1"
      title={values.length > 0 ? `${label}: ${values.map((v) => v.label).join(", ")}` : undefined}
    >
      <span>{label}</span>
      {values.length > 0 && (
        <>
          <span className="truncate font-semibold">: {values[0].label}</span>
          {values.length > 1 && (
            <span className="flex-none rounded-full bg-white/20 px-1.5 text-xs font-semibold tabular-nums">
              +{values.length - 1}
            </span>
          )}
        </>
      )}
    </button>
    {values.length > 0 && (
      <button
        type="button"
        onClick={onClear}
        aria-label={`Quitar filtro de ${label.toLowerCase()}`}
        className="flex items-center"
      >
        <X className="h-5 w-5" />
      </button>
    )}
  </div>
);

const Panel = ({ children }: { children: ReactNode }) => (
  <div className="absolute left-0 z-[43] my-3 flex w-80 flex-col gap-1.5 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-slate-600 dark:bg-slate-800">
    {children}
  </div>
);

/** Lo elegido, arriba del panel: se ve y se quita aunque no salga en la búsqueda actual. */
const Elegidos = ({
  values,
  onRemove,
  onClear,
}: {
  values: FilterSelection[];
  onRemove: (id: number) => void;
  onClear: () => void;
}) =>
  values.length === 0 ? null : (
    <div className="rounded-md border border-gray-200 p-1.5 dark:border-slate-600">
      <div className="mb-1 flex items-center justify-between px-0.5">
        <span className="text-xs text-gray-500 dark:text-slate-400">
          {values.length} {values.length === 1 ? "elegido" : "elegidos"}
        </span>
        <button
          type="button"
          onClick={onClear}
          className="rounded px-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Quitar todos
        </button>
      </div>
      <ul className="flex max-h-20 flex-wrap gap-1 overflow-y-auto">
        {values.map((v) => (
          <li
            key={v.id}
            className="flex max-w-full items-center gap-1 rounded-md bg-[#EEF2FF] py-0.5 pl-2 pr-1 text-xs text-[#312e81] dark:bg-indigo-500/10 dark:text-indigo-300"
          >
            <span className="truncate">{v.label}</span>
            <button
              type="button"
              onClick={() => onRemove(v.id)}
              aria-label={`Quitar ${v.label}`}
              className="flex-none rounded hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

const SearchInput = ({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => (
  <>
    <label htmlFor={id} className="sr-only">
      {label}
    </label>
    <input
      id={id}
      type="search"
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
    />
  </>
);

const Casilla = ({ checked }: { checked: boolean }) => (
  <span
    className={`flex h-4 w-4 flex-none items-center justify-center rounded border-2 ${
      checked
        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
        : "border-gray-400 dark:border-slate-500"
    }`}
  >
    {checked && <Check className="h-3 w-3" strokeWidth={3} />}
  </span>
);

/** Lista con altura acotada (~5 filas): el resto se ve con scroll. */
const OPTIONS_LIST = "max-h-60 overflow-y-auto";

const optionClass = (checked: boolean) =>
  `flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
    checked
      ? "bg-teal-50 dark:bg-teal-500/10"
      : "hover:bg-gray-100 dark:hover:bg-slate-700"
  }`;

const Status = ({ children }: { children: ReactNode }) => (
  <p className="px-2 py-3 text-[13px] text-gray-500 dark:text-slate-400">{children}</p>
);

const Cargando = () => (
  <p className="flex items-center gap-2 px-2 py-3 text-[13px] text-gray-500 dark:text-slate-400">
    <Loader2 size={14} className="animate-spin" />
    Buscando…
  </p>
);

/**
 * Busca en el servidor mientras se escribe (con espera) y sólo acepta la
 * última respuesta. Con menos de `minChars` letras no consulta.
 */
const useServerOptions = (fetcher: Fetcher, busqueda: string, minChars: number, enabled: boolean) => {
  const [datos, setDatos] = useState<FilterOptions | null>(null);
  const [cargando, setCargando] = useState(false);
  const ultima = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const texto = busqueda.trim();
    if (texto.length < minChars) {
      ultima.current++;
      setDatos(null);
      setCargando(false);
      return;
    }
    const peticion = ++ultima.current;
    setCargando(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await fetcher(texto);
        if (peticion !== ultima.current) return;
        if (data.baseResponse?.idTipoMensaje !== 2 || !data.data) {
          enqueueSnackbar(
            (data.baseResponse as BaseResponseFMI | undefined)?.mensaje ||
              "No se pudieron cargar las opciones del filtro",
            { variant: "warning" },
          );
          setDatos(null);
          return;
        }
        setDatos(data.data);
      } catch {
        if (peticion === ultima.current) {
          enqueueSnackbar("No se pudieron cargar las opciones del filtro", { variant: "error" });
        }
      } finally {
        if (peticion === ultima.current) setCargando(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [fetcher, busqueda, minChars, enabled]);

  return { datos, cargando };
};

interface LookupFilterProps {
  name: string;
  label: string;
  values: FilterSelection[];
  onChange: (values: FilterSelection[]) => void;
  isOpen: boolean;
  onToggle: () => void;
  fetchOptions: Fetcher;
  /** Letras mínimas para consultar; 0 = consulta al abrir. */
  minChars: number;
  placeholder: string;
  /** Texto mientras faltan letras. */
  hint: string;
  /** Avatar con iniciales y documento debajo (postulantes). */
  persona?: boolean;
}

/**
 * Filtro de selección múltiple cuyo catálogo es demasiado grande para
 * cargarlo entero (perfiles, talentos): busca en el servidor y muestra pocas
 * filas. El panel queda abierto para elegir varios.
 */
export const LookupFilter = ({
  name,
  label,
  values,
  onChange,
  isOpen,
  onToggle,
  fetchOptions,
  minChars,
  placeholder,
  hint,
  persona = false,
}: LookupFilterProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [busqueda, setBusqueda] = useState("");
  const { datos, cargando } = useServerOptions(fetchOptions, busqueda, minChars, isOpen);

  useCloseOnOutsideClick(ref, isOpen, onToggle);

  useEffect(() => {
    if (!isOpen) setBusqueda("");
  }, [isOpen]);

  const faltanLetras = busqueda.trim().length < minChars;
  const opciones = datos?.opciones ?? [];

  return (
    <div className="relative" ref={ref}>
      <FilterChip label={label} values={values} onToggle={onToggle} onClear={() => onChange([])} />
      {isOpen && (
        <Panel>
          <Elegidos
            values={values}
            onRemove={(id) => onChange(values.filter((v) => v.id !== id))}
            onClear={() => onChange([])}
          />
          <SearchInput
            id={`filtro-${name}`}
            label={`Buscar ${label.toLowerCase()}`}
            value={busqueda}
            onChange={setBusqueda}
            placeholder={placeholder}
          />
          {faltanLetras ? (
            <p className="m-1 rounded-md border border-dashed border-gray-300 px-3 py-3 text-center text-[13px] text-gray-500 dark:border-slate-600 dark:text-slate-400">
              {hint}
            </p>
          ) : cargando && !datos ? (
            <Cargando />
          ) : opciones.length === 0 ? (
            <Status>Sin resultados.</Status>
          ) : (
            <>
              {minChars === 0 && busqueda.trim() === "" && (
                <p className="px-1 text-xs text-gray-500 dark:text-slate-400">Más usados</p>
              )}
              <div className={`${OPTIONS_LIST} ${cargando ? "opacity-60" : ""}`}>
                {opciones.map((o) => {
                  const checked = values.some((v) => v.id === o.id);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      onClick={() => onChange(alternar(values, { id: o.id, label: o.nombre }))}
                      className={optionClass(checked)}
                    >
                      <Casilla checked={checked} />
                      {persona && (
                        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-800 dark:bg-teal-500/15 dark:text-teal-300">
                          {o.nombre
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      )}
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-gray-900 dark:text-slate-100">{o.nombre}</span>
                        {persona && o.detalle && (
                          <span className="text-xs tabular-nums text-gray-500 dark:text-slate-400">
                            DNI {o.detalle}
                          </span>
                        )}
                      </span>
                      <span className="whitespace-nowrap text-xs tabular-nums text-gray-500 dark:text-slate-400">
                        {cantidadRq(o.cantidad)}
                      </span>
                    </button>
                  );
                })}
              </div>
              {(datos?.total ?? 0) > opciones.length && (
                <p className="px-1 pt-1 text-xs text-gray-500 dark:text-slate-400">
                  Mostrando {opciones.length} de {datos?.total}. Sigue escribiendo para afinar.
                </p>
              )}
            </>
          )}
        </Panel>
      )}
    </div>
  );
};

interface ContactFilterProps {
  values: ContactSelection[];
  onChange: (values: ContactSelection[]) => void;
  isOpen: boolean;
  onToggle: () => void;
  /** Clientes del filtro Cliente (ya cargados por la pantalla). */
  clients: BaseOption[];
  /** Cliente del filtro Cliente: si hay uno, el panel abre en sus contactos. */
  selectedClientId: number | null;
}

/**
 * Filtro Contacto de selección múltiple, en dos pasos dentro del mismo panel:
 * primero el cliente y luego sus contactos. Se pueden juntar contactos de
 * varios clientes. No depende del filtro Cliente.
 */
export const ContactFilter = ({
  values,
  onChange,
  isOpen,
  onToggle,
  clients,
  selectedClientId,
}: ContactFilterProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [clientePanel, setClientePanel] = useState<number | null>(null);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [busquedaContacto, setBusquedaContacto] = useState("");
  const [contactos, setContactos] = useState<FilterOption[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const ultima = useRef(0);

  useCloseOnOutsideClick(ref, isOpen, onToggle);

  // Al abrir: en los contactos del filtro Cliente, o del cliente de los
  // contactos elegidos si son todos del mismo; si no, en la lista de clientes.
  useEffect(() => {
    if (!isOpen) return;
    const clientesElegidos = Array.from(new Set(values.map((v) => v.idCliente)));
    setClientePanel(
      selectedClientId ?? (clientesElegidos.length === 1 ? clientesElegidos[0] : null),
    );
    setBusquedaCliente("");
    setBusquedaContacto("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Los contactos de un cliente son pocos: se piden una vez y se filtran aquí.
  useEffect(() => {
    if (!isOpen || clientePanel === null) return;
    const peticion = ++ultima.current;
    setContactos(null);
    setCargando(true);
    getContactFilterOptions(clientePanel)
      .then(({ data }) => {
        if (peticion !== ultima.current) return;
        if (data.baseResponse?.idTipoMensaje !== 2 || !data.data) {
          enqueueSnackbar(data.baseResponse?.mensaje || "No se pudieron cargar los contactos", {
            variant: "warning",
          });
          setContactos([]);
          return;
        }
        setContactos(data.data.opciones);
      })
      .catch(() => {
        if (peticion === ultima.current) {
          enqueueSnackbar("No se pudieron cargar los contactos", { variant: "error" });
          setContactos([]);
        }
      })
      .finally(() => {
        if (peticion === ultima.current) setCargando(false);
      });
  }, [isOpen, clientePanel]);

  const normalizar = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const clienteActual = clients.find((c) => Number(c.value) === clientePanel);
  const clientesVisibles = clients.filter((c) =>
    normalizar(c.label).includes(normalizar(busquedaCliente.trim())),
  );
  const contactosVisibles = (contactos ?? []).filter((c) =>
    normalizar(c.nombre).includes(normalizar(busquedaContacto.trim())),
  );

  const alternarContacto = (o: FilterOption) => {
    if (clientePanel === null) return;
    onChange(
      alternar(values, {
        id: o.id,
        label: `${o.nombre} · ${clienteActual?.label ?? ""}`,
        idCliente: clientePanel,
      }),
    );
  };

  return (
    <div className="relative" ref={ref}>
      <FilterChip label="Contacto" values={values} onToggle={onToggle} onClear={() => onChange([])} />
      {isOpen && (
        <Panel>
          <Elegidos
            values={values}
            onRemove={(id) => onChange(values.filter((v) => v.id !== id))}
            onClear={() => onChange([])}
          />
          {clientePanel === null ? (
            <>
              <p className="px-1 pt-0.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                1 · Elige el cliente
              </p>
              <SearchInput
                id="filtro-contacto-cliente"
                label="Buscar cliente"
                value={busquedaCliente}
                onChange={setBusquedaCliente}
                placeholder="Buscar cliente…"
              />
              <div className={OPTIONS_LIST}>
                {clientesVisibles.map((c) => {
                  const elegidos = values.filter((v) => v.idCliente === Number(c.value)).length;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => {
                        setClientePanel(Number(c.value));
                        setBusquedaContacto("");
                      }}
                      className={optionClass(elegidos > 0)}
                    >
                      <Building2 size={16} className="flex-none text-gray-500 dark:text-slate-400" />
                      <span className="flex-1 truncate text-gray-900 dark:text-slate-100">{c.label}</span>
                      {elegidos > 0 && (
                        <span className="whitespace-nowrap text-xs font-medium text-teal-700 dark:text-teal-300">
                          {elegidos} {elegidos === 1 ? "elegido" : "elegidos"}
                        </span>
                      )}
                      <ChevronRight size={16} className="flex-none text-gray-400" />
                    </button>
                  );
                })}
                {clientesVisibles.length === 0 && <Status>Sin clientes que coincidan.</Status>}
              </div>
            </>
          ) : (
            <>
              <div className="flex min-w-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setClientePanel(null);
                    setBusquedaCliente("");
                  }}
                  aria-label="Volver a la lista de clientes"
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <ChevronLeft size={14} />
                  Clientes
                </button>
                <span className="text-xs text-gray-400">/</span>
                <strong className="truncate text-[13px] text-gray-900 dark:text-slate-100">
                  {clienteActual?.label ?? "Cliente"}
                </strong>
              </div>
              <SearchInput
                id="filtro-contacto"
                label="Buscar contacto"
                value={busquedaContacto}
                onChange={setBusquedaContacto}
                placeholder="Buscar contacto…"
              />
              {cargando ? (
                <Cargando />
              ) : (
                <div className={OPTIONS_LIST}>
                  {contactosVisibles.map((o) => {
                    const checked = values.some((v) => v.id === o.id);
                    return (
                      <button
                        key={o.id}
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        onClick={() => alternarContacto(o)}
                        className={optionClass(checked)}
                      >
                        <Casilla checked={checked} />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-gray-900 dark:text-slate-100">{o.nombre}</span>
                          {o.detalle && (
                            <span className="truncate text-xs text-gray-500 dark:text-slate-400">
                              {o.detalle}
                            </span>
                          )}
                        </span>
                        <span className="whitespace-nowrap text-xs tabular-nums text-gray-500 dark:text-slate-400">
                          {cantidadRq(o.cantidad)}
                        </span>
                      </button>
                    );
                  })}
                  {contactosVisibles.length === 0 && (
                    <Status>
                      {(contactos ?? []).length === 0
                        ? "Este cliente no tiene contactos registrados."
                        : "Sin contactos que coincidan."}
                    </Status>
                  )}
                </div>
              )}
            </>
          )}
        </Panel>
      )}
    </div>
  );
};
