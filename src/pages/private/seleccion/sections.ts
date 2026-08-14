import { LayoutDashboard, Users, UserPlus, LineChart, LucideIcon } from "lucide-react";
import { ComponentType } from "react";
import { ResumenSection } from "./resumen/ResumenSection";
import { EntrevistasSection } from "./entrevistas/EntrevistasSection";
import { IngresosSection } from "./ingresos/IngresosSection";
import { RendimientoSection } from "./rendimiento/RendimientoSection";

/** Props que reciben todas las secciones (Resumen navega hacia las demás). */
export interface SectionProps {
  onNavigate?: (key: string) => void;
}

export interface SeleccionSection {
  key: string;
  label: string;
  icon: LucideIcon;
  Component: ComponentType<SectionProps>;
}

/**
 * Fuente única de las secciones de Selección (Dashboard + drill-down). Ruta única
 * `/dashboard/seleccion`; el cambio de sección es estado interno. Agregar una
 * sección nueva es añadir una entrada aquí.
 */
export const SELECCION_SECTIONS: SeleccionSection[] = [
  { key: "resumen",     label: "Resumen",     icon: LayoutDashboard, Component: ResumenSection },
  { key: "entrevistas", label: "Entrevistas", icon: Users,           Component: EntrevistasSection },
  { key: "ingresos",    label: "Ingresos",    icon: UserPlus,        Component: IngresosSection },
  { key: "rendimiento", label: "Rendimiento", icon: LineChart,       Component: RendimientoSection },
];
