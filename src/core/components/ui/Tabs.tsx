import { ReactNode, useState, useEffect, useRef } from "react";

interface TabProps {
  label: string | ReactNode;
  children: ReactNode;
  hasError?: boolean;
  errorMessage?: string;
  onBlur?: () => void;
}

interface TabsProps {
  tabs: TabProps[];
  showErrors?: boolean;
  isDataLoading?: boolean;
  initialTab?: number;
}

export const Tabs = ({
  tabs,
  showErrors = false,
  isDataLoading = false,
  initialTab = 0,
}: TabsProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const prevActiveTabRef = useRef<number>(initialTab);

  const handleTabChange = (index: number) => {
    if (activeTab !== index && tabs[activeTab].onBlur) {
      tabs[activeTab].onBlur!();
    }
    setActiveTab(index);
  };
  useEffect(() => {
    if (prevActiveTabRef.current !== activeTab) {
      prevActiveTabRef.current = activeTab;
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col">
      {/* Pestañas */}
      <div className="relative">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab, index) => (
            <div key={index}>
              <button
                type="button"
                onClick={() => handleTabChange(index)}
                className={`tab ${activeTab === index ? "tab-active" : "tab-inactive"}
                                    ${tab.hasError && showErrors ? "text-red-600" : ""}`}
              >
                {tab.label}
              </button>

              {tab.hasError && showErrors && tab.errorMessage && (
                <div className="absolute z-10 px-3 py-2 text-sm text-nowrap font-medium text-white bg-red-600 rounded-md shadow-lg left-0 -bottom-10 mt-1">
                  {tab.errorMessage}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-1">
        {tabs[activeTab].children}
        {isDataLoading && (
          <div className="absolute inset-0 bg-slate-100 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
