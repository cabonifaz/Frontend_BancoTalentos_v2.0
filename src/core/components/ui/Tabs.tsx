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
                        className={`tab ${activeTab === index
                            ? "tab-active"
                            : "tab-inactive"
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