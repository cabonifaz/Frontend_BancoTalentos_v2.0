import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { Param } from "../../models";

interface Props {
  title?: string;
  subtitle?: string;
  lottieUrl?: string;
  canClose?: boolean;
  onClose?: () => void;
  canCloseMessage?: string;
  randomPhrases: Param[];
}

export const ModalWorkingAI = ({
  title = "Analizando con IA",
  subtitle = "Estamos procesando tu CV, esto puede tardar unos minutos",
  lottieUrl = "https://lottie.host/64faf884-b597-4df2-8e38-95c680989246/WLgLrfCVmO.json",
  canClose = false,
  onClose,
  canCloseMessage,
  randomPhrases: frasesIA,
}: Props) => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [randomDescription, setRandomDescription] =
    useState<string>("");

  useEffect(() => {
    const fetchAnimation = async () => {
      try {
        const response = await fetch(lottieUrl);
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error("Error cargando la animación Lottie:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimation();
  }, [lottieUrl]);

  useEffect(() => {
    if (frasesIA?.length > 0 && !canCloseMessage) {
      const firstIndex = Math.floor(Math.random() * frasesIA.length);
      setRandomDescription(frasesIA[firstIndex].string1);

      const interval = setInterval(() => {
        const randomIndex = Math.floor(
          Math.random() * frasesIA.length,
        );
        setRandomDescription(frasesIA[randomIndex].string1);
      }, 3500);

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frasesIA]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl w-full text-center">
        {/* Título */}
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {/* Subtítulo */}
        <p className="text-gray-600 mb-4">{subtitle}</p>

        {/* Animación */}
        <div className="w-64 h-64 mx-auto">
          {loading ? (
            <div className="w-10 h-10 mx-auto border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            animationData && (
              <Lottie animationData={animationData} loop autoplay />
            )
          )}
        </div>

        {/* Mensaje dinámico */}
        {canCloseMessage ? (
          <div className="my-4">
            <p className="text-gray-800 font-semibold">
              {canCloseMessage}
            </p>
            <p className="text-gray-500 text-sm mt-2 italic">
              {randomDescription}
            </p>
          </div>
        ) : (
          <p className="text-gray-600 my-4 font-medium">
            {randomDescription}
          </p>
        )}

        {/* Botón Aceptar (solo si canClose) */}
        {canClose && (
          <button
            onClick={onClose}
            className="my-4 px-8 py-1.5 rounded-lg text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
          >
            Aceptar
          </button>
        )}
      </div>
    </div>
  );
};
