export interface ReqListParams {
    nPag: number | null;
    idCliente: number | null;
    buscar: string | null;
    estado: number | null;
    fechaSolicitud: string | null;
    /**
     * Filtros de selección múltiple del listado de Requerimientos (viajan como
     * "1,2"; una lista vacía no se envía). Opcionales para el resto de usos.
     */
    idContactos?: number[];
    idPerfiles?: number[];
    idTalentos?: number[];
}
