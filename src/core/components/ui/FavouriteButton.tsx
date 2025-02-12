interface Props {
    isFavourited: number;
}

export const FavouriteButton = ({ isFavourited }: Props) => {
    // const [isFavouriteVisible, setFavouriteVisible] = useState(false);

    // const handleFavouriteToggle = () => setFavouriteVisible((prev) => !prev);

    return (
        <button
            type="button"
            // onClick={handleFavouriteToggle}
            className="p-1 bg-white rounded-full hover:shadow-lg transition-all duration-200 relative flex-shrink-0">
            <img src={isFavourited === 1 ? "/assets/ic_fill_heart.svg" : "/assets/ic_outline_heart.svg"} alt="icon favourite" className="h-5 w-5" />
            {/* Favourite panel */}
            {/* {isFavouriteVisible && (
                <OutsideClickHandler onOutsideClick={handleFavouriteToggle}>
                    <div className="w-72 absolute p-5 flex flex-col gap-2 border border-gray-50 shadow-lg bg-white rounded-lg left-5 z-20">
                        <input type="text" className="text-[#3f3f46] p-2 border-gray-300 border rounded-lg w-full focus:outline-none focus:border-[#4F46E5]" />
                        <button type="button" className="p-2 text-white bg-[#009695] hover:bg-[#2d8d8d] rounded-lg w-full focus:outline-none">Crear Favorito</button>
                        <select name="favs" id="favs" className="text-[#3f3f46] p-2 w-full border boder-gray-300 rounded-lg focus:outline-none cursor-pointer">
                            <option value="0">Elegir favorito</option>
                            <option value="fav-1">Favs</option>
                        </select>
                    </div>
                </OutsideClickHandler>
            )} */}
        </button>
    );
}