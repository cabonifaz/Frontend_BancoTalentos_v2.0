import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
    name: string;
    label: string;
    isOpen: boolean;
    options: string[];
    optionsPanelSize: string;
    optionsType: "radio" | "checkbox";
    inputPosition: "left" | "right";
    onToggle: () => void;
}

export const FilterDropDown = ({ label, options, name, optionsType, inputPosition, optionsPanelSize, isOpen, onToggle }: Props) => {
    // #312e81 #EEF2FF
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [selectedOptions, setSelectedOptions] = useState<Map<string, string>>(new Map());

    const handleOptionClick = (index: number) => {
        const inputElement = document.getElementById(`${name}-${index}`) as HTMLInputElement;

        if (!inputElement) return;

        if (optionsType === "checkbox") {
            inputElement.checked = !inputElement.checked;
            const value = inputElement.getAttribute("option-value");

            if (!value) return;

            const newMap = new Map(selectedOptions);

            if (newMap.has(value)) {
                newMap.delete(value);
                inputElement.checked = false;
            } else {
                newMap.set(value, value);
                inputElement.checked = true;
            }

            setSelectedOptions(newMap);
            return;
        }

        if (inputElement.checked) {
            inputElement.checked = false;
            return;
        }
        inputElement.checked = true;
    };

    const handleRemoveOption = (value: string) => {
        if (optionsType !== "checkbox") return;

        const newMap = new Map(selectedOptions);
        newMap.delete(value);
        setSelectedOptions(newMap);

        const inputElement = document.querySelector(`input[option-value="${value}"]`) as HTMLInputElement;
        if (inputElement) {
            inputElement.checked = false;
        }
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
            <div className={`${optionsPanelSize} ${isOpen ? "max-h-[500px] opacity-100 z-20" : "max-h-0 opacity-0"} absolute bg-white shadow-lg mt-4 rounded p-2 transition-all duration-300 overflow-hidden flex flex-col`}>
                <div className={`border border-gray-300 rounded-lg mb-2 p-2 min-h-12 ${optionsType === "checkbox" ? "block" : "hidden"}`}>
                    <ul className="list-none text-[#312e81] flex gap-1 flex-wrap">
                        {Array.from(selectedOptions.entries()).map(([value], index) => (
                            <li className="bg-[#EEF2FF] rounded-md p-1 flex items-center gap-1 max-w-full" key={index}>
                                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap max-w-[calc(100%-10px)]">
                                    {value}
                                </span>
                                <button type="button" onClick={() => handleRemoveOption(value)}>
                                    <img src="/assets/ic_close.svg" alt="icon close" className="h-5 w-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                {options.map((option, index) => (
                    <div
                        key={index}
                        onClick={() => handleOptionClick(index)}
                        className={`${inputPosition === "left" ? "gap-2" : "justify-between flex-row-reverse"} flex items-center hover:bg-[#f2f4f7] rounded-lg px-2 cursor-pointer`}>

                        <input
                            name={name}
                            type={optionsType}
                            id={`${name}-${index}`}
                            option-value={option}
                            className={`cursor-pointer h-4 w-4 accent-[#4f46e5]`}
                        />
                        <p className="flex items-center cursor-pointer text-sm my-2">
                            {option}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}