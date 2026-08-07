import { useState } from "react";
import { Dashboard } from "../Dashboard";
import { AdministrationSidebar } from "./AdministrationSidebar";
import { AdministrationContent } from "./AdministrationContent";
import { ADMIN_SECTIONS } from "./sections";

/**
 * Workspace de Administración (solo SUPERADMIN, autorizado por ruta vía BD).
 * Ruta única `/dashboard/administracion`: el cambio entre mantenimientos es estado
 * interno. Migrar a rutas independientes en el futuro solo requiere mapear cada
 * sección a su ruta; el layout ya está desacoplado.
 */
export const AdministrationPage = () => {
  const [activeKey, setActiveKey] = useState(ADMIN_SECTIONS[0].key);

  return (
    <Dashboard>
      <div className="h-full flex flex-col">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Administración
        </h1>

        <div className="flex-1 min-h-0 flex gap-6">
          <AdministrationSidebar activeKey={activeKey} onSelect={setActiveKey} />
          <AdministrationContent activeKey={activeKey} />
        </div>
      </div>
    </Dashboard>
  );
};

export default AdministrationPage;
