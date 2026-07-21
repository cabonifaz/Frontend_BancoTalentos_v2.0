import { useCallback, useState } from "react";
import { getTalentBlacklistStatus } from "../../services/apiService";

/**
 * Indica si un talento tiene alguna restricción activa en la lista negra, sin
 * importar el cliente (global o específico). Alimenta el icono de lista negra
 * en el detalle del talento.
 *
 * Consulta un check dedicado (SP_BT_LISTA_NEGRA_TALENTO_STATUS) que devuelve un
 * solo booleano, en vez de traer todo el listado y filtrar en el front.
 */
export const useTalentBlacklistStatus = () => {
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkBlacklisted = useCallback(async (idTalento: number) => {
    setChecking(true);
    setIsBlacklisted(false);
    try {
      const { data } = await getTalentBlacklistStatus(idTalento);
      setIsBlacklisted(data.result?.idMensaje === 2 && data.bloqueado);
    } catch {
      // Solo es un indicador visual: ante un error el icono queda apagado.
      setIsBlacklisted(false);
    } finally {
      setChecking(false);
    }
  }, []);

  return { isBlacklisted, checking, checkBlacklisted };
};
