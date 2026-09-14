import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/core/lib/utils"

/*
 * Adaptado a BDT: cada variante reproduce una clase .btn-* de App.css (misma
 * paleta y mismo hover) para que un <Button> se vea igual que el botón que
 * sustituye. Como .btn, no fija tamaño de texto ni peso: los pone la pantalla.
 * Tampoco fuerza el tamaño de los iconos (el [&_svg]:size-4 de serie pisaría
 * los w-5/w-6 que usan los botones del proyecto).
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // .btn-primary
        default:
          "bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)]",
        // .btn-blue
        blue: "bg-[var(--color-blue)] text-white hover:bg-[var(--color-blue-hover)]",
        // .btn-orange
        orange:
          "bg-[var(--color-orange)] text-white hover:bg-[var(--color-orange-hover)]",
        // .btn-yellow: mismo amarillo con texto oscuro (blanco no contrasta).
        yellow:
          "bg-[var(--color-orange)] text-gray-900 hover:bg-[var(--color-orange-hover)]",
        // .btn-red
        destructive:
          "bg-[var(--color-red)] text-white hover:bg-[var(--color-red-hover)]",
        // .btn-outline-gray
        outline:
          "border border-[var(--color-gray-border)] bg-transparent text-[var(--color-gray-text)] hover:bg-gray-50 dark:hover:bg-slate-700",
        // .btn-outline-blue
        "outline-blue":
          "border border-[var(--color-blue)] bg-transparent text-[var(--color-blue)] hover:bg-[var(--color-blue-hover-outline)]",
        // .btn-text
        text: "text-[#0b85c3] hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-400/10",
        // .filter + .btn-filter / .btn-filter-active
        filter:
          "whitespace-nowrap rounded-full border text-sm duration-300 bg-white hover:bg-[var(--color-dark-bg)] hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600",
        "filter-active":
          "whitespace-nowrap rounded-full border text-sm duration-300 bg-[var(--color-dark-bg)] text-white",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // .btn: py-2 px-4
        default: "px-4 py-2",
        sm: "px-3 py-1 text-sm",
        lg: "px-6 py-3",
        icon: "h-9 w-9",
        // Para botones que ya traen su propio padding.
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        // Por defecto "button", no "submit": dentro de un <form> un botón sin
        // type envía el formulario, y casi ningún botón de BDT es de envío.
        type={asChild ? type : type ?? "button"}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
