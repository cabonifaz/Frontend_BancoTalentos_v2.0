import { Home, FileText, Angry, Users, Link2, User } from "lucide-react";
import { NavModule } from "../models/interfaces/NavModule";

/** Roles con acceso al Banco de Talentos hoy. Editar aquí para abrir/cerrar módulos. */
const DEFAULT_ROLES = [1, 4];

export const NAV_MODULES: NavModule[] = [
  { key: "inicio",         icon: Home,     label: "Inicio",         path: "/dashboard/talentos",                    roles: DEFAULT_ROLES },
  { key: "requerimientos", icon: FileText, label: "Requerimientos", path: "/dashboard/requerimientos",              roles: DEFAULT_ROLES },
  { key: "lista-negra",    icon: Angry,    label: "Lista Negra",    path: "/dashboard/lista-negra",                 roles: DEFAULT_ROLES },
  { key: "entrevistas",    icon: Users,    label: "Entrevistas",    path: "/dashboard/entrevistas",                 roles: DEFAULT_ROLES },
  { key: "generar-enlace", icon: Link2,    label: "Generar enlace", path: "/dashboard/generarEnlaceRequerimiento",  roles: DEFAULT_ROLES },
  { key: "mi-cuenta",      icon: User,     label: "Mi cuenta",      path: "/dashboard/mi-cuenta",                   roles: DEFAULT_ROLES },
];

/** ¿Alguno de los roles del usuario está en la lista de roles permitidos? */
export const hasRoleAccess = (userRoles: number[], allowed: number[]): boolean =>
  userRoles.some((r) => allowed.includes(r));

/** Módulos que el usuario puede ver, según sus roles. */
export const getAllowedModules = (userRoles: number[]): NavModule[] =>
  NAV_MODULES.filter((m) => hasRoleAccess(userRoles, m.roles));

/** Primera ruta accesible para el usuario (destino de redirección), o null si ninguna. */
export const getFirstAllowedPath = (userRoles: number[]): string | null =>
  getAllowedModules(userRoles)[0]?.path ?? null;

/** Roles autorizados para un módulo dado por su clave. Usado al proteger rutas. */
export const rolesFor = (key: string): number[] =>
  NAV_MODULES.find((m) => m.key === key)?.roles ?? [];
