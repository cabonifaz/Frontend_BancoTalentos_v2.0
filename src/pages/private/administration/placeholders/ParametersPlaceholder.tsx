import { SlidersHorizontal } from "lucide-react";
import { PlaceholderPanel } from "./PlaceholderPanel";

export const ParametersPlaceholder = () => (
  <PlaceholderPanel
    icon={<SlidersHorizontal size={26} strokeWidth={1.75} />}
    title="Gestión de Parámetros"
    subtitle="Aquí podrás administrar los parámetros del sistema."
  />
);
