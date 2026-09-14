import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/core/lib/utils"

/*
 * Adaptado a BDT: forma de .badge de App.css (rounded-full, px-2 py-1,
 * font-medium) y sus variantes yellow/green. Es un <span>, no un <div>: los
 * badges van dentro de celdas y párrafos.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // .badge-yellow
        yellow:
          "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-400/15 dark:text-yellow-300",
        // .badge-green
        green:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-400/15 dark:text-green-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
