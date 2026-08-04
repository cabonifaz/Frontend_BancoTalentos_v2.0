import { LucideIcon, SlidersHorizontal, Building2, Users, UserCog } from "lucide-react";
import { ComponentType } from "react";
import { ParametersManager } from "./parameters/ParametersManager";
import { ClientsPlaceholder } from "./placeholders/ClientsPlaceholder";
import { UsersPlaceholder } from "./placeholders/UsersPlaceholder";
import { ManagersPlaceholder } from "./placeholders/ManagersPlaceholder";

export interface AdminSection {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Componente de la sección. Reemplazar el placeholder por el mantenimiento real. */
  Component: ComponentType;
}

/**
 * Fuente única de las secciones de Administración: alimenta tanto la navegación
 * como el contenido. Agregar un mantenimiento nuevo (Tarifas, Perfiles, Roles…)
 * es añadir una entrada aquí; el layout no cambia.
 */
export const ADMIN_SECTIONS: AdminSection[] = [
  { key: "parameters", label: "Parámetros", icon: SlidersHorizontal, Component: ParametersManager },
  { key: "clients",    label: "Clientes",   icon: Building2,         Component: ClientsPlaceholder },
  { key: "users",      label: "Usuarios",   icon: Users,             Component: UsersPlaceholder },
  { key: "managers",   label: "Gestores",   icon: UserCog,           Component: ManagersPlaceholder },
];
