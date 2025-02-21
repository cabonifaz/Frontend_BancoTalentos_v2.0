import { Education } from "../../models/interfaces/Education";

interface Props {
    data: Education;
    onEdit: () => void;
}

export const EducationCard = ({ data, onEdit }: Props) => {
    return (
        <div className="flex items-center justify-between rounded-md my-1 px-2 sm:px-12 py-4 bg-[#f4f4f5] w-full">
            <div className="flex gap-2 sm:gap-12 items-center">
                <img src="/assets/ic_no_image.svg" alt="Foto Perfil Talento" className="w-16 h-16 rounded-full border" />
                <div className="flex flex-col gap-2">
                    <h2 className="text-[#27272A] text-base">{data.nombreInstitucion}</h2>
                    <p className="text-[#71717A] text-sm flex flex-col">
                        {data.carrera}
                        <span>
                            {`${data?.fechaInicio ? data?.fechaInicio : ""} - ${data?.fechaFin ? data?.fechaFin : ""}`}
                        </span>
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div>
                <button
                    type="button"
                    onClick={onEdit}
                    className="bg-transparent hover:shadow-lg hover:rounded-full hover:bg-zinc-50 flex items-center justify-center h-12 w-12">
                    <img src="/assets/ic_edit.svg" alt="edit icon" className="w-6 h-6 opacity-40 hover:opacity-100" />
                </button>
            </div>
        </div>
    );
}