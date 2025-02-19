import { AxiosResponse } from "axios";
import { axiosInstance, axiosInstanceNoToken } from "./axiosService";
import { Utils } from "../utilities/utils";
import * as talentUpdate from "../models/params/TalentUpdateParams";
import * as models from "../models";

// auth
export const loginApp = ({ username, password }: models.LoginParams): Promise<AxiosResponse<models.LoginResponse>> => {
    return axiosInstanceNoToken.post("/bdt/auth/login", { username, password });
}

// talents
export const getTalents = (params: models.TalentParams): Promise<AxiosResponse<models.TalentsResponse>> => {
    const queryString = Utils.buildQueryString(params);
    const url = `/bdt/talent/list${queryString ? `?${queryString}` : ''}`;
    return axiosInstance.get(url);
}

export const getTalent = (talentId: number): Promise<AxiosResponse<models.TalentResponse>> => {
    return axiosInstance.get(`/bdt/talent/data?talentId=${talentId}`);
}

export const addTalent = (data: models.AddTalentParams): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("/bdt/talent/addOrUpdateTalent", { data });
}

export const updateTalentContact = (data: talentUpdate.TalentContactParams): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("/bdt/talent/addOrUpdateTalent", { data });
}

export const updateTalentSocialMedia = (data: talentUpdate.TalentSocialMediaParams): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("/bdt/talent/addOrUpdateTalent", { data });
}

export const updateTalentProfilePhoto = (data: talentUpdate.TalentProfilePhotoParams): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("/bdt/talent/addOrUpdateTalent", { data });
}

export const getCvFile = (data: number): Promise<AxiosResponse<models.FileResponse>> => {
    return axiosInstance.get(`/bdt/talent/file?fileId=${data}`);
}

export const updateTalentCv = (data: talentUpdate.TalentCvParams): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("", { data }); // change
}

export const updateTalentCert = (data: talentUpdate.TalentCertParams): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("", { data }); // change
}

export const updateTalentSalary = (data: talentUpdate.TalentSalaryParams): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("/bdt/talent/addOrUpdateTalent", { data });
}

export const addTalentTechSkill = (data: talentUpdate.TalentTechSkillParams): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("/bdt/talent/addTechAbility", { data });
}

export const addTalentSoftSkill = (data: talentUpdate.TalentSoftSkillParams): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("/bdt/talent/addSoftAbility", { data });
}

export const updateTalentDescription = (data: talentUpdate.TalentDescriptionParams): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("/bdt/talent/addOrUpdateTalent", { data });
}

export const updateTalentAvailability = (data: talentUpdate.TalentAvailabilityParams): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("/bdt/talent/addOrUpdateTalent", { data });
}

// experience
export const addOrUpdateTalentExperience = (data: models.AddOrUpdateExperienceParams): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("/bdt/talent/addOrUpdateExperience", { data });
}

export const deleteTalenteExperience = (idExperience: number): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("/bdt/talent/deleteExperience", { idExperience });
}

// education
export const addOrUpdateTalentEducation = (data: models.AddOrUpdateEducationParams): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("/bdt/talent/addOrUpdateEducation", { data });
}

export const deleteTalenteEducation = (idEducation: number): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("/bdt/talent/deleteEducation", { idEducation });
}

// language
export const addOrUpdateTalentLanguage = (data: models.AddOrUpdateLanguageParams): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("/bdt/talent/addOrUpdateLanguage", { data });
}

export const deleteTalenteLanguage = (idLanguage: number): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("/bdt/talent/deleteLanguage", { idLanguage });
}

// feedback
export const addOrUpdateTalentFeedback = (data: models.AddOrUpdateFeedbackParams): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("/bdt/talent/addOrUpdateFeedback", { data });
}

export const deleteTalenteFeedback = (idFeedback: number): Promise<AxiosResponse<models.BaseResponse>> => {
    return axiosInstance.post("/bdt/talent/deleteFeedback", { idFeedback });
}

// params
export const getParams = (paramIDs: string): Promise<AxiosResponse<models.ParamsResponse>> => { // comma separated id's
    return axiosInstanceNoToken.get(`/bdt/params?groupIdMaestros=${paramIDs}`);
};

// user
export const getUserFavourites = (): Promise<AxiosResponse<models.FavouritesResponse>> => {
    return axiosInstance.get("/user/getFavourites");
};