import { useState } from "react";
import { X } from "lucide-react";
import { OutsideClickHandler } from "./OutsideClickHandler";

export interface BaseOption {
  value: string | number;
  label: string;
}

interface Props<T extends BaseOption> {
  name: string;
  label: string;
  isOpen: boolean;
  options: T[];
  sortOptions?: boolean;
  optionsPanelSize: string;
  optionsType: "radio" | "checkbox";
  inputPosition: "left" | "right";
  searchable?: boolean;
  onToggle: () => void;
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
}

export const FilterDropDown = <T extends BaseOption>({
  label,
  options,
  name,
  sortOptions = true,
  optionsType,
  inputPosition,
  optionsPanelSize,
  searchable = false,
  isOpen,
  onToggle,
  selectedValues,
  onChange,
}: Props<T>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const handleInputClick = (
    event: React.MouseEvent,
    value: string
  ) => {
    event.stopPropagation();

    if (optionsType === "radio") {
      if (selectedValues.includes(value)) {
        event.preventDefault();
        onChange([]);
        setTimeout(() => {
          const inputElement = document.querySelector(
            `input[option-value="${value}"]`
          ) as HTMLInputElement;
          if (inputElement) {
            inputElement.checked = false;
          }
        }, 0);
      } else {
        onChange([value]);
      }
    } else if (optionsType === "checkbox") {
      const newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      onChange(newSelectedValues);
    }
  };

  const handleOptionClick = (index: number) => {
    const inputElement = document.getElementById(
      `${name}-${index}`
    ) as HTMLInputElement;
    if (!inputElement) return;

    const value = inputElement.getAttribute("option-value") || "";

    if (optionsType === "checkbox") {
      inputElement.checked = !inputElement.checked;
      const newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];

      onChange(newSelectedValues);
      return;
    }

    if (selectedValues.includes(value)) {
      inputElement.checked = false;
      onChange([]);
    } else {
      inputElement.checked = true;
      onChange([value]);
    }
  };

  const handleRemoveOption = (value: string) => {
    if (optionsType !== "checkbox") return;

    const newSelectedValues = selectedValues.filter(
      (v) => v !== value
    );
    onChange(newSelectedValues);

    const inputElement = document.querySelector(
      `input[option-value="${value}"]`
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.checked = false;
    }
  };

  const handleClearFilter = () => {
    onChange([]);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`filter ${
          selectedValues.length > 0
            ? "btn-filter-active"
            : "btn-filter"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span>{label}</span>
          {selectedValues.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilter();
              }}
              className="flex items-center"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </button>
      {isOpen && (
        <OutsideClickHandler onOutsideClick={onToggle}>
          <div
            className={`${optionsPanelSize} max-h-[480px] overflow-y-auto opacity-100 z-[43] absolute bg-white shadow-lg my-4 rounded p-2 flex flex-col dark:bg-slate-800`}
          >
            {searchable && (
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Buscar opciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 dark:border-slate-600"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <div
              className={`border border-gray-300 rounded-lg mb-2 p-2 dark:border-slate-600 ${
                optionsType === "checkbox" ? "block" : "hidden"
              }`}
            >
              <ul className="list-none text-[#312e81] flex gap-1 flex-wrap min-h-8 dark:text-indigo-300">
                {selectedValues.map((value, index) => (
                  <li
                    className="bg-[#EEF2FF] rounded-md p-1 flex items-center gap-1 max-w-full dark:bg-indigo-500/10"
                    key={index}
                  >
                    <span className="flex-1 overflow-hidden text-ellipsis text-sm whitespace-nowrap max-w-[calc(100%-10px)]">
                      {options.find(
                        (opt) => opt.value.toString() === value
                      )?.label || value}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(value)}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {([...options]
              .filter((option) =>
                searchable && searchTerm
                  ? option.label
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  : true
              ))
              .sort((a, b) =>
                sortOptions
                  ? a.label.localeCompare(b.label, undefined, {
                      sensitivity: "base",
                    })
                  : 0
              )
              .map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  className={`${
                    inputPosition === "left"
                      ? "gap-2"
                      : "justify-between flex-row-reverse"
                  } flex items-center hover:bg-[#f2f4f7] rounded-lg px-2 cursor-pointer dark:hover:bg-slate-700`}
                >
                  <input
                    name={name}
                    type={optionsType}
                    id={`${name}-${index}`}
                    option-value={option.value}
                    checked={selectedValues.includes(
                      option.value.toString()
                    )}
                    onClick={(e) =>
                      handleInputClick(e, option.value.toString())
                    }
                    readOnly
                    className="cursor-pointer h-4 w-4 accent-[#4f46e5]"
                  />
                  <p className="flex items-center cursor-pointer text-sm my-2">
                    {option.label}
                  </p>
                </div>
              ))}
          </div>
        </OutsideClickHandler>
      )}
    </div>
  );
};
