import { useState } from "react";
import { AppError } from "../models";
import { axiosInstance } from "../services/axiosService";
import { TalentForFractalCV } from "../models/interfaces/TalentDataForFractal";
import { TalentDataTranslatedResponse } from "../models/response/TalentDataTranslatedResponse";
import { data } from "react-router-dom";

export const useTranslateTalentData = () => {
  const [isLoading, setIsLoading] = useState(false);

  const translateTalentData = async (
    talentData: TalentForFractalCV,
    lang: "ES" | "EN"
  ) => {
    setIsLoading(true);
    try {
      const prompt = generatePrompt(talentData, lang);
      const response =
        await axiosInstance.post<TalentDataTranslatedResponse>(
          "bdt/ia/prompt",
          {
            prompt,
          }
        );
      const result = response.data;
      if (result.idMensaje !== 2)
        throw new AppError("Ha ocurrido un error en la traduccion");
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Error al traducir los datos del talento");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    translateTalentData,
  };
};

const generatePrompt = (
  talent: TalentForFractalCV,
  lang: "ES" | "EN"
) => {
  const normalized = JSON.stringify(talent);
  return `
    Actúa como un agente de traducción profesional. Se te proporcionará un objeto JSON que representa un talento, como el siguiente:
    ${normalized}

    Idioma objetivo: ${lang}.
    Tus instrucciones son:

    1. Traduce al idioma deseado **solo el contenido textual** dentro del objeto.  
    2. Mantén la **misma estructura del objeto** sin alterar claves, tipos de datos ni el orden de los arrays.  
    3. **No traduzcas fechas numéricas** (por ejemplo, "2020", "2019-05").  
    4. Si encuentras la palabra "Actualidad" en algún campo de fecha, déjala tal cual.  
    5. Responde únicamente con el objeto traducido, **sin explicaciones ni comentarios adicionales**.  
    6. No alteres el orden de los arrays, **conserva el mismo orden**
    Devuelve el JSON resultante.
  `;
};
