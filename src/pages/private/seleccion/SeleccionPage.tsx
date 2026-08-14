import { useState } from "react";
import { Dashboard } from "../Dashboard";
import { SeleccionSidebar } from "./SeleccionSidebar";
import { SeleccionContent } from "./SeleccionContent";
import { SELECCION_SECTIONS } from "./sections";

/**
 * Workspace del módulo Selección (autorizado por ruta vía BD). Ruta única
 * `/dashboard/seleccion`: patrón dashboard + drill-down con navegación interna;
 * el detalle de cada sección se carga sólo al entrar en ella.
 */
export const SeleccionPage = () => {
  const [activeKey, setActiveKey] = useState(SELECCION_SECTIONS[0].key);

  return (
    <Dashboard>
      <div className="h-full flex flex-col">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Selección</h1>

        <div className="flex-1 min-h-0 flex gap-6">
          <SeleccionSidebar activeKey={activeKey} onSelect={setActiveKey} />
          <SeleccionContent activeKey={activeKey} onNavigate={setActiveKey} />
        </div>
      </div>
    </Dashboard>
  );
};

export default SeleccionPage;
