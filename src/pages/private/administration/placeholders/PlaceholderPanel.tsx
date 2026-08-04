import { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  subtitle: string;
}

/** Contenedor visual reutilizable para las secciones aún sin implementar. */
export const PlaceholderPanel = ({ icon, title, subtitle }: Props) => (
  <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center gap-3 px-6 py-12">
    <div className="w-14 h-14 rounded-full bg-[#009688]/10 flex items-center justify-center text-[#009688]">
      {icon}
    </div>
    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    <p className="text-sm text-gray-500 max-w-sm">{subtitle}</p>
    <span className="mt-1 inline-flex items-center rounded-full bg-gray-100 text-gray-500 text-xs font-medium px-3 py-1">
      Próximamente…
    </span>
  </div>
);
