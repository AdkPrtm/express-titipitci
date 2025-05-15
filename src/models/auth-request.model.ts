import { EnumRole } from '@prisma/client';
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
  user_id: number;
  name?: string;
  whatsapp_number?: string;
  address?: string;
  role?: EnumRole;
  email?: string;
}

export interface ChangePasswordModel {
  old_password: string;
  new_password: string;
  user_id: number;
}
