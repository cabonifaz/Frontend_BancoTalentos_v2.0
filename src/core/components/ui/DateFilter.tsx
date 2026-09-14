import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/core/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/core/components/ui/shadcn/popover";
import { Button } from "@/core/components/ui/shadcn/button";
import { Calendar } from "@/core/components/ui/shadcn/calendar";

interface Props {
    label: string;
    onDateSelected: (date: Date | null) => void;
}

/**
 * Filtro por fecha en píldora: Popover + Calendar de shadcn. Sustituye a
 * react-datepicker con el mismo contrato: elegir una fecha cierra el panel y
 * avisa al padre; la X la quita. Pulsar la fecha ya elegida no la desmarca
 * (`required`), igual que antes.
 */
export const DateFilter = ({ label, onDateSelected }: Props) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        setIsDatePickerOpen(false);
        onDateSelected(date);
    };

    const handleClearDate = () => {
        setSelectedDate(null);
        onDateSelected(null);
    };

    return (
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            {/* La X va fuera del botón que abre el panel: antes era un <button>
                dentro de otro <button>, que no es HTML válido. */}
            <div className="relative inline-flex">
                <PopoverTrigger asChild>
                    <Button
                        variant={selectedDate ? "filter-active" : "filter"}
                        size="none"
                        className={cn("py-2 px-4", selectedDate && "pr-11")}
                    >
                        {selectedDate ? selectedDate.toLocaleDateString() : label}
                    </Button>
                </PopoverTrigger>
                {selectedDate && (
                    <button
                        type="button"
                        aria-label={`Quitar filtro ${label}`}
                        onClick={handleClearDate}
                        className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>
            <PopoverContent align="start" sideOffset={8} className="w-auto p-0">
                <Calendar
                    mode="single"
                    required
                    selected={selectedDate ?? undefined}
                    onSelect={handleDateChange}
                    defaultMonth={selectedDate ?? undefined}
                    autoFocus
                />
            </PopoverContent>
        </Popover>
    );
};
