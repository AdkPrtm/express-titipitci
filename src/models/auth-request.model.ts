import { CreateUserModel } from "./user-request.models";

export interface LoginRequestModel {
    email: string;
    password: string;
}
export interface CreateUserAdminRequestModel extends CreateUserModel {
    email: string;
    password: string;
}

export interface UpdateUserAdminRequestModel {
    name?: string;
    whatsapp_number?: string;
    address?: string;
    role?: string;
    email?: string;
    password?: string;
}