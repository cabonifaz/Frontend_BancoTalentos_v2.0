import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useModal } from "../../context/ModalContext";
import { useFavouritesContext } from "../../context/FavouritesContext";
import { Modal } from "../modals/Modal";
import { validateText } from "../../utilities/validation";
import { Loading } from "./Loading";

interface Props {
    idTalento: number;
    isFavourited: number;
    idTalentoColeccion: number;
}

export const FavouriteButton = ({ isFavourited, idTalento, idTalentoColeccion }: Props) => {
    const { openModal, closeModal } = useModal();
    const { favourites, addToFavourites, createFavouriteList, addToFavLoading } = useFavouritesContext();
    const favNameRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedColeccion, setSelectedColeccion] = useState<number | null>(idTalentoColeccion);
    const [localIsFavourited, setLocalIsFavourited] = useState(isFavourited);

    useEffect(() => {
        setSelectedColeccion(idTalentoColeccion);
    }, [idTalentoColeccion]);

    const handleFavourited = async (e: ChangeEvent<HTMLInputElement>, idColeccion: number) => {
        if (!idTalento) return;

        if (e.target.checked) {
            setSelectedColeccion(idColeccion);
            const response = await addToFavourites(idTalento, idColeccion);

            if (response?.idMensaje === 2) {
                setLocalIsFavourited(1);
            }
        }
    };

    const newFavourite = () => {
        closeModal("modalFavourite");
        openModal("modalNewFavourite");
    };

    const onCreate = async () => {
        setError(null);
        if (favNameRef.current) {
            const favName = favNameRef.current.value;
            const validation = validateText(favName);

            if (!validation.isValid) {
                favNameRef.current.focus();
                setError("Campo obligatorio");
                return;
            }

            await createFavouriteList(favName);
            closeModal("modalNewFavourite");
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => openModal("modalFavourite")}
                className="p-1 bg-white rounded-full hover:shadow-lg transition-all duration-200 flex-shrink-0">
                <img src={localIsFavourited === 1 ? "/assets/ic_fill_heart.svg" : "/assets/ic_outline_heart.svg"} alt="icon favourite" className="h-5 w-5" />
            </button>
            <Modal id="modalFavourite" title="Añadir a" showButtonOptions={false} width="small">
                <div className="flex flex-col gap-2">
                    <ul className="flex flex-col gap-2 my-4">
                        {favourites.map((fav) => (
                            <li key={fav.nombreColeccion} className="flex items-center w-fit *:cursor-pointer">
                                <input
                                    type="radio"
                                    id={`fav-${fav.idColeccion}`}
                                    name="favourite-list"
                                    checked={fav.idColeccion === selectedColeccion}
                                    onChange={(e) => handleFavourited(e, fav.idColeccion)}
                                    className="h-5 w-5"
                                />
                                <label htmlFor={`fav-${fav.idColeccion}`} className="text-lg ps-4">{fav.nombreColeccion}</label>
                            </li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        onClick={newFavourite}
                        className="p-2 text-white bg-[#009695] hover:bg-[#2d8d8d] rounded-lg w-full focus:outline-none">
                        Agregar Favorito
                    </button>
                </div>
            </Modal>

            <Modal id="modalNewFavourite" title="Nueva lista" showButtonOptions={true} onConfirm={onCreate} confirmationLabel="Crear" >
                {addToFavLoading && (<Loading opacity="opacity-60" />)}
                <div className="flex flex-col mt-2">
                    <input
                        type="text"
                        id="new-fav"
                        ref={favNameRef}
                        placeholder="Elige un nombre"
                        className="invalid:border-red-500 my-2 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
                    />
                    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                </div>
            </Modal>
        </>
    );
};