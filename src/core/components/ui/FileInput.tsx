import { useState } from "react";
import { AddTalentFile, DynamicSectionProps } from "../../models";
import { AddTalentType } from "../../models/schemas/AddTalentSchema";

interface FileInputProps extends Omit<DynamicSectionProps<AddTalentFile>, "fields" | "onAdd" | "onRemove" | "handleChange"> {
    initialText: string;
    name: keyof AddTalentType;
    acceptedTypes?: string;
    onChange: (file: File | null) => void;
}

export const FileInput = ({ register, errors, name, initialText, acceptedTypes, onChange }: FileInputProps) => {
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setFileName(file ? file.name : null);
        onChange(file);
    };

    return (
        <div className="rounded-lg overflow-hidden max-w-xl my-4">
            <div className="w-full">
                <div className="relative h-32 rounded-lg bg-gray-100 flex justify-center items-center hover:bg-gray-200">
                    <div className="absolute flex flex-col items-center">
                        <img
                            alt="File Icon"
                            className="mb-3 w-8 h-8"
                            src={fileName ? "/assets/ic_file_selected.svg" : "/assets/ic_upload.svg"}
                        />
                        <span className="block text-[#0b85c3] font-normal mt-1">
                            {fileName || initialText}
                        </span>
                    </div>

                    {/* Input de archivo */}
                    <input
                        type="file"
                        {...register(name)}
                        accept={acceptedTypes}
                        onChange={handleFileChange}
                        className="h-full w-full opacity-0 cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
};