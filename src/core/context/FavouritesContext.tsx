import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { useApi } from "../hooks/useApi";
import { getUserFavourites, addTalentToFav, createNewFavList } from "../services/apiService";
import { handleError, handleResponse } from "../utilities/errorHandler";
import { useSnackbar } from "notistack";
import { BaseResponse, Favourite, FavouritesResponse } from "../models";

interface FavouritesContextType {
    favourites: Favourite[];
    fetchFavLoading: boolean;
    addToFavLoading: boolean;
    fetchFavourites: () => Promise<void>;
    addToFavourites: (idTalento: number, idColeccion: number) => Promise<BaseResponse>;
    removeFromFavourites: (idTalento: number) => Promise<void>;
    createFavouriteList: (nombreColeccion: string) => Promise<void>;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export const FavouritesProvider = ({ children }: { children: ReactNode }) => {
    const [favourites, setFavourites] = useState<Favourite[]>([]);
    const { enqueueSnackbar } = useSnackbar();

    const { loading: fetchFavLoading, fetch: fetchFavouritesApi } = useApi<FavouritesResponse, null>(getUserFavourites, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => {
            if (response.data.result.idMensaje === 2) {
                setFavourites(response.data.userFavList);
            } else {
                console.error("Error en la respuesta de la API:", response.data.result.mensaje);
            }
        },
    });

    const { fetch: addToFavApi } = useApi<BaseResponse, { idTalento: number; idColeccion: number }>(addTalentToFav, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => {
            if (response.data.idMensaje === 2) {
                enqueueSnackbar("Talento añadido a favoritos", { variant: "success" });
            }
        },
    });

    const { loading: addToFavLoading, fetch: createFavListApi } = useApi<BaseResponse, { collectionName: string }>(createNewFavList, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => {
            handleResponse(response, enqueueSnackbar);
            if (response.data.idMensaje === 2) {
                enqueueSnackbar("Lista de favoritos creada", { variant: "success" });
                fetchFavourites(); // Refresh the favourites list after creating a new list
            }
        },
    });

    const fetchFavourites = useCallback(async () => {
        await fetchFavouritesApi(null);
    }, [fetchFavouritesApi]);

    const addToFavourites = useCallback(async (idTalento: number, idColeccion: number): Promise<BaseResponse> => {
        const response = await addToFavApi({ idTalento, idColeccion });
        return response.data;
    }, [addToFavApi]);

    const removeFromFavourites = useCallback(async (idTalento: number) => {
        // Implement logic to remove from favourites if needed
    }, []);

    const createFavouriteList = useCallback(async (collectionName: string) => {
        await createFavListApi({ collectionName });
    }, [createFavListApi]);

    return (
        <FavouritesContext.Provider value={{ favourites, fetchFavLoading, addToFavLoading, fetchFavourites, addToFavourites, removeFromFavourites, createFavouriteList }}>
            {children}
        </FavouritesContext.Provider>
    );
};

export const useFavouritesContext = () => {
    const context = useContext(FavouritesContext);
    if (!context) {
        throw new Error("useFavouritesContext debe usarse dentro de un FavouritesProvider");
    }
    return context;
};