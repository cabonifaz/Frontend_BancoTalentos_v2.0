import { useCallback, useState } from "react";
import { getTalentBlacklistStatus } from "../../services/apiService";
import { BlacklistStatusClient } from "../../models";

/**
 * Estado de un talento en la lista negra, para el icono del detalle: si tiene
 * alguna restricción activa (cualquier cliente) y de qué clientes. Una
 * restricción global llega como un único "TODOS LOS CLIENTES".
 *
 * Consulta un check dedicado (SP_BT_LISTA_NEGRA_TALENTO_STATUS) en vez de traer
 * todo el listado y filtrar en el front.
 */
export const useTalentBlacklistStatus = () => {
  const [restrictedClients, setRestrictedClients] = useState<
    BlacklistStatusClient[]
  >([]);
  const [checking, setChecking] = useState(false);

  const checkBlacklisted = useCallback(async (idTalento: number) => {
    setChecking(true);
    setRestrictedClients([]);
    try {
      const { data } = await getTalentBlacklistStatus(idTalento);
      setRestrictedClients(
        data.result?.idMensaje === 2 && data.bloqueado ? data.clientes ?? [] : []
      );
    } catch {
      // Solo es un indicador visual: ante un error el icono queda apagado.
      setRestrictedClients([]);
    } finally {
      setChecking(false);
    }
  }, []);

  return {
    isBlacklisted: restrictedClients.length > 0,
    restrictedClients,
    checking,
    checkBlacklisted,
  };
};
