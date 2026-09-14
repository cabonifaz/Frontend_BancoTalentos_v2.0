import { forwardRef, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format, isValid, parse } from "date-fns";
import { cn } from "@/core/lib/utils";
import { Button } from "@/core/components/ui/shadcn/button";
import { Calendar } from "@/core/components/ui/shadcn/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/shadcn/popover";

/** Mismo formato que entregaba el <input type="date">. */
const VALUE_FORMAT = "yyyy-MM-dd";

interface DatePickerProps {
  /** Fecha en "yyyy-MM-dd"; "" o null = sin fecha. */
  value?: string | null;
  /** Recibe "yyyy-MM-dd", o "" al desmarcar la fecha elegida. */
  onChange: (value: string) => void;
  onBlur?: () => void;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  /** Rango de los desplegables de mes y año. */
  fromYear?: number;
  toYear?: number;
  /** Como `min`/`max` del input nativo ("yyyy-MM-dd"): fuera de ahí, días deshabilitados. */
  min?: string;
  max?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
}

/**
 * Se interpreta en hora local: `new Date("2024-03-05")` es medianoche UTC y en
 * Perú (UTC-5) se mostraría como el día 4.
 */
const toDate = (value?: string | null) => {
  if (!value) return undefined;
  const date = parse(value, VALUE_FORMAT, new Date());
  return isValid(date) ? date : undefined;
};

/**
 * Selector de fecha sobre Popover + Calendar de shadcn. Sustituye a un
 * <input type="date"> sin cambiar el contrato: guarda y devuelve "yyyy-MM-dd",
 * así que los esquemas y los payloads no se enteran. Mes y año se eligen en
 * desplegables (útil para fechas de hace años); volver a pulsar la fecha
 * elegida la borra, como vaciar el input.
 */
export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      onBlur,
      id,
      disabled,
      placeholder = "dd/mm/aaaa",
      className,
      fromYear = 1950,
      toYear = new Date().getFullYear() + 5,
      min,
      max,
      ...aria
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const selected = toDate(value);
    const minDate = toDate(min);
    const maxDate = toDate(max);

    return (
      // modal: igual que SearchableSelect, para que funcione dentro de un Dialog.
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            id={id}
            variant="outline"
            size="none"
            disabled={disabled}
            onBlur={onBlur}
            className={cn(
              "h-12 w-full justify-between rounded-lg border-input p-3 text-left font-normal text-foreground hover:bg-transparent dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-800",
              !selected && "text-muted-foreground dark:text-slate-500",
              className
            )}
            {...aria}
          >
            {selected ? format(selected, "dd/MM/yyyy") : placeholder}
            <CalendarIcon className="h-4 w-4 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              onChange(date ? format(date, VALUE_FORMAT) : "");
              setOpen(false);
            }}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            defaultMonth={selected}
            captionLayout="dropdown"
            // Sin flechas: con los desplegables de mes y año no caben en el
            // ancho del calendario. El teclado sigue cambiando de mes (RePág/AvPág).
            hideNavigation
            startMonth={new Date(fromYear, 0)}
            endMonth={new Date(toYear, 11)}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    );
  }
);
DatePicker.displayName = "DatePicker";
