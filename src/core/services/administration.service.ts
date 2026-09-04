/** Servicio del modulo `administracion` (SUPERADMIN). */
import { AxiosResponse } from "axios";
import {
  axiosInstance,
  axiosInstanceFMI,
} from "./axiosService";
import { Utils } from "../utilities/utils";
import { AssignGestorParams, BaseResponse, BaseResponseFMI, ChangeGestorParams, ClientAdminListParams, ClientAdminListResponse, ClientGestorListResponse, ClientUpsertParams, EmployeeUndoDetailResponse, EmployeesListResponse, InsertUpdateResponse, ParamItemListParams, ParamItemListResponse, ParamMasterListParams, ParamMasterListResponse, ParamUpsertParams, TariffListParams, TariffListResponse, TariffUpsertParams, UserAdminListParams, UserAdminListResponse, UserCreateParams, UserSignatureUrlParams, UserSignatureUrlResponse, UserUpsertParams } from "../models";

/** Listado paginado / por búsqueda de empleados (SP_TALENTO_EMPLEADO_SEL). */
export const listEmployeesFMI = (
  page: number,
  search?: string
): Promise<AxiosResponse<EmployeesListResponse>> => {
  const query = search
    ? `busqueda=${encodeURIComponent(search)}`
    : `nPag=${page}`;
  return axiosInstanceFMI.get(`/fmi/employee/list?${query}`);
};

/** Historial completo del empleado (movimientos, equipos, ceses). */

/** Historial completo del empleado (movimientos, equipos, ceses). */
export const getEmployeeDetailFMI = (
  talentId: number
): Promise<AxiosResponse<EmployeeUndoDetailResponse>> => {
  return axiosInstanceFMI.get(`/fmi/employee/detail?talentId=${talentId}`);
};

/** Deshacer el último ingreso (da de baja el contrato y reabre el cupo del RQ). */

/** Deshacer el último ingreso (da de baja el contrato y reabre el cupo del RQ). */
export const undoIngresoFMI = (
  idHistorial: number,
  idTalento: number
): Promise<AxiosResponse<BaseResponseFMI>> => {
  return axiosInstanceFMI.put(
    `/fmi/employee/ingreso/undo?idHistorial=${idHistorial}&idTalento=${idTalento}`
  );
};

/** Deshacer el último movimiento del historial. */

/** Deshacer el último movimiento del historial. */
export const undoMovimientoFMI = (
  idHistorial: number,
  idTalento: number
): Promise<AxiosResponse<BaseResponseFMI>> => {
  return axiosInstanceFMI.put(
    `/fmi/employee/movimiento/undo?idHistorial=${idHistorial}&idTalento=${idTalento}`
  );
};

/** Deshacer el último cese (reactiva el contrato del talento). */

/** Deshacer el último cese (reactiva el contrato del talento). */
export const undoCeseFMI = (
  idHistorial: number,
  idTalento: number
): Promise<AxiosResponse<BaseResponseFMI>> => {
  return axiosInstanceFMI.put(
    `/fmi/employee/cese/undo?idHistorial=${idHistorial}&idTalento=${idTalento}`
  );
};

/** Deshacer (baja lógica) la última solicitud de equipo. */

/** Deshacer (baja lógica) la última solicitud de equipo. */
export const deleteEquipmentRequestFMI = (
  idSolicitud: number,
  idTalento: number
): Promise<AxiosResponse<BaseResponseFMI>> => {
  return axiosInstanceFMI.delete(
    `/fmi/employee/solicitud/equipo?idSolicitud=${idSolicitud}&idTalento=${idTalento}`
  );
};

// Talento FMI

/** Modo 1: lista de maestros paginada por maestro. */
export const getParamMasters = (
  params: ParamMasterListParams
): Promise<AxiosResponse<ParamMasterListResponse>> => {
  const queryString = Utils.buildQueryString(params);
  const url = `/bdt/param-admin/masters${queryString ? `?${queryString}` : ""}`;
  return axiosInstance.get(url);
};

/** Modo 2: parámetros de un maestro, paginados. `pagina` omitido = todo. */

/** Modo 2: parámetros de un maestro, paginados. `pagina` omitido = todo. */
export const getParamsByMaster = (
  params: ParamItemListParams
): Promise<AxiosResponse<ParamItemListResponse>> => {
  const queryString = Utils.buildQueryString(params);
  return axiosInstance.get(`/bdt/param-admin/list?${queryString}`);
};

