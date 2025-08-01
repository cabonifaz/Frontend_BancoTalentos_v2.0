import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useModal } from "../../context/ModalContext";
import { useFavouritesContext } from "../../context/FavouritesContext";
import { Modal } from "../modals/Modal";
import { validateText } from "../../utilities/validation";
import { Loading } from "./Loading";
import { Talent } from "../../models";

interface Props {
    idTalento: number;
    isFavourited: number;
    idTalentoColecciones: number[];
    onToggleFavorito: (idTalento: number, fields: Partial<Talent>) => void;
}

export const FavouriteButton = ({ isFavourited, idTalento, idTalentoColecciones, onToggleFavorito }: Props) => {
    const { openModal, closeModal } = useModal();
    const { favourites, addToFavourites, removeFromFavourites, createFavouriteList, addToFavLoading } = useFavouritesContext();
    const favNameRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedColecciones, setSelectedColecciones] = useState<number[]>(idTalentoColecciones);
    const [localIsFavourited, setLocalIsFavourited] = useState(isFavourited);

    useEffect(() => {
        setSelectedColecciones(idTalentoColecciones);
    }, [idTalentoColecciones]);

    const handleFavourited = async (e: ChangeEvent<HTMLInputElement>, idColeccion: number) => {
        if (!idTalento) return;

        if (e.target.checked) {
            // Agregar a la colección
            const response = await addToFavourites(idTalento, idColeccion);

            if (response?.idMensaje === 2) {
                const newSelectedColecciones = [...selectedColecciones, idColeccion];
                setSelectedColecciones(newSelectedColecciones);
                setLocalIsFavourited(1);
                onToggleFavorito(idTalento, { esFavorito: 1 });
            } else {
                e.target.checked = false;
            }
        } else {
            // Eliminar de la colección
            const response = await removeFromFavourites(idTalento, idColeccion);

            if (response?.idMensaje === 2) {
                const newSelectedColecciones = selectedColecciones.filter(id => id !== idColeccion);
                setSelectedColecciones(newSelectedColecciones);

                if (newSelectedColecciones.length === 0) {
                    setLocalIsFavourited(0);
                    onToggleFavorito(idTalento, { esFavorito: 0 });
                }
            } else {
                e.target.checked = true;
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

    const isInAnyCollection = selectedColecciones.length > 0;

    return (
        <>
            <button
                type="button"
                onClick={() => openModal("modalFavourite")}
                className="p-1 bg-white rounded-full hover:shadow-lg transition-all duration-200 flex-shrink-0">
                <img src={localIsFavourited === 1 || isInAnyCollection ? "/assets/ic_fill_heart.svg" : "/assets/ic_outline_heart.svg"} alt="icon favourite" className="h-5 w-5" />
            </button>
            <Modal id="modalFavourite" title="Añadir a" showButtonOptions={false} width="small">
                <div className="flex flex-col gap-2">
                    <ul className="flex flex-col gap-2 my-4">
                        {favourites && favourites.length > 0 && favourites.map((fav) => (
                            <li key={fav.nombreColeccion} className="flex items-center w-fit *:cursor-pointer">
                                <input
                                    type="checkbox"
                                    id={`fav-${fav.idColeccion}`}
                                    name="favourite-list"
                                    checked={selectedColecciones.includes(fav.idColeccion)}
                                    onChange={(e) => handleFavourited(e, fav.idColeccion)}
                                    className="h-5 w-5"
                                />
                                <label htmlFor={`fav-${fav.idColeccion}`} className="text-lg ps-4">
                                    {fav.nombreColeccion}
                                </label>
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