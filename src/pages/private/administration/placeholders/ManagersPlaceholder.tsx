import { UserCog } from "lucide-react";
import { PlaceholderPanel } from "./PlaceholderPanel";

export const ManagersPlaceholder = () => (
  <PlaceholderPanel
    icon={<UserCog size={26} strokeWidth={1.75} />}
    title="Gestión de Gestores"
    subtitle="Aquí podrás administrar los gestores del sistema."
  />
);