export const createParam = (
  data: ParamUpsertParams
): Promise<AxiosResponse<InsertUpdateResponse>> => {
  return axiosInstance.post("/bdt/param-admin/create", data);
};

export const updateParam = (
  data: ParamUpsertParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.put("/bdt/param-admin/update", data);
};

export const deleteParam = (
  idParametro: number
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.delete(`/bdt/param-admin/delete?idParametro=${idParametro}`);
};

// manejo de clientes (SUPERADMIN)

export const getClientsAdmin = (
  params: ClientAdminListParams
): Promise<AxiosResponse<ClientAdminListResponse>> => {
  const queryString = Utils.buildQueryString(params);
  const url = `/bdt/client-admin/list${queryString ? `?${queryString}` : ""}`;
  return axiosInstance.get(url);
};

export const createClient = (
  data: ClientUpsertParams
): Promise<AxiosResponse<InsertUpdateResponse>> => {
  return axiosInstance.post("/bdt/client-admin/create", data);
};

export const updateClient = (
  data: ClientUpsertParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.put("/bdt/client-admin/update", data);
};

export const deleteClient = (
  idCliente: number
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.delete(`/bdt/client-admin/delete?idCliente=${idCliente}`);
};

export const reactivateClient = (
  idCliente: number
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.put(`/bdt/client-admin/reactivate?idCliente=${idCliente}`);
};

// manejo de usuarios (SUPERADMIN)

export const getUsersAdmin = (
  params: UserAdminListParams
): Promise<AxiosResponse<UserAdminListResponse>> => {
  const queryString = Utils.buildQueryString(params);
  const url = `/bdt/user-admin/list${queryString ? `?${queryString}` : ""}`;
  return axiosInstance.get(url);
};

export const createUserAdmin = (
  data: UserCreateParams
): Promise<AxiosResponse<InsertUpdateResponse>> => {
  return axiosInstance.post("/bdt/user-admin/create", data);
};

export const updateUserAdmin = (
  data: UserUpsertParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.put("/bdt/user-admin/update", data);
};

export const deleteUserAdmin = (
  idUsuario: number
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.delete(`/bdt/user-admin/delete?idUsuario=${idUsuario}`);
};

export const reactivateUserAdmin = (
  idUsuario: number
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.put(`/bdt/user-admin/reactivate?idUsuario=${idUsuario}`);
};

/** Pide la URL PUT pre-firmada para subir la firma del usuario a S3. */

/** Pide la URL PUT pre-firmada para subir la firma del usuario a S3. */
export const generateUserSignatureUploadUrl = (
  data: UserSignatureUrlParams
): Promise<AxiosResponse<UserSignatureUrlResponse>> => {
  return axiosInstance.post("/bdt/user-admin/signature/upload-url", data);
};

// manejo de gestores por cliente (SUPERADMIN)

export const getClientGestores = (
  idCliente: number
): Promise<AxiosResponse<ClientGestorListResponse>> => {
  return axiosInstance.get(`/bdt/client-admin/gestores?idCliente=${idCliente}`);
};

export const assignClientGestor = (
  data: AssignGestorParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/client-admin/gestor", data);
};

export const changeClientGestor = (
  data: ChangeGestorParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.put("/bdt/client-admin/gestor", data);
};

export const removeClientGestor = (
  idClienteGestor: number
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.delete(
    `/bdt/client-admin/gestor?idClienteGestor=${idClienteGestor}`
  );
};

export const swapClientGestores = (
  idCliente: number
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.put(`/bdt/client-admin/gestores/swap?idCliente=${idCliente}`);
};

// manejo de tarifario (SUPERADMIN)

export const getTariffs = (
  params: TariffListParams
): Promise<AxiosResponse<TariffListResponse>> => {
  const queryString = Utils.buildQueryString(params);
  const url = `/bdt/tariff-admin/list${queryString ? `?${queryString}` : ""}`;
  return axiosInstance.get(url);
};

export const createTariff = (
  data: TariffUpsertParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/tariff-admin/create", data);
};

export const updateTariff = (
  data: TariffUpsertParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.put("/bdt/tariff-admin/update", data);
};

export const deleteTariff = (
  idTarifario: number
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.delete(`/bdt/tariff-admin/delete?idTarifario=${idTarifario}`);
};
