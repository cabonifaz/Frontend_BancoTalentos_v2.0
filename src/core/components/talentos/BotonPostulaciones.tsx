import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import {
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronRight,
  ClipboardList,
  Loader2,
  Search,
  Users,
  X,
} from "lucide-react";
import {
  getTalentApplications,
  TalentApplication,
  TalentApplications,
} from "../../services/requirements.service";
import { Pagination } from "../ui/Pagination";
import { EstadoRqBadge } from "../requerimientos/EstadoRqBadge";
import { Utils } from "../../utilities/utils";
import { isRouteAllowed } from "../../config/navigation";
import {
  ESTADO_CONFIRMADO,
  ESTADO_DATOS_COMPLETOS,
  ESTADO_EN_ENTREVISTA,
  ESTADO_OBSERVADO,
} from "../../utilities/constants";

interface Props {
  idTalento?: number;
  nombreCompleto: string;
}

const RUTA_REQUERIMIENTOS = "/dashboard/requerimientos";

/**
 * Estado del talento dentro del RQ (maestro 25). Etiqueta cuadrada para no
 * confundirla con el estado del RQ, que es una píldora.
 */
const ESTADO_TALENTO_BADGE: Record<number, string> = {
  [ESTADO_OBSERVADO]: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
  [ESTADO_DATOS_COMPLETOS]: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  [ESTADO_EN_ENTREVISTA]: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  [ESTADO_CONFIRMADO]: "bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300",
};

const EstadoTalentoBadge = ({ postulacion }: { postulacion: TalentApplication }) =>
  postulacion.ingreso ? (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-emerald-700 px-2 py-0.5 text-xs font-semibold text-white dark:bg-emerald-600">
      <Check size={13} strokeWidth={2.5} />
      Ingresó
    </span>
  ) : (
    <span
      className={`inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ${
        ESTADO_TALENTO_BADGE[postulacion.idEstadoTalento] ||
        "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200"
      }`}
    >
      {postulacion.estadoTalento || "—"}
    </span>
  );

const GRID =
  "grid grid-cols-[116px_minmax(0,1fr)_96px_120px_132px_92px_40px] items-center gap-3";

/**
 * Detalle del talento: lista los requerimientos a los que fue asignado, con
 * búsqueda, filtro por estado del RQ y acceso directo al detalle de cada RQ.
 */
