import { createContext, ReactNode, useContext, useState } from "react";
import { Param, ParamsResponse } from "../models";
import { useApi } from "../hooks/useApi";
import { getParams } from "../services/apiService";
import { handleError } from "../utilities/errorHandler";
import { useSnackbar } from "notistack";

interface ParamContextType {
    paramsByMaestro: Record<number, Param[]>;
    loading: boolean;
    fetchParams: (idMaestros: string) => Promise<void>;
}

const ParamContext = createContext<ParamContextType | undefined>(undefined);

export const ParamsProvider = ({ children }: { children: ReactNode }) => {
    const [paramsByMaestro, setParamsByMaestro] = useState<Record<number, Param[]>>({});
    const { enqueueSnackbar } = useSnackbar();

    const { loading, fetch: fetchParams, } = useApi<ParamsResponse, string>(getParams, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => {
            if (response.data.result.idMensaje === 2) {
                const groupedData = response.data.paramsList.reduce((acc, param) => {
                    if (!acc[param.idMaestro]) {
                        acc[param.idMaestro] = [];
                    }
                    acc[param.idMaestro].push(param);
                    return acc;
                }, {} as Record<number, Param[]>);

                setParamsByMaestro((prev) => ({ ...prev, ...groupedData }));
            } else {
                console.error("Error en la respuesta de la API:", response.data.result.mensaje);
            }
        },
    });

    const fetchParamsData = async (idMaestros: string) => {
        await fetchParams(idMaestros);
    };

    return (
        <ParamContext.Provider value={{ paramsByMaestro, loading, fetchParams: fetchParamsData }}>
            {children}
        </ParamContext.Provider>
    );
};

export const useParamContext = () => {
    const context = useContext(ParamContext);
    if (!context) {
        throw new Error("useAppContext debe usarse dentro de un AppProvider");
    }
    return context;
};