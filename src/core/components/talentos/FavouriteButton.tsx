import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { useModal } from "@/core/context/ModalContext";
import { useFavouritesContext } from "@/core/context/FavouritesContext";
import { Modal } from "@/core/components/modals/Modal";
import { validateText } from "@/core/utilities/validation";
import { Loading } from "@/core/components/ui/Loading";
import { Talent } from "@/core/models";
import { Button } from "@/core/components/ui/shadcn/button";
import { Checkbox } from "@/core/components/ui/shadcn/checkbox";
import { Input } from "@/core/components/ui/shadcn/input";

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

    // El Checkbox está controlado por selectedColecciones: si la API falla no
    // se toca el estado y vuelve solo a su valor anterior (antes se revertía a
    // mano el `checked` del <input>).
    const handleFavourited = async (checked: boolean, idColeccion: number) => {
        if (!idTalento) return;

        if (checked) {
            // Agregar a la colección
            const response = await addToFavourites(idTalento, idColeccion);

            if (response?.idMensaje === 2) {
                const newSelectedColecciones = [...selectedColecciones, idColeccion];
                setSelectedColecciones(newSelectedColecciones);
                setLocalIsFavourited(1);
                onToggleFavorito(idTalento, { esFavorito: 1 });
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
                aria-label="Añadir a favoritos"
                onClick={() => openModal("modalFavourite")}
                className="p-1 bg-white rounded-full hover:shadow-lg transition-all duration-200 flex-shrink-0 dark:bg-slate-800">
                <Heart className="h-5 w-5" color="#e9399a" fill={localIsFavourited === 1 || isInAnyCollection ? "#e9399a" : "none"} />
            </button>
            <Modal id="modalFavourite" title="Añadir a" showButtonOptions={false} width="small">
                <div className="flex flex-col gap-2">
                    <ul className="flex flex-col gap-2 my-4">
                        {favourites && favourites.length > 0 && favourites.map((fav) => (
                            <li key={fav.nombreColeccion} className="flex items-center w-fit *:cursor-pointer">
                                <Checkbox
                                    id={`fav-${fav.idColeccion}`}
                                    name="favourite-list"
                                    checked={selectedColecciones.includes(fav.idColeccion)}
                                    onCheckedChange={(checked) => handleFavourited(checked === true, fav.idColeccion)}
                                />
                                <label htmlFor={`fav-${fav.idColeccion}`} className="text-lg ps-4">
                                    {fav.nombreColeccion}
                                </label>
                            </li>
                        ))}
                    </ul>
                    <Button
                        onClick={newFavourite}
                        className="w-full p-2">
                        Agregar Favorito
                    </Button>
                </div>
            </Modal>

            <Modal id="modalNewFavourite" title="Nueva lista" showButtonOptions={true} onConfirm={onCreate} confirmationLabel="Crear" >
                {addToFavLoading && (<Loading opacity="opacity-60" />)}
                <div className="flex flex-col mt-2">
                    <Input
                        type="text"
                        id="new-fav"
                        ref={favNameRef}
                        aria-label="Nombre de la lista"
                        aria-invalid={!!error}
                        placeholder="Elige un nombre"
                        className="invalid:border-red-500 my-2 border-gray-300 dark:border-slate-600"
                    />
                    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                </div>
            </Modal>
        </>
    );
};
