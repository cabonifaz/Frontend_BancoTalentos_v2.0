import { Home, FileText, Angry, Users, Link2, User, Settings, BarChart3 } from "lucide-react";
import { NavModule } from "../models/interfaces/NavModule";

/**
 * Catálogo de módulos del Banco de Talentos. El acceso NO se decide aquí:
 * las rutas permitidas provienen de la base de datos (PARAMETROS, ID_MAESTRO=49)
 * y viajan en el token. `path` es la clave que cruza con esas rutas.
 */
export const NAV_MODULES: NavModule[] = [
  { key: "inicio",         icon: Home,     label: "Inicio",         path: "/dashboard/talentos" },
  { key: "requerimientos", icon: FileText, label: "Requerimientos", path: "/dashboard/requerimientos" },
  { key: "lista-negra",    icon: Angry,    label: "Lista Negra",    path: "/dashboard/lista-negra" },
  { key: "entrevistas",    icon: Users,    label: "Entrevistas",    path: "/dashboard/entrevistas" },
  { key: "seleccion",      icon: BarChart3, label: "Selección",     path: "/dashboard/seleccion" },
  { key: "generar-enlace", icon: Link2,    label: "Generar enlace", path: "/dashboard/generarEnlaceRequerimiento" },
  { key: "mi-cuenta",      icon: User,     label: "Mi cuenta",      path: "/dashboard/mi-cuenta" },
  { key: "administration", icon: Settings, label: "Administración", path: "/dashboard/administracion" },
];

/**
 * Sub-pantallas que pertenecen a un módulo pero cuya URL NO cuelga de la ruta del
 * módulo (por eso el prefijo no las cubre). Se navegan desde dentro del módulo, no
 * son entradas del sidebar ni tienen registro propio en PARAMETROS (maestro 49).
 * El acceso se hereda: si el usuario puede entrar a alguno de los módulos dueños,
 * puede entrar a la sub-pantalla.
 */
const AUX_ROUTE_OWNERS: { prefix: string; owners: string[] }[] = [
  { prefix: "/dashboard/nuevo-talento", owners: ["/dashboard/talentos"] },
  { prefix: "/dashboard/formDatos", owners: ["/dashboard/talentos", "/dashboard/requerimientos"] },
  { prefix: "/dashboard/tableAsignarTalento", owners: ["/dashboard/requerimientos"] },
];

const matches = (pathname: string, route: string): boolean =>
  pathname === route || pathname.startsWith(`${route}/`);

/**
 * Una ruta se considera permitida si coincide exactamente con una ruta autorizada
 * o si es una ruta hija de ella (prefijo por segmento). Así `/dashboard/entrevistas`
 * habilita `/dashboard/entrevistas/2036`, `/nueva`, `/editar/2036`, etc. Las
 * sub-pantallas de {@link AUX_ROUTE_OWNERS} heredan el acceso de su módulo dueño.
 */
export const isRouteAllowed = (pathname: string, allowedRoutes: string[]): boolean => {
  if (allowedRoutes.some((r) => matches(pathname, r))) return true;

  const aux = AUX_ROUTE_OWNERS.find((a) => matches(pathname, a.prefix));
  return aux
    ? aux.owners.some((owner) => allowedRoutes.some((r) => matches(owner, r)))
    : false;
};

/** Módulos visibles: los del catálogo cuya ruta está autorizada. */
export const getAllowedModules = (allowedRoutes: string[]): NavModule[] =>
  NAV_MODULES.filter((m) => allowedRoutes.includes(m.path));

/** Primera ruta accesible del usuario (destino de redirección), o null si ninguna. */
export const getFirstAllowedPath = (allowedRoutes: string[]): string | null =>
  getAllowedModules(allowedRoutes)[0]?.path ?? null;
