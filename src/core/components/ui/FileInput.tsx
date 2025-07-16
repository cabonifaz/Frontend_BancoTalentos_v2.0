import { useState } from "react";
import { AddTalentType } from "../../models/schemas/AddTalentSchema";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface FileInputProps<F extends FieldValues> {
  register: UseFormRegister<F>;
  errors: FieldErrors<F>;
  initialText: string;
  name: keyof AddTalentType;
  acceptedTypes?: string;
  onChange: (file: File | null) => void;
  value: File | null;
}

export const FileInput = <F extends FieldValues>({
  register,
  errors,
  name,
  initialText,
  acceptedTypes,
  onChange,
  value,
}: FileInputProps<F>) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onChange(file);
  };

  return (
    <div className="rounded-lg overflow-hidden my-4">
      <div className="w-full">
        <div className="relative h-32 rounded-lg bg-gray-100 flex justify-center items-center hover:bg-gray-200">
          <div className="absolute flex flex-col items-center">
            <img
              alt="File Icon"
              className="mb-3 w-8 h-8"
              src={
                value ? "/assets/ic_file_selected.svg" : "/assets/ic_upload.svg"
              }
            />
            <span className="block text-[#0b85c3] font-normal mt-1">
              {value ? value.name : initialText}
            </span>
          </div>

          <input
            type="file"
            {...register(name as any)}
            accept={acceptedTypes}
            onChange={handleFileChange}
            className="h-full w-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
