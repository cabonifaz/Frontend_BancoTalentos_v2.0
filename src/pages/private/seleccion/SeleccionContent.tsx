import { SELECCION_SECTIONS } from "./sections";

interface Props {
  activeKey: string;
  onNavigate: (key: string) => void;
}

export const SeleccionContent = ({ activeKey, onNavigate }: Props) => {
  const section =
    SELECCION_SECTIONS.find((s) => s.key === activeKey) ?? SELECCION_SECTIONS[0];
  const { Component } = section;

  return (
    <section className="flex-1 min-w-0 h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-y-auto">
      <Component onNavigate={onNavigate} />
    </section>
  );
};
