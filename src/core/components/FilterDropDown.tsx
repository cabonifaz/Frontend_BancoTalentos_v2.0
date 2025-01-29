import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
    name: string;
    label: string;
    options: string[];
    optionsPanelSize: string;
    optionsType: "radio" | "checkbox";
    inputPosition: "left" | "right";
    isOpen: boolean;
    onToggle: () => void;
}

export const FilterDropDown = ({ label, options, name, optionsType, inputPosition, optionsPanelSize, isOpen, onToggle }: Props) => {
    // #312e81 #EEF2FF
    const [selectedValue, setSelectedValue] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleOptionClick = () => {
        setSelectedValue(!selectedValue);
    };

    const handleOutsideClick = useCallback((event: MouseEvent) => {
        if (!dropdownRef.current?.contains(event.target as Node) && isOpen) {
            onToggle();
        }
    }, [isOpen, onToggle]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
        } else {
            document.removeEventListener("mousedown", handleOutsideClick);
        }
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [isOpen, handleOutsideClick]);

    return (
        <div ref={dropdownRef} className="relative">
            <button type="button" onClick={onToggle} className="hover:bg-[#27272A] whitespace-nowrap hover:text-white transition-all duration-300 py-2 px-4 rounded-full text-sm bg-[#f2f4f7]">
                {label}
            </button>
            <div className={`${optionsPanelSize} ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"} absolute bg-white shadow-lg mt-2 rounded p-2 z-10 transition-all duration-300 overflow-hidden`}>
                {options.map((option, index) => (
                    <div key={index} className={`${inputPosition === "left" ? "gap-2" : "justify-between"} flex items-center hover:bg-[#f2f4f7] rounded-lg px-2`}>
                        {inputPosition === "left" && (
                            <input
                                type={optionsType}
                                name={name}
                                id={`${name}-${index}`}
                                onChange={handleOptionClick}
                                className="cursor-pointer h-4 w-4 accent-[#4f46e5]" />
                        )}
                        <label htmlFor={`${name}-${index}`} className="flex items-center cursor-pointer text-sm my-2">
                            {option}
                        </label>
                        {inputPosition === "right" && (
                            <input
                                type={optionsType}
                                name={name}
                                id={`${name}-${index}`}
                                onChange={handleOptionClick}
                                className="cursor-pointer h-4 w-4 accent-[#4f46e5]" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}