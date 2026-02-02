import { useEffect, useRef } from "react";
import { UseFormWatch, UseFormSetValue, FieldValues } from "react-hook-form";
import { FORM_STORAGE_KEY, FORM_FILES_STORAGE_KEY } from "../utilities/constants";

export const useFormPersistence = <T extends FieldValues>(
  watch: UseFormWatch<T>,
  setValue: UseFormSetValue<T>,
  excludeFields: string[] = []
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar datos guardados al montar
  useEffect(() => {
    const savedData = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        Object.keys(parsed).forEach((key) => {
          if (!excludeFields.includes(key)) {
            setValue(key as any, parsed[key]);
          }
        });
      } catch (error) {
        console.error("Error loading saved form data:", error);
      }
    }
  }, []);

  // Guardar con debounce de 1 segundo
  useEffect(() => {
    const subscription = watch((formData) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const dataToSave = { ...formData };
        excludeFields.forEach((field) => {
          delete dataToSave[field as keyof typeof dataToSave];
        });
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
      }, 1000);
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [watch, excludeFields]);

  // Función para guardar archivos
  const saveFiles = async (cvFile: File | null, fotoFile: File | null) => {
    try {
      const files: any = {};
      
      if (cvFile) {
        const reader = new FileReader();
        const cvBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(cvFile);
        });
        files.cv = { name: cvFile.name, data: cvBase64 };
      }
      
      if (fotoFile) {
        const reader = new FileReader();
        const fotoBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(fotoFile);
        });
        files.foto = { name: fotoFile.name, data: fotoBase64 };
      }
      
      if (Object.keys(files).length > 0) {
        localStorage.setItem(FORM_FILES_STORAGE_KEY, JSON.stringify(files));
      }
    } catch (error) {
      console.error("Error saving files:", error);
    }
  };

  // Función para recuperar archivos
  const loadFiles = (): { cv: File | null; foto: File | null } => {
    const savedFiles = localStorage.getItem(FORM_FILES_STORAGE_KEY);
    if (!savedFiles) return { cv: null, foto: null };

    try {
      const parsed = JSON.parse(savedFiles);
      const cv = parsed.cv ? base64ToFile(parsed.cv.data, parsed.cv.name) : null;
      const foto = parsed.foto ? base64ToFile(parsed.foto.data, parsed.foto.name) : null;
      return { cv, foto };
    } catch (error) {
      console.error("Error loading files:", error);
      return { cv: null, foto: null };
    }
  };

  // Convertir base64 a File
  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Función para limpiar el storage
  const clearStorage = () => {
    localStorage.removeItem(FORM_STORAGE_KEY);
    localStorage.removeItem(FORM_FILES_STORAGE_KEY);
  };

  return { clearStorage, saveFiles, loadFiles };
};