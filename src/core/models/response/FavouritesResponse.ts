import { BaseResponse, Favourite } from "..";

export interface FavouritesResponse {
    result: BaseResponse;
    userFavList: Favourite[];
}