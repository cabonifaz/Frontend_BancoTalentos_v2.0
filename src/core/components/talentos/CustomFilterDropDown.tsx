import { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/core/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/shadcn/popover";
import { Button } from "@/core/components/ui/shadcn/button";

interface Props {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  panelSize?: string;
  active?: boolean;
  onClear?: () => void;
}

/**
 * Filtro en píldora con panel libre (el contenido lo pone el padre), sobre el
 * Popover de shadcn. Misma API: el padre controla `isOpen`/`onToggle`.
 */
export const CustomFilterDropDown = ({
  label,
  isOpen,
  onToggle,
  children,
  panelSize = "w-80",
  active = false,
  onClear,
}: Props) => {
  const showClear = active && !!onClear;

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        if (open !== isOpen) onToggle();
      }}
    >
      {/* La X va fuera del botón que abre el panel: antes era un <button>
          dentro de otro <button>, que no es HTML válido. */}
      <div className="relative inline-flex">
        <PopoverTrigger asChild>
          <Button
            variant={active ? "filter-active" : "filter"}
            size="none"
            className={cn("py-2 px-4", showClear && "pr-11")}
          >
            {label}
          </Button>
        </PopoverTrigger>
        {showClear && (
          <button
            type="button"
            aria-label={`Quitar filtro ${label}`}
            onClick={onClear}
            className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <PopoverContent
        align="start"
        sideOffset={8}
        className={cn(panelSize, "rounded-xl p-4 shadow-lg")}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};
