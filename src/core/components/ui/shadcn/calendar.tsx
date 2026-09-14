import * as React from "react"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react"
import { DayPicker } from "react-day-picker"
import type { DropdownProps } from "react-day-picker"
import { es } from "date-fns/locale"

import { cn } from "@/core/lib/utils"
import { buttonVariants } from "@/core/components/ui/shadcn/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/shadcn/select"

/*
 * Calendar de shadcn reescrito para react-day-picker v9. El del registro para
 * Tailwind 3 usa la v8, que exige date-fns ≤ 3, y BDT usa date-fns 4.
 * En español por defecto (locale de date-fns; `locale` lo sobrescribe).
 * Los estados (selected, today…) se aplican a la celda: por eso estilan su botón.
 */
export type CalendarProps = React.ComponentProps<typeof DayPicker>

/**
 * Desplegable de mes y año (captionLayout="dropdown") sobre el Select de la
 * app. El de serie es un <select> nativo: su lista la pinta el sistema, con
 * otra tipografía y los textos pegados al borde. react-day-picker espera un
 * evento de <select>, así que se le entrega uno con el valor elegido.
 */
function CalendarDropdown({
  options = [],
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const current = options.find((option) => String(option.value) === String(value))
  return (
    <Select
      value={value === undefined ? undefined : String(value)}
      disabled={disabled}
      onValueChange={(next) =>
        onChange?.({
          target: { value: next },
        } as React.ChangeEvent<HTMLSelectElement>)
      }
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className="h-8 w-auto gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium capitalize"
      >
        <SelectValue>{current?.label}</SelectValue>
      </SelectTrigger>
      {/* max-h: la lista de años es larga; al abrir, Radix la lleva hasta el
          año elegido. */}
      <SelectContent className="max-h-64">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={String(option.value)}
            disabled={option.disabled}
            className="capitalize"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "flex flex-col gap-4",
        month_caption: "flex h-8 items-center justify-center",
        caption_label: "flex items-center gap-1 text-sm font-medium capitalize",
        // captionLayout="dropdown": mes y año con CalendarDropdown (abajo).
        dropdowns: "flex items-center gap-2",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "none" }),
          "h-7 w-7 p-0 opacity-60 hover:opacity-100"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "none" }),
          "h-7 w-7 p-0 opacity-60 hover:opacity-100"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-8 text-[0.8rem] font-normal capitalize text-muted-foreground",
        week: "mt-2 flex w-full",
        day: "relative h-8 w-8 p-0 text-center text-sm",
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "none" }),
          "h-8 w-8 rounded-md p-0 font-normal"
        ),
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button:hover]:bg-primary [&>button:hover]:text-primary-foreground",
        today: "[&>button]:bg-accent [&>button]:text-accent-foreground",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClass }) => {
          const Icon =
            orientation === "left"
              ? ChevronLeft
              : orientation === "right"
                ? ChevronRight
                : orientation === "up"
                  ? ChevronUp
                  : ChevronDown
          return <Icon className={cn("h-4 w-4", chevronClass)} />
        },
        Dropdown: CalendarDropdown,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
