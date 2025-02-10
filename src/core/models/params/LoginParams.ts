export interface LoginParams {
    username: string;
    password: string;
}

export const EmptyLoginParams: LoginParams = {
    username: "",
    password: ""
}