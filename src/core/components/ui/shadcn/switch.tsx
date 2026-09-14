import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/core/lib/utils"

/*
 * Switch de shadcn (Radix) con el aspecto de los interruptores que BDT pintaba a
 * mano con un checkbox `sr-only` + una pista: azul (blue-600) al activarse,
 * gris al apagarse. Ahora se anuncia como switch y se acciona con Espacio.
 * Dos tamaños, los que usaba el proyecto: sm = 32×20, md = 40×24.
 */
const sizes = {
  sm: { root: "h-5 w-8 border-2", thumb: "data-[state=checked]:translate-x-3" },
  md: { root: "h-6 w-10 border-4", thumb: "data-[state=checked]:translate-x-4" },
} as const

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    size?: keyof typeof sizes
    /** Para tamaños fuera de sm/md (p. ej. el selector Virtual/Presencial). */
    thumbClassName?: string
  }
>(({ className, size = "sm", thumbClassName, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-slate-600",
      sizes[size].root,
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 data-[state=unchecked]:translate-x-0 dark:bg-slate-800",
        sizes[size].thumb,
        thumbClassName
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
