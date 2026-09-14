import * as React from "react"

import { cn } from "@/core/lib/utils"

/*
 * Adaptado a BDT: reproduce .input de App.css (p-3, rounded-lg, fondo slate-800
 * en oscuro). Sin tamaño de texto propio, como el <input> que sustituye: hereda
 * el del contenedor. El foco pasa de un borde índigo a un anillo con el azul de
 * marca (--ring), el mismo que ya usa el paginador.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-lg border border-input bg-transparent p-3 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
