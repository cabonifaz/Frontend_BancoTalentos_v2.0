import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/core/lib/utils"

/*
 * Adaptado a BDT: reproduce .input-checkbox de App.css (h-5 w-5, azul de marca
 * al marcar). No es un <input>: con react-hook-form va dentro de un Controller
 * (checked / onCheckedChange), no con register().
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer grid h-5 w-5 shrink-0 cursor-pointer place-content-center rounded border border-gray-400 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[var(--color-blue)] data-[state=checked]:bg-[var(--color-blue)] data-[state=checked]:text-white dark:border-slate-500 dark:bg-slate-800",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("grid place-content-center text-current")}
    >
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
