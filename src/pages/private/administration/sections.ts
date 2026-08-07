import { LucideIcon, SlidersHorizontal, Building2, Users, UserCog, Coins } from "lucide-react";
import { ComponentType } from "react";
import { ParametersManager } from "./parameters/ParametersManager";
import { ClientsManager } from "./clients/ClientsManager";
import { UsersManager } from "./users/UsersManager";
import { ManagersManager } from "./managers/ManagersManager";
import { TariffsManager } from "./tariffs/TariffsManager";

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
  { key: "clients",    label: "Clientes",   icon: Building2,         Component: ClientsManager },
  { key: "users",      label: "Usuarios",   icon: Users,             Component: UsersManager },
  { key: "managers",   label: "Gestores",   icon: UserCog,           Component: ManagersManager },
  { key: "tariffs",    label: "Tarifario",  icon: Coins,             Component: TariffsManager },
];
