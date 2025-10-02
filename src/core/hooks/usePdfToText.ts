import { useState } from "react";
import { pdfjsLib } from "../utilities/pdfjs-worker";
import Tesseract from "tesseract.js";
import { enqueueSnackbar } from "notistack";

type ExtractLogger = (info: {
  page: number;
  totalPages: number;
  status: string;
  progress?: number;
}) => void;

export const usePdfSmartExtractor = () => {
  const [isLoading, setIsLoading] = useState(false);

  const extractSmartText = async (
    file: File,
    logger?: ExtractLogger
  ): Promise<string | null> => {
    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        logger?.({
          page: i,
          totalPages: pdf.numPages,
          status: "Procesando página",
        });
        const page = await pdf.getPage(i);

        // 1. Extraer contenido de la página
        const content = await page.getTextContent();

        // 2. Separar texto nativo de imágenes
        const textItems = content.items.filter((item: any) => item.str);
        let pageText = textItems
          .map((item: any) => item.str)
          .join(" ")
          .trim();

        const hasNativeText = pageText.replace(/\s/g, "").length >= 10;

        // 3. Detectar si hay imágenes en la página
        const operatorList = await page.getOperatorList();
        const hasImages = operatorList.fnArray.some(
          (fn: number) =>
            fn === pdfjsLib.OPS.paintImageXObject ||
            fn === pdfjsLib.OPS.paintInlineImageXObject
        );

        // 4. Aplicar OCR solo si es necesario
        if (!hasNativeText || (hasImages && pageText.length < 50)) {
          const viewport = page.getViewport({ scale: 3 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport,
            canvas,
          }).promise;

          const {
            data: { text },
          } = await Tesseract.recognize(
            canvas.toDataURL("image/png"),
            "spa+eng",
            {
              logger: (info) => {
                if (info.status === "recognizing text") {
                  const progress = Math.round(info.progress * 100);
                  logger?.({
                    page: i,
                    totalPages: pdf.numPages,
                    status: "Reconociendo texto de imágenes",
                    progress: progress,
                  });
                }
              },
            }
          );

          // Si ya había texto nativo, concatenarlo con el OCR
          pageText = hasNativeText ? `${pageText}\n${text}` : text;
        }

        // 5. Post-procesado avanzado
        const cleaned = pageText
          // Eliminar espacios múltiples
          .replace(/\s+/g, " ")
          // Eliminar caracteres no imprimibles
          // (mantiene ASCII imprimible + caracteres latinos extendidos)
          .replace(/[^\x20-\x7EÀ-ÿ\n]/g, "")
          // Convertir múltiples saltos de línea en dobles saltos (separar bloques)
          .replace(/\n\s*\n\s*\n+/g, "\n\n")
          // Limpiar espacios al inicio/final de cada línea
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .join("\n")
          .trim();

        fullText += cleaned + "\n\n";
      }

      // Post-procesado final del documento completo
      const finalText = fullText
        .replace(/\n{3,}/g, "\n\n") // Max 2 saltos consecutivos
        .trim();
      return finalText;
    } catch (error) {
      enqueueSnackbar({
        message: "Error al procesar el PDF",
        variant: "warning",
      });
      console.error("Extractor error:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, extractSmartText };
};
