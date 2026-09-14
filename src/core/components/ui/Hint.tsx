import { ReactElement, ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/core/components/ui/shadcn/tooltip";

interface Props {
  /** Texto del tooltip. Vacío o nulo: no hay tooltip y se devuelve el hijo tal cual. */
  label: ReactNode;
  /** Un único elemento que acepte ref (button, span, td…). */
  children: ReactElement;
  side?: "top" | "right" | "bottom" | "left";
}

/**
 * Sustituto del atributo `title` sobre el Tooltip de shadcn: aparece también al
 * enfocar con teclado y con el estilo de la app, no el del navegador.
 *
 * Al migrar un `title`, ojo con dos cosas:
 * - En un botón de solo icono, `title` era además su nombre accesible: ese
 *   botón necesita `aria-label` (el tooltip solo lo describe, no lo nombra).
 * - Radix no recibe eventos de un elemento `disabled`. Si el tooltip importa
 *   justo cuando el botón está deshabilitado, envuélvelo en un <span>.
 */
export const Hint = ({ label, children, side = "top" }: Props) => {
  if (label === null || label === undefined || label === "") return children;
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs break-words">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
