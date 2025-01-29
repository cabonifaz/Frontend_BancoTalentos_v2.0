import { Modal } from "./Modal";

export const ModalFeedback = () => {
    return (
        <Modal id="modalFeedback" title="Agrega nuevo feedback" confirmationLabel="Agregar">
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">Agrega un nuevo puntaje y agrega un comentario.</h3>
                <div id="rating-container" className="flex items-center my-6 gap-2 *:cursor-pointer">
                    <div className="star" data-index="1">
                        <img src="/assets/ic_outline_star.svg" alt="Star 1" className="star-icon w-6 h-6" />
                    </div>
                    <div className="star" data-index="2">
                        <img src="/assets/ic_outline_star.svg" alt="Star 2" className="star-icon w-6 h-6" />
                    </div>
                    <div className="star" data-index="3">
                        <img src="/assets/ic_outline_star.svg" alt="Star 3" className="star-icon w-6 h-6" />
                    </div>
                    <div className="star" data-index="4">
                        <img src="/assets/ic_outline_star.svg" alt="Star 4" className="star-icon w-6 h-6" />
                    </div>
                    <div className="star" data-index="5">
                        <img src="/assets/ic_outline_star.svg" alt="Star 5" className="star-icon w-6 h-6" />
                    </div>
                </div>
                <div className="flex flex-col my-2">
                    <label htmlFor="feedback" className="text-[#37404c] text-base my-2">Feedback</label>
                    <textarea
                        name="feedback"
                        id="feedback"
                        placeholder="Agrega un comentario"
                        className="h-44 p-3 resize-none border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]">
                    </textarea>
                </div>
            </div>
        </Modal>
    );
}