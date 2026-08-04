import { Building2 } from "lucide-react";
import { PlaceholderPanel } from "./PlaceholderPanel";

export const ClientsPlaceholder = () => (
  <PlaceholderPanel
    icon={<Building2 size={26} strokeWidth={1.75} />}
    title="Gestión de Clientes"
    subtitle="Aquí podrás administrar los clientes del sistema."
  />
);
