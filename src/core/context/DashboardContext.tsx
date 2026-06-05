import { createContext, useContext } from "react";

interface DashboardContextType {
  openSidebar: () => void;
  userInfo: {
    fullName: string;
    firstLetter: string;
    rol: string;
  };
}

export const DashboardContext = createContext<DashboardContextType>({
  openSidebar: () => {},
  userInfo: { fullName: "", firstLetter: "", rol: "" },
});

export const useDashboard = () => useContext(DashboardContext);
