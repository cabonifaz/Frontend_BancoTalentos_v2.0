import { ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  title: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  children: ReactNode[];
  canRemoveFirst?: boolean;
  canAddSections?: boolean;
  headerExtra?: ReactNode;
  itemVariant?: "plain" | "card";
}

export const DynamicSection = ({
  title,
  onAdd,
  onRemove,
  children,
  canRemoveFirst = false,
  canAddSections = true,
  headerExtra,
  itemVariant = "plain",
}: Props) => {
  return (
    <div className="*:mb-4">
      <div className="flex items-center justify-between my-5">
        <h3 className="text-[#3f3f46] text-lg font-semibold">{title}</h3>
        {headerExtra && <div>{headerExtra}</div>}
      </div>
      {children.map((child, index) => {
        const removable = index > 0 || canRemoveFirst;

        // Variante "card": cada elemento dentro de su propia tarjeta con la "X"
        // en la esquina superior derecha (mismo concepto visual que la sección
        // de experiencia laboral del modal "Actualizar con CV").
        if (itemVariant === "card") {
          return (
            <div
              key={index}
              className="rounded-lg border border-gray-200 p-3"
            >
              {removable && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    aria-label="Eliminar"
                    className="-mr-1 -mt-1 rounded-full p-1 hover:bg-[#fff6f6]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
              {child}
            </div>
          );
        }

        return (
          <div key={index}>
            {removable && (
              <div className="flex flex-col items-center relative">
                <div className="absolute inset-x-0 bottom-8 h-px bg-gray-300"></div>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="max-w-16 max-h-16 bg-white z-10 p-2 stroke-orange-200"
                >
                  <X className="w-6 h-6 hover:bg-[#fff6f6] rounded-full" />
                </button>
              </div>
            )}
            {child}
          </div>
        );
      })}
      {canAddSections && (
        <button
          type="button"
          onClick={onAdd}
          className="px-4 py-2 text-[#0b85c3] rounded-lg hover:bg-sky-50"
        >
          Agregar
        </button>
      )}
    </div>
  );
};
