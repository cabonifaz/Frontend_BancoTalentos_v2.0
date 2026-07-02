// src/core/hooks/usePDFFromReact.ts
import { useState } from "react";
import { AppError } from "../models";
import { pdf } from "@react-pdf/renderer";
import { Experience } from "../models";
import { FractalCVTemplate } from "../components/templates/FractalCVTemplate";
import React from "react";
import { TalentForFractalCV } from "../models/interfaces/TalentDataForFractal";

export const usePDFFromReact = () => {
  const [isLoading, setIsLoading] = useState(false);

  const generatePDFBase64 = async (
    talent: TalentForFractalCV,
    fullname: string,
    sorteWorkExperience: Experience[],
    language: "ES" | "EN" = "ES"
  ): Promise<string> => {
    try {
      setIsLoading(true);

      // Construir el documento PDF React
      const documentElement = React.createElement(FractalCVTemplate, {
        talent,
        fullname,
        sorteWorkExperience,
        language,
      });
      // Generar el PDF como Blob
      const pdfInstance = pdf(documentElement);
      const blob = await pdfInstance.toBlob();

      // Convertir el blob a base64
      const base64String: string = await blobToBase64(blob);

      return base64String;
    } catch (error) {
      console.error(error);
      throw new AppError("Hubo un problema al generar el PDF");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getPDFWorker: generatePDFBase64,
    isLoading,
  };
};

const blobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result?.toString().split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