export const BotonPostulaciones = ({ idTalento, nombreCompleto }: Props) => {
  const navigate = useNavigate();
  const modalRoot = document.getElementById("modal");

  const puedeVerRequerimientos = isRouteAllowed(
    RUTA_REQUERIMIENTOS,
    Utils.getUserRoutes(localStorage.getItem("token") || undefined),
  );

  const [abierto, setAbierto] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const [estado, setEstado] = useState<number | null>(null);
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState<TalentApplications | null>(null);
  const [cargando, setCargando] = useState(false);

  // Sólo cuenta la última petición: al teclear o paginar rápido, una
  // respuesta vieja no debe pisar a la nueva.
  const ultimaPeticion = useRef(0);

  const consultar = useCallback(
    async (filtros: { buscar: string; estado: number | null; nPag: number }) => {
      if (!idTalento) return;
      const peticion = ++ultimaPeticion.current;
      setCargando(true);
      try {
        const { data } = await getTalentApplications({
          idTalento,
          buscar: filtros.buscar.trim() || null,
          estado: filtros.estado,
          nPag: filtros.nPag,
        });
        if (peticion !== ultimaPeticion.current) return;

        if (data.baseResponse?.idTipoMensaje !== 2 || !data.data) {
          enqueueSnackbar(
            data.baseResponse?.mensaje || "No se pudieron consultar las postulaciones",
            { variant: "warning" },
          );
          setDatos(null);
          return;
        }
        setDatos(data.data);
        setTotal(data.data.totalPostulaciones);
      } catch (error) {
        if (peticion !== ultimaPeticion.current) return;
        enqueueSnackbar("No se pudieron consultar las postulaciones", {
          variant: "error",
        });
      } finally {
        if (peticion === ultimaPeticion.current) setCargando(false);
      }
    },
    [idTalento],
  );

  // Contador del botón: se pide al cambiar de talento, con la primera página
  // sin filtros, que es justo lo que muestra el modal al abrirse.
  useEffect(() => {
    setAbierto(false);
    setTotal(null);
    setDatos(null);
    setBusqueda("");
    setBusquedaAplicada("");
    setEstado(null);
    setPagina(1);
    consultar({ buscar: "", estado: null, nPag: 1 });
  }, [consultar]);

  // La búsqueda se aplica al dejar de teclear.
  useEffect(() => {
    if (busqueda === busquedaAplicada) return;
    const timer = setTimeout(() => {
      setBusquedaAplicada(busqueda);
      setPagina(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [busqueda, busquedaAplicada]);

  // Recarga cuando cambian los filtros o la página con el modal abierto.
  const primeraCarga = useRef(true);
  useEffect(() => {
    if (primeraCarga.current) {
      primeraCarga.current = false;
      return;
    }
    if (!abierto) return;
    consultar({ buscar: busquedaAplicada, estado, nPag: pagina });
  }, [busquedaAplicada, estado, pagina, abierto, consultar]);

  // Escape cierra el modal.
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto]);

  const cambiarEstado = (nuevo: number | null) => {
    setEstado(nuevo);
    setPagina(1);
  };

  const irAlRequerimiento = (idRequerimiento: number) => {
    setAbierto(false);
    navigate(RUTA_REQUERIMIENTOS, { state: { idRequerimiento } });
  };

  const postulaciones = datos?.postulaciones ?? [];
  const totalBusqueda = (datos?.estados ?? []).reduce((s, e) => s + e.cantidad, 0);
  const hayFiltros = busquedaAplicada.trim() !== "" || estado !== null;

  const rango = (() => {
    const totalLista = datos?.totalElementos ?? 0;
    if (totalLista === 0) return "Sin resultados";
    const inicio = (pagina - 1) * (datos?.tamanioPagina || totalLista) + 1;
    return `Mostrando ${inicio}–${inicio + postulaciones.length - 1} de ${totalLista}`;
  })();

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        disabled={!idTalento}
        title="Requerimientos a los que ha postulado"
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#009695] bg-white pl-4 pr-3 text-sm font-medium text-[#00706f] hover:bg-[#e6f5f5] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-teal-400 dark:bg-transparent dark:text-teal-300 dark:hover:bg-teal-400/10"
      >
        <ClipboardList className="h-4 w-4 shrink-0" />
        Postulaciones
        {total !== null && (
          <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#009695] px-1.5 text-xs font-semibold text-white tabular-nums dark:bg-teal-500">
            {total}
          </span>
        )}
      </button>

      {abierto &&
        modalRoot &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#00000048] p-4 dark:bg-black/70"
            onClick={() => setAbierto(false)}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="postulaciones-titulo"
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[90vh] w-full max-w-[1060px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-800"
            >
              {/* Cabecera */}
              <header className="flex items-start justify-between gap-4 px-6 pb-4 pt-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] bg-[#e6f5f5] text-[#00706f] dark:bg-teal-400/10 dark:text-teal-300">
                    <ClipboardList size={20} strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3
                      id="postulaciones-titulo"
                      className="text-lg font-semibold text-gray-900 dark:text-slate-100"
                    >
                      Postulaciones
                    </h3>
                    <p className="mt-1 text-[13px] text-gray-600 dark:text-slate-400">
                      {total === null ? (
                        nombreCompleto
                      ) : total === 0 ? (
                        <>{nombreCompleto} aún no ha postulado a ningún requerimiento</>
                      ) : (
                        <>
                          {nombreCompleto} ha postulado a{" "}
                          <strong className="font-semibold text-gray-900 dark:text-slate-100">
                            {total} {total === 1 ? "requerimiento" : "requerimientos"}
                          </strong>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  aria-label="Cerrar"
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <X size={18} />
                </button>
              </header>

              {/* Buscador + filtro por estado del RQ */}
              <div className="flex flex-wrap items-center gap-3 px-6 pb-4">
                <div className="relative min-w-0 flex-[1_1_320px]">
                  <label htmlFor="postulaciones-buscar" className="sr-only">
                    Buscar por nombre, código, cliente o vacante
                  </label>
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400"
                  />
                  <input
                    id="postulaciones-buscar"
                    type="search"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre, código, cliente o vacante…"
                    autoFocus
                    className="input w-full !pl-10"
                  />
                </div>
                {(datos?.estados.length ?? 0) > 0 && (
                  <div
                    role="group"
                    aria-label="Filtrar por estado del requerimiento"
                    className="inline-flex flex-wrap gap-0.5 rounded-[10px] border border-gray-200 bg-gray-50 p-[3px] dark:border-slate-600 dark:bg-slate-900/40"
                  >
                    {[
                      { idEstado: null as number | null, estado: "Todos", cantidad: totalBusqueda },
                      ...(datos?.estados ?? []),
                    ].map((f) => {
                      const activo = estado === f.idEstado;
                      return (
                        <button
                          key={f.idEstado ?? "todos"}
                          type="button"
                          aria-pressed={activo}
                          onClick={() => cambiarEstado(f.idEstado)}
                          className={`inline-flex h-8 items-center gap-1.5 rounded-[7px] border px-3 text-[13px] transition-colors ${
                            activo
                              ? "border-gray-200 bg-white font-semibold text-gray-900 shadow-sm dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100"
                              : "border-transparent font-medium text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700/60"
                          }`}
                        >
                          {f.estado}
                          <span
                            className={`text-xs tabular-nums ${
                              activo
                                ? "font-semibold text-[#00706f] dark:text-teal-300"
                                : "text-gray-500 dark:text-slate-400"
                            }`}
                          >
                            {f.cantidad}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tabla */}
              <div className="min-h-0 flex-1 overflow-auto border-t border-gray-200 dark:border-slate-700">
                <div className="min-w-[860px]">
                  <div
                    className={`${GRID} sticky top-0 z-10 border-b border-gray-200 bg-gray-50 px-6 py-2.5 text-xs font-medium uppercase tracking-wide text-gray-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400`}
                  >
                    <span>Código</span>
                    <span>Requerimiento</span>
                    <span>Fecha</span>
                    <span>Estado RQ</span>
                    <span>Su estado</span>
                    <span className="text-center">Postulantes</span>
                    <span />
                  </div>

                  <div className={`relative ${cargando ? "opacity-60" : ""}`}>
                    {postulaciones.map((p) => (
                      <div
                        key={p.idRequerimiento}
                        className={`${GRID} border-b border-gray-100 px-6 py-3.5 hover:bg-gray-50 dark:border-slate-700/60 dark:hover:bg-slate-700/30`}
                      >
                        <span className="text-[13px] font-medium tabular-nums text-[#00706f] dark:text-teal-300">
                          {p.codigo || "—"}
                        </span>
                        <div className="flex min-w-0 flex-col gap-1">
                          <span
                            className="truncate text-sm font-medium text-gray-900 dark:text-slate-100"
                            title={p.titulo}
                          >
                            {p.titulo}
                          </span>
                          <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-slate-400">
                            <span className="inline-flex min-w-0 items-center gap-1.5">
                              <Building2 size={13} className="shrink-0" />
                              <span className="truncate">{p.cliente || "—"}</span>
                            </span>
                            {p.vacante && (
                              <span
                                className="inline-flex min-w-0 items-center gap-1.5 font-medium text-gray-700 dark:text-slate-300"
                                title="Vacante a la que postuló"
                              >
                                <BriefcaseBusiness size={13} className="shrink-0" />
                                <span className="truncate">{p.vacante}</span>
                              </span>
                            )}
                          </span>
                        </div>
                        <span className="text-[13px] tabular-nums text-gray-700 dark:text-slate-300">
                          {p.fechaSolicitud || "—"}
                        </span>
                        <span>
                          <EstadoRqBadge idEstado={p.idEstado} estado={p.estado} />
                        </span>
                        <span>
                          <EstadoTalentoBadge postulacion={p} />
                        </span>
                        <span className="inline-flex items-center justify-center gap-1.5 text-[13px] tabular-nums text-gray-700 dark:text-slate-300">
                          <Users size={14} className="text-gray-500 dark:text-slate-400" />
                          {p.postulantes}
                        </span>
                        {puedeVerRequerimientos ? (
                          <button
                            type="button"
                            onClick={() => irAlRequerimiento(p.idRequerimiento)}
                            aria-label={`Ver detalle de ${p.codigo || p.titulo}`}
                            title="Ver detalle del requerimiento"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:border-[#009695] hover:bg-[#009695] hover:text-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-500 dark:hover:bg-teal-600"
                          >
                            <ChevronRight size={18} />
                          </button>
                        ) : (
                          <span />
                        )}
                      </div>
                    ))}

                    {!cargando && postulaciones.length === 0 && (
                      <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
                        {hayFiltros ? (
                          <Search size={28} strokeWidth={1.8} className="text-gray-400 dark:text-slate-500" />
                        ) : (
                          <ClipboardList size={28} strokeWidth={1.8} className="text-gray-400 dark:text-slate-500" />
                        )}
                        <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
                          {hayFiltros
                            ? "Ningún requerimiento coincide con la búsqueda"
                            : "Aún no ha postulado a ningún requerimiento"}
                        </p>
                        {hayFiltros && (
                          <p className="text-[13px] text-gray-500 dark:text-slate-400">
                            Prueba con otro nombre, código, cliente o vacante, o cambia el filtro de estado.
                          </p>
                        )}
                      </div>
                    )}

                    {cargando && postulaciones.length === 0 && (
                      <div className="flex items-center justify-center gap-2 px-6 py-14 text-sm text-gray-500 dark:text-slate-400">
                        <Loader2 size={18} className="animate-spin" />
                        Cargando postulaciones…
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pie: rango + paginación */}
              <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 px-6 py-3 dark:border-slate-700">
                <span className="text-[13px] text-gray-600 dark:text-slate-400">{rango}</span>
                {(datos?.totalPaginas ?? 0) > 1 && (
                  <Pagination
                    totalPages={datos?.totalPaginas}
                    currentPage={pagina}
                    onPaginate={setPagina}
                  />
                )}
              </footer>
            </section>
          </div>,
          modalRoot,
        )}
    </>
  );
};
