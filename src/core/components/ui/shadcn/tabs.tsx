import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/core/lib/utils"

/*
 * Adaptado a BDT: pestañas subrayadas (.tab / .tab-active de App.css), no las
 * "píldoras" de serie. La inactiva lleva un borde transparente del mismo grosor
 * para que activar una pestaña no desplace la fila 2px.
 *
 * OJO: Radix desmonta el contenido de las pestañas inactivas. Si una pestaña
 * contiene un formulario, pon `forceMount` en su TabsContent o se perderá lo
 * escrito al cambiar de pestaña; TabsContent ya oculta las inactivas
 * (data-[state=inactive]:hidden). `group` en TabsTrigger deja que lo que va
 * dentro reaccione a la pestaña activa (group-data-[state=active]:…).
 */

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex overflow-x-auto border-b border-gray-200 dark:border-slate-700",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "group whitespace-nowrap border-b-2 border-transparent px-4 py-2 text-sm font-medium text-[var(--color-tab-inactive)] transition-colors hover:text-[var(--color-tab-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-[var(--color-tab-active)] data-[state=active]:text-[var(--color-tab-active)] data-[state=active]:hover:text-[var(--color-tab-active)]",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-1 focus-visible:outline-none data-[state=inactive]:hidden",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
