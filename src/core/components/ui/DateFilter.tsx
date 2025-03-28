import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { OutsideClickHandler } from "./OutsideClickHandler";

interface Props {
    label: string;
    onDateSelected: (date: Date | null) => void;
}

export const DateFilter = ({ label, onDateSelected }: Props) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);
        setIsDatePickerOpen(false);
        onDateSelected(date);
    };

    const handleClearDate = () => {
        setSelectedDate(null);
        onDateSelected(null);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className={`filter ${selectedDate
                    ? "btn-filter-active"
                    : "btn-filter"
                    }`}
            >
                <div className="flex items-center gap-2">
                    <span>{selectedDate ? selectedDate.toLocaleDateString() : label}</span>
                    {selectedDate && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClearDate();
                            }}
                            className="flex items-center"
                        >
                            <img src="/assets/ic_close_bdt.svg" alt="icon close" className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </button>

            {isDatePickerOpen && (
                <OutsideClickHandler onOutsideClick={() => setIsDatePickerOpen(false)}>
                    <div className="absolute z-20 mt-2">
                        <DatePicker
                            selected={selectedDate}
                            onChange={handleDateChange}
                            inline
                            shouldCloseOnSelect={true}
                        />
                    </div>
                </OutsideClickHandler>
            )}
        </div>
    );
};