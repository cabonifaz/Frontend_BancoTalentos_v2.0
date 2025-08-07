import { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import {
  axiosInstance,
  axiosInstanceFMI,
  axiosInstanceNoToken,
  axiosInstanceNoTokenFMI,
} from "./axiosService";
import { Utils } from "../utilities/utils";
import * as talentUpdate from "../models/params/TalentUpdateParams";
import * as models from "../models";

// auth
export const loginApp = ({
  username,
  password,
}: models.LoginParams): Promise<AxiosResponse<models.LoginResponse>> => {
  return axiosInstanceNoToken.post("/bdt/auth/login", { username, password });
};

// user
export const createNewFavList = (data: {
  collectionName: string;
}): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/user/addFavourite", {
    collectionName: data.collectionName,
  });
};

// talents
export const getTalents = (
  params: models.TalentParams,
): Promise<AxiosResponse<models.TalentsResponse>> => {
  const queryString = Utils.buildQueryString(params);
  const url = `/bdt/talent/list${queryString ? `?${queryString}` : ""}`;
  return axiosInstance.get(url);
};

export const getTalent = (
  talentId: number,
): Promise<AxiosResponse<models.TalentResponse>> => {
  return axiosInstance.get(
    `/bdt/talent/data?talentId=${talentId}&loadExtraInfo=true`,
  );
};

export const addTalent = (
  data: models.AddTalentParams,
): Promise<AxiosResponse<models.InsertUpdateResponse>> => {
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token") || "";

  return axiosInstanceNoToken.post("/bdt/talent/addOrUpdateTalent", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addTalentToFav = (data: {
  idTalento: number;
  idColeccion: number;
}): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addToFavourite", {
    idColeccion: data.idColeccion,
    idTalento: data.idTalento,
  });
};

export const removeTalentFromFav = (data: {
  idTalento: number;
  idColeccion: number;
}): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addToFavourite", {
    idColeccion: data.idColeccion,
    idTalento: data.idTalento,
  });
};

export const updateTalentContact = (
  data: talentUpdate.TalentContactParams,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateTalent", data);
};

export const updateTalentSocialMedia = (
  data: talentUpdate.TalentSocialMediaParams,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateTalent", data);
};

export const updateTalentProfilePhoto = (
  data: talentUpdate.TalentProfilePhotoParams,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateTalent", data);
};

export const getCvFile = (
  data: number,
): Promise<AxiosResponse<models.FileResponse>> => {
  return axiosInstance.get(`/bdt/talent/file?fileId=${data}`);
};

export const updateTalentCv = (
  data: talentUpdate.TalentCvParams,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/updateCvFile", data); // cv file only
};

export const uploadTalentCert = (
  data: talentUpdate.TalentCertParams,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/uploadTalentFile", data);
};

export const updateTalentSalary = (
  data: talentUpdate.TalentSalaryParams,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateTalent", data);
};

export const addTalentTechSkill = (
  data: talentUpdate.TalentTechSkillParams,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addTechAbility", data);
};

export const addTalentSoftSkill = (
  data: talentUpdate.TalentSoftSkillParams,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addSoftAbility", data);
};

export const updateTalentDescription = (
  data: talentUpdate.TalentDescriptionParams,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateTalent", data);
};

export const updateTalentAvailability = (
  data: talentUpdate.TalentAvailabilityParams,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateTalent", data);
};

// experience
export const addOrUpdateTalentExperience = (
  data: models.AddOrUpdateExperienceParams,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateExperience", data);
};

export const deleteTalenteExperience = (
  idExperiencia: number,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/deleteExperience", {
    id: idExperiencia,
  });
};

// education
export const addOrUpdateTalentEducation = (
  data: models.AddOrUpdateEducationParams,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateEducation", data);
};

export const deleteTalenteEducation = (
  idEducacion: number,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/deleteEducation", { id: idEducacion });
};

// language
export const addOrUpdateTalentLanguage = (
  data: models.AddOrUpdateLanguageParams,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateLanguage", data);
};

export const deleteTalenteLanguage = (
  idIdioma: number,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/deleteLanguage", { id: idIdioma });
};

// feedback
export const addOrUpdateTalentFeedback = (
  data: models.AddOrUpdateFeedbackParams,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/addOrUpdateFeedback", data);
};

export const deleteTalenteFeedback = (
  idFeedback: number,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstance.post("/bdt/talent/deleteFeedback", { id: idFeedback });
};

// user
export const getUserFavourites = (): Promise<
  AxiosResponse<models.FavouritesResponse>
> => {
  return axiosInstance.get("/bdt/user/getFavourites");
};

// FMI ENDPOINTS

// requirements
export const getClients = (): Promise<
  AxiosResponse<models.ClientListResponse>
> => {
  return axiosInstanceFMI.get("/fmi/client/list");
};

export const getRequirements = (
  params: models.ReqListParams,
): Promise<AxiosResponse<models.RequerimientosResponse>> => {
  return axiosInstanceFMI.get(
    `/fmi/requirement/list?${Utils.buildQueryString(params)}`,
  );
};

export const getRequirementById = (
  id: number,
): Promise<AxiosResponse<models.RequirementResponse>> => {
  return axiosInstanceFMI.get(
    `/fmi/requirement/data?idRequerimiento=${id}&showfiles=false&showVacantesList=true&showContactList=true`,
  );
};

export const updateRequirement = (
  data: models.UpdateReqParams,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstanceFMI.post("/fmi/requirement/update", data);
};

export const deleteReqFile = (
  id: number,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstanceFMI.delete(`/fmi/requirement/file/remove?idRqFile=${id}`);
};

export const addReqFiles = (
  data: models.AddReqFilesParams,
): Promise<AxiosResponse<models.BaseResponse>> => {
  return axiosInstanceFMI.post("/fmi/requirement/file/save", data);
};

// Talento FMI
export const saveTalentFMI = (
  data: models.SaveTalentFMIParams,
): Promise<AxiosResponse<models.BaseResponseFMI>> => {
  return axiosInstanceFMI.post("/fmi/talent/save", data);
};

// postulantes
export const addPostulanteService = (
  data: models.AddPostulanteParams,
): Promise<AxiosResponse<models.BaseResponseFMI>> => {
  const token = localStorage.getItem("authToken") || "";

  return axiosInstanceNoTokenFMI.post("/fmi/postulant/register", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
