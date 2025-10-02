import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { funnyDescriptions } from "../../utilities/ia.utils";

interface Props {
  title?: string;
  description?: string;
  lottieUrl?: string;
  canClose?: boolean;
  onClose?: () => void;
  canCloseMessage?: string;
}

export const ModalWorkingAI = ({
  title = "Analizando con IA",
  description,
  lottieUrl = "https://lottie.host/64faf884-b597-4df2-8e38-95c680989246/WLgLrfCVmO.json",
  canClose = false,
  onClose,
  canCloseMessage,
}: Props) => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [randomDescription, setRandomDescription] = useState<string>("");

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
    if (!description) {
      const firstIndex = Math.floor(Math.random() * funnyDescriptions.length);
      const interval = setInterval(() => {
        const randomIndex = Math.floor(
          Math.random() * funnyDescriptions.length
        );
        setRandomDescription(funnyDescriptions[randomIndex]);
      }, 3500);
      setRandomDescription(funnyDescriptions[firstIndex]);
      return () => clearInterval(interval);
    }
  }, [description]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl w-full text-center">
        {/* Título */}
        <h2 className="text-xl font-bold mb-4">{title}</h2>

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

        {/* Descripción */}
        {(description || randomDescription) && !canCloseMessage && (
          <p className="text-gray-600 mt-4 font-medium">
            {description || randomDescription}
          </p>
        )}
        {canCloseMessage && (
          <p className="text-gray-600 my-4 font-medium">{canCloseMessage}</p>
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
