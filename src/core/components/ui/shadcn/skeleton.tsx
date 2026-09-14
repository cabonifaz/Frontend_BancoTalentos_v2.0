import * as React from "react"

import { cn } from "@/core/lib/utils"

/*
 * Adaptado a BDT: mismo gris que usaban los esqueletos del proyecto
 * (gray-300 / slate-600) en lugar del bg-primary/10 de serie, que aquí
 * saldría verdoso.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-300 dark:bg-slate-600", className)}
      {...props}
    />
  )
}

export { Skeleton }
