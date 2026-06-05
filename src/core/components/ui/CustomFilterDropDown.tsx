import { ReactNode } from "react";
import { OutsideClickHandler } from "./OutsideClickHandler";

interface Props {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  panelSize?: string;
  active?: boolean;
  onClear?: () => void;
}

export const CustomFilterDropDown = ({
  label,
  isOpen,
  onToggle,
  children,
  panelSize = "w-80",
  active = false,
  onClear,
}: Props) => {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`filter ${
          active ? "btn-filter-active" : "btn-filter"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span>{label}</span>

          {active && onClear && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="flex items-center"
            >
              <img
                src="/assets/ic_close_bdt.svg"
                alt="icon close"
                className="h-5 w-5"
              />
            </button>
          )}
        </div>
      </button>

      {isOpen && (
        <OutsideClickHandler onOutsideClick={onToggle}>
          <div
            className={`
              ${panelSize}
              absolute
              z-[43]
              my-4
              rounded-xl
              bg-white
              shadow-lg
              border
              border-gray-200
              p-4
            `}
          >
            {children}
          </div>
        </OutsideClickHandler>
      )}
    </div>
  );
};