import { CreateUserModel } from './user-request.model';

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
  whatsappNumber?: string;
  address?: string;
  role?: string;
  email?: string;
  password?: string;
}
