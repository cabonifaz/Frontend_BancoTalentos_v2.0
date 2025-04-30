import { ReactNode } from 'react';

interface Props {
    title: string;
    onAdd: () => void;
    onRemove: (index: number) => void;
    children: ReactNode[];
    canRemoveFirst?: boolean;
}

export const DynamicSection = ({ title, onAdd, onRemove, children, canRemoveFirst = false }: Props) => {
    return (
        <div className="*:mb-4">
            <h3 className="text-[#3f3f46] text-lg my-5 font-semibold">{title}</h3>
            {children.map((child, index) => (
                <div key={index}>
                    {(index > 0 || canRemoveFirst) && (
                        <div className="flex flex-col items-center relative">
                            <div className="absolute inset-x-0 bottom-8 h-px bg-gray-300"></div>
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="max-w-16 max-h-16 bg-white z-10 p-2 stroke-orange-200">
                                {/* Red SVG icon */}
                                <img src="/assets/ic_close.svg" alt="icon close" className="hover:bg-[#fff6f6] rounded-full" />
                            </button>
                        </div>
                    )}
                    {child}
                </div>
            ))}
            <button
                type="button"
                onClick={onAdd}
                className="px-4 py-2 text-[#0b85c3] rounded-lg hover:bg-sky-50">
                Agregar
            </button>
        </div>
    );
};