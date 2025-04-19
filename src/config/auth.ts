import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.util';
import { UserResponse } from '../models/user-response.model';
import { AuthResponse } from '@/models/auth-response.model';

const JWT_SECRET = process.env.JWT_SECRET ?? 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '24h';

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export const generateToken = (user: AuthResponse): string => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const options: jwt.SignOptions = {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    logger.error(`Token verification failed: ${error}`);
    return null;
  }
};
