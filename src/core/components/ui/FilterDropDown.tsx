import { OutsideClickHandler } from "./OutsideClickHandler";

interface Option {
    label: string;
    value: string;
}

interface Props {
    name: string;
    label: string;
    isOpen: boolean;
    options: Option[];
    optionsPanelSize: string;
    optionsType: "radio" | "checkbox";
    inputPosition: "left" | "right";
    onToggle: () => void;
    selectedValues: string[];
    onChange: (selectedValues: string[]) => void;
}

export const FilterDropDown = ({
    label,
    options,
    name,
    optionsType,
    inputPosition,
    optionsPanelSize,
    isOpen,
    onToggle,
    selectedValues,
    onChange,
}: Props) => {
    const handleOptionClick = (index: number) => {
        const inputElement = document.getElementById(`${name}-${index}`) as HTMLInputElement;

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

        if (inputElement.checked) {
            inputElement.checked = false;
            onChange([]);
        } else {
            inputElement.checked = true;
            onChange([value]);
        }
    };

    const handleRemoveOption = (value: string) => {
        if (optionsType !== "checkbox") return;

        const newSelectedValues = selectedValues.filter((v) => v !== value);
        onChange(newSelectedValues);

        const inputElement = document.querySelector(`input[option-value="${value}"]`) as HTMLInputElement;
        if (inputElement) {
            inputElement.checked = false;
        }
    };

    return (
        <div className="relative">
            <button type="button" onClick={onToggle} className="hover:bg-[#27272A] whitespace-nowrap hover:text-white transition-all duration-300 py-2 px-4 rounded-full text-sm bg-[#f2f4f7]">
                {label}
            </button>
            {isOpen && (
                <OutsideClickHandler onOutsideClick={onToggle}>
                    <div className={`${optionsPanelSize} max-h-[480px] overflow-y-auto opacity-100 z-20 absolute bg-white shadow-lg my-4 rounded p-2 flex flex-col`}>
                        <div className={`border border-gray-300 rounded-lg mb-2 p-2 ${optionsType === "checkbox" ? "block" : "hidden"}`}>
                            <ul className="list-none text-[#312e81] flex gap-1 flex-wrap min-h-12">
                                {selectedValues.map((value, index) => (
                                    <li className="bg-[#EEF2FF] rounded-md p-1 flex items-center gap-1 max-w-full" key={index}>
                                        <span className="flex-1 overflow-hidden text-ellipsis text-sm whitespace-nowrap max-w-[calc(100%-10px)]">
                                            {options.find((opt) => opt.value === value)?.label || value}
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
                                    option-value={option.value}
                                    defaultChecked={selectedValues.includes(option.value)}
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