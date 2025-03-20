import { ReactNode, useState } from "react";

interface TabProps {
    label: string;
    children: ReactNode;
}

interface TabsProps {
    tabs: TabProps[];
}

export const Tabs = ({ tabs }: TabsProps) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="flex flex-col">
            {/* Pestañas */}
            <div className="flex border-b border-gray-200">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === index
                            ? "text-blue-500 border-b-2 border-blue-500"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Contenido de la pestaña activa */}
            <div className="mt-1">{tabs[activeTab].children}</div>
        </div>
    );
};