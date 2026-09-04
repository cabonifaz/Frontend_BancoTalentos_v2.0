/** Servicio del modulo `talentos`. */
import { AxiosResponse } from "axios";
import {
  axiosInstance,
  axiosInstanceFMI,
  axiosInstanceNoToken,
} from "./axiosService";
import { Utils } from "../utilities/utils";
import { AddOrUpdateEducationParams, AddOrUpdateExperienceParams, AddOrUpdateFeedbackParams, AddOrUpdateLanguageParams, AddTalentParams, BaseResponse, BaseResponseFMI, FavouritesResponse, FeedbackResponse, FileResponse, InsertUpdateResponse, SaveTalentFMIParams, TalentConfirmUploadRequest, TalentDownloadUrlRequest, TalentParams, TalentPhotoUploadUrlRequest, TalentPhotoUrlResponse, TalentPresignedUrlResponse, TalentResponse, TalentUploadUrlRequest, TalentsResponse } from "../models";
import { TalentAvailabilityParams, TalentCertParams, TalentContactParams, TalentCvParams, TalentDescriptionParams, TalentProfilePhotoParams, TalentSalaryParams, TalentSocialMediaParams, TalentSoftSkillParams, TalentTechSkillParams } from "../models/params/TalentUpdateParams";

// user
export const createNewFavList = (data: {
  collectionName: string;
}): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/user/addFavourite", {
    collectionName: data.collectionName,
  });
};

// talents

// talents
export const getTalents = (
  params: TalentParams
): Promise<AxiosResponse<TalentsResponse>> => {
  const queryString = Utils.buildQueryString(params);
  const url = `/bdt/talent/list${
    queryString ? `?${queryString}` : ""
  }`;
  return axiosInstance.get(url);
};

export const getTalent = (
  talentId: number
): Promise<AxiosResponse<TalentResponse>> => {
  return axiosInstance.get(
    `/bdt/talent/data?talentId=${talentId}&loadExtraInfo=true`
  );
};

export const addTalent = (
  data: AddTalentParams
): Promise<AxiosResponse<InsertUpdateResponse>> => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    "";

  return axiosInstanceNoToken.post(
    "/bdt/talent/addOrUpdateTalent",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const addTalentToFav = (data: {
  idTalento: number;
  idColeccion: number;
}): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addToFavourite", {
    idColeccion: data.idColeccion,
    idTalento: data.idTalento,
  });
};

export const removeTalentFromFav = (data: {
  idTalento: number;
  idColeccion: number;
}): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addToFavourite", {
    idColeccion: data.idColeccion,
    idTalento: data.idTalento,
  });
};

export const updateTalentContact = (
  data: TalentContactParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateTalent", data);
};

export const updateTalentSocialMedia = (
  data: TalentSocialMediaParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateTalent", data);
};

export const updateTalentProfilePhoto = (
  data: TalentProfilePhotoParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateTalent", data);
};

export const getCvFile = (
  data: number
): Promise<AxiosResponse<FileResponse>> => {
  return axiosInstance.get(`/bdt/talent/file?fileId=${data}`);
};

export const updateTalentCv = (
  data: TalentCvParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/updateCvFile", data); // cv file only
};

export const uploadTalentCert = (
  data: TalentCertParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/uploadTalentFile", data);
};

// ─── Subida de archivos de talento vía URL pre-firmada (S3 directo) ───────────
// Interfaces en models/interfaces/TalentFilePresigned.ts

/** 1) Pide al backend una URL PUT pre-firmada para subir a S3. */

/** 1) Pide al backend una URL PUT pre-firmada para subir a S3. */
export const generateTalentUploadUrl = (
  data: TalentUploadUrlRequest
): Promise<AxiosResponse<TalentPresignedUrlResponse>> => {
  return axiosInstance.post("/bdt/talent/file/upload-url", data);
};

/**
 * 2) Sube el archivo directamente a S3 usando la URL pre-firmada.
 *
 * `contentType` DEBE ser el que devolvió el backend al firmar. La firma de S3
 * incluye la cabecera Content-Type, así que si aquí se manda otra cosa el PUT
 * falla con 403 SignatureDoesNotMatch. Usar `file.type` es justo lo que rompía:
 * el navegador lo deja vacío para extensiones que el sistema operativo no
 * reconoce, y ese vacío no coincide con lo que se firmó. Se mantiene como valor
 * por defecto sólo para las llamadas que aún no reciben el tipo del backend.
 *
 * Se envuelve el `fetch` con un `AbortController` + timeout para garantizar que
 * la promesa SIEMPRE se resuelva o rechace. Sin esto, si el PUT/preflight se
 * estanca (CORS mal configurado en prod, CDN/WAF intermedio, red colgada), el
 * `fetch` nunca termina, el `finally` de quien llama nunca corre y el overlay de
 * carga (fixed inset-0) queda pegado dejando la página "congelada". Con el abort,
 * el estancamiento se convierte en un error normal que cada modal captura.
 */

/** 3) Confirma en el backend para registrar el archivo en BD. */
export const confirmTalentUpload = (
  data: TalentConfirmUploadRequest
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/file/confirm-upload", data);
};

/**
 * URL PUT pre-firmada para la foto de perfil del talento.
 *
 * No hay confirm-upload: tras el PUT, la ruta devuelta se manda como
 * `fotoArchivo.rutaArchivo` en `updateTalentProfilePhoto`.
 */

/**
 * URL PUT pre-firmada para la foto de perfil del talento.
 *
 * No hay confirm-upload: tras el PUT, la ruta devuelta se manda como
 * `fotoArchivo.rutaArchivo` en `updateTalentProfilePhoto`.
 */
export const generateTalentPhotoUploadUrl = (
  data: TalentPhotoUploadUrlRequest
): Promise<AxiosResponse<TalentPhotoUrlResponse>> => {
  return axiosInstance.post("/bdt/talent/photo/upload-url", data);
};

/** Genera una URL GET pre-firmada para descargar el archivo desde S3. */

/** Genera una URL GET pre-firmada para descargar el archivo desde S3. */
export const generateTalentDownloadUrl = (
  data: TalentDownloadUrlRequest
): Promise<AxiosResponse<TalentPresignedUrlResponse>> => {
  return axiosInstance.post("/bdt/talent/file/download-url", data);
};

export const updateTalentSalary = (
  data: TalentSalaryParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateTalent", data);
};

export const addTalentTechSkill = (
  data: TalentTechSkillParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addTechAbility", data);
};

export const addTalentSoftSkill = (
  data: TalentSoftSkillParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addSoftAbility", data);
};

export const updateTalentDescription = (
  data: TalentDescriptionParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateTalent", data);
};

export const updateTalentAvailability = (
  data: TalentAvailabilityParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateTalent", data);
};

// experience

// experience
export const addOrUpdateTalentExperience = (
  data: AddOrUpdateExperienceParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post(
    "/bdt/talent/addOrUpdateExperience",
    data
  );
};

export const deleteTalenteExperience = (
  idExperiencia: number
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/deleteExperience", {
    id: idExperiencia,
  });
};

// education

// education
export const addOrUpdateTalentEducation = (
  data: AddOrUpdateEducationParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateEducation", data);
};

export const deleteTalenteEducation = (
  idEducacion: number
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/deleteEducation", {
    id: idEducacion,
  });
};

// language

// language
export const addOrUpdateTalentLanguage = (
  data: AddOrUpdateLanguageParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateLanguage", data);
};

export const deleteTalenteLanguage = (
  idIdioma: number
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/deleteLanguage", {
    id: idIdioma,
  });
};

// feedback

// feedback
export const addOrUpdateTalentFeedback = (
  data: AddOrUpdateFeedbackParams
): Promise<AxiosResponse<FeedbackResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateFeedback", data);
};

export const deleteTalenteFeedback = (
  idFeedback: number
): Promise<AxiosResponse<FeedbackResponse>> => {
  return axiosInstance.post("/bdt/talent/deleteFeedback", {
    id: idFeedback,
  });
};

// user

// user
export const getUserFavourites = (): Promise<
  AxiosResponse<FavouritesResponse>
> => {
  return axiosInstance.get("/bdt/user/getFavourites");
};

// Talento FMI
export const saveTalentFMI = (
  data: SaveTalentFMIParams
): Promise<AxiosResponse<BaseResponseFMI>> => {
  return axiosInstanceFMI.post("/fmi/talent/save", data);
};

// postulantes

export const updatePersonalDetails = (
  data: Partial<AddTalentParams>
): Promise<AxiosResponse<InsertUpdateResponse>> => {
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        "";

    return axiosInstanceNoToken.post(
        "/bdt/talent/addOrUpdateTalent",
        data,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
};

// blacklist (lista negra)
