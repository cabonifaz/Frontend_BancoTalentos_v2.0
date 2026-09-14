import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/components/ui/shadcn/dropdown-menu";

interface ButtonSelectProps {
  options: string[];
  onSelect: (value: string) => void;
  buttonLabel: string;
  buttonStyle: string;
  /** Icono delante del texto (opcional). */
  icon?: ReactNode;
  /** Clases de la flecha; por defecto 24 px. */
  chevronClassName?: string;
}

/**
 * Botón con menú de opciones sobre el DropdownMenu de shadcn: se abre y se
 * recorre con teclado (flechas, Enter, Escape) y se anuncia como menú.
 * `modal={false}`: como antes, no bloquea el scroll de la página.
 */
export const OptionsButton = ({
  options,
  onSelect,
  buttonLabel,
  buttonStyle,
  icon,
  chevronClassName = "w-6 h-6",
}: ButtonSelectProps) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`${buttonStyle} flex justify-between items-center`}
        >
          {icon}
          {buttonLabel}
          <ChevronDown className={chevronClassName} aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="min-w-[10rem] rounded-lg p-0 shadow-lg"
      >
        {options.map((option, index) => (
          <DropdownMenuItem
            key={index}
            onSelect={() => onSelect(option)}
            className="cursor-pointer rounded-none px-4 py-2 text-base text-[#3f3f46] focus:bg-gray-100 dark:text-slate-200 dark:focus:bg-slate-700"
          >
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
