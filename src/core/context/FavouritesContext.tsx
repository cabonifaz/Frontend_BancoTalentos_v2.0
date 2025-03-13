import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { useApi } from "../hooks/useApi";
import { getUserFavourites, addTalentToFav, createNewFavList, removeTalentFromFav } from "../services/apiService";
import { handleError, handleResponse } from "../utilities/errorHandler";
import { useSnackbar } from "notistack";
import { BaseResponse, Favourite, FavouritesResponse } from "../models";

interface FavouritesContextType {
    favourites: Favourite[];
    fetchFavLoading: boolean;
    addToFavLoading: boolean;
    fetchFavourites: () => Promise<void>;
    addToFavourites: (idTalento: number, idColeccion: number) => Promise<BaseResponse>;
    removeFromFavourites: (idTalento: number, idColeccion: number) => Promise<BaseResponse>;
    createFavouriteList: (nombreColeccion: string) => Promise<void>;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export const FavouritesProvider = ({ children }: { children: ReactNode }) => {
    const [favourites, setFavourites] = useState<Favourite[]>([]);
    const { enqueueSnackbar } = useSnackbar();

    // gets the collection a user owns
    const { loading: fetchFavLoading, fetch: fetchFavouritesApi } = useApi<FavouritesResponse, null>(getUserFavourites, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => {
            if (response.data.result.idMensaje === 2) {
                setFavourites(response.data.userFavList);
            }
        },
    });

    // adds a talent to a favourite collection
    const { fetch: addToFavApi } = useApi<BaseResponse, { idTalento: number; idColeccion: number }>(addTalentToFav, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    // removes a talent from a favourite collection
    const { fetch: removeFromFavApi } = useApi<BaseResponse, { idTalento: number; idColeccion: number }>(removeTalentFromFav, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    // creates a new favourite collection
    const { loading: addToFavLoading, fetch: createFavListApi } = useApi<BaseResponse, { collectionName: string }>(createNewFavList, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => {
            handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar });
            if (response.data.idMensaje === 2) {
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

    const removeFromFavourites = useCallback(async (idTalento: number, idColeccion: number): Promise<BaseResponse> => {
        const response = await removeFromFavApi({ idTalento, idColeccion });
        return response.data;
    }, [removeFromFavApi]);

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