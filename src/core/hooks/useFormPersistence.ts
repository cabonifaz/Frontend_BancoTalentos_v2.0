import { useEffect, useRef } from "react";
import { UseFormWatch, UseFormSetValue, FieldValues } from "react-hook-form";
import { FORM_STORAGE_KEY } from "../utilities/constants";

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

  // Guardar con debounce de 2 segundos
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

  // Función para limpiar el storage
  const clearStorage = () => {
    localStorage.removeItem(FORM_STORAGE_KEY);
  };

  return { clearStorage };
};