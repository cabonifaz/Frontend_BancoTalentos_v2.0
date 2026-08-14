import { SELECCION_SECTIONS } from "./sections";

interface Props {
  activeKey: string;
  onSelect: (key: string) => void;
}

export const SeleccionSidebar = ({ activeKey, onSelect }: Props) => (
  <aside className="w-60 flex-shrink-0 h-full bg-white rounded-xl border border-gray-200 shadow-sm p-3 overflow-y-auto">
    <p className="px-3 pt-1 pb-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">
      Selección
    </p>
    <div className="border-t border-gray-100 mb-2" />
    <nav className="flex flex-col gap-0.5">
      {SELECCION_SECTIONS.map(({ key, label, icon: Icon }) => {
        const active = key === activeKey;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
              active
                ? "bg-[#009688]/10 text-[#00796B] font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon size={18} strokeWidth={1.75} className="flex-shrink-0" />
            {label}
          </button>
        );
      })}
    </nav>
  </aside>
);
