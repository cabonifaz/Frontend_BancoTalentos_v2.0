import { Users } from "lucide-react";
import { PlaceholderPanel } from "./PlaceholderPanel";

export const UsersPlaceholder = () => (
  <PlaceholderPanel
    icon={<Users size={26} strokeWidth={1.75} />}
    title="Gestión de Usuarios"
    subtitle="Aquí podrás administrar los usuarios del sistema."
  />
);
