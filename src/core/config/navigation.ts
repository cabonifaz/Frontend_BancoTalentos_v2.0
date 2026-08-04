import { Home, FileText, Angry, Users, Link2, User } from "lucide-react";
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
  { key: "generar-enlace", icon: Link2,    label: "Generar enlace", path: "/dashboard/generarEnlaceRequerimiento" },
  { key: "mi-cuenta",      icon: User,     label: "Mi cuenta",      path: "/dashboard/mi-cuenta" },
];

/**
 * Una ruta se considera permitida si coincide exactamente con una ruta autorizada
 * o si es una ruta hija de ella (prefijo por segmento). Así `/dashboard/entrevistas`
 * habilita `/dashboard/entrevistas/2036`, `/nueva`, `/editar/2036`, etc.
 */
export const isRouteAllowed = (pathname: string, allowedRoutes: string[]): boolean =>
  allowedRoutes.some((r) => pathname === r || pathname.startsWith(`${r}/`));

/** Módulos visibles: los del catálogo cuya ruta está autorizada. */
export const getAllowedModules = (allowedRoutes: string[]): NavModule[] =>
  NAV_MODULES.filter((m) => allowedRoutes.includes(m.path));

/** Primera ruta accesible del usuario (destino de redirección), o null si ninguna. */
export const getFirstAllowedPath = (allowedRoutes: string[]): string | null =>
  getAllowedModules(allowedRoutes)[0]?.path ?? null;
