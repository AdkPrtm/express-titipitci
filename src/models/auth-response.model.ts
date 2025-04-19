import { UserResponse } from './user-response.model';

export interface AuthResponse extends UserResponse {
  token: string;
  email: string;
}
