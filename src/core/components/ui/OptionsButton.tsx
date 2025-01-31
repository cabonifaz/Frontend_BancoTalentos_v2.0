import { useState } from "react";
import { OutsideClickHandler } from "./OutsideClickHandler";

interface ButtonSelectProps {
    options: string[];
    onSelect: (value: string) => void;
    buttonLabel: string;
    buttonStyle: string;
}

export const OptionsButton = ({
    options,
    onSelect,
    buttonLabel,
    buttonStyle
}: ButtonSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={toggleDropdown}
                className={`${buttonStyle} flex justify-between items-center`}>
                {buttonLabel}
                <img src="/assets/ic_arrow_down.svg" alt="icon arrow down" className="w-6 h-6" />
            </button>

            {isOpen && (
                <OutsideClickHandler onOutsideClick={toggleDropdown}>
                    <div className="absolute left-0 mt-2 w-full bg-white shadow-lg rounded-lg border-gray-300">
                        {options.map((option, index) => (
                            <div
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[#3f3f46]"
                                onClick={() => {
                                    onSelect(option);
                                    setIsOpen(false);
                                }}>
                                {option}
                            </div>
                        ))}
                    </div>
                </OutsideClickHandler>
            )}
        </div>
    );
};
