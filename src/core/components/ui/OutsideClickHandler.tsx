import { ReactNode, useEffect, useRef } from "react";

interface Props {
    onOutsideClick: () => void;
    children: ReactNode;
}

export const OutsideClickHandler = ({ onOutsideClick, children }: Props) => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                onOutsideClick();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onOutsideClick]);

    return <div ref={wrapperRef}>{children}</div>;
};