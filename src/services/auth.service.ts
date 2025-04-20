import { AppError } from '../middlewares/error-handler.middleware';
import {
  CreateUserAdminRequestModel,
  LoginRequestModel,
} from '../models/auth-request.model';
import { AuthResponse } from '../models/auth-response.model';
import { prisma } from '../config/app';
import { hashPassword, verifyPassword } from '../utils/password.utils';
import { generateToken } from '../config/auth';
import { logger } from '../utils/logger.util';

class AuthService {
  async createUser(
    userData: CreateUserAdminRequestModel,
  ): Promise<AuthResponse> {
    logger.debug(`Checking if user exists with email: ${userData.email}`);

    const isUserExists = await prisma.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (isUserExists) {
      logger.warn(`User already registered with email: ${userData.email}`);
      throw new AppError('User already registered', 409);
    }

    logger.debug(`Hashing password for email: ${userData.email}`);
    const hashedPassword: string = await hashPassword(userData.password);

    logger.debug(`Creating user with email: ${userData.email}`);
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        whatsappNumber: userData.whatsapp_number,
        address: userData.address,
        role: userData.role,
        email: userData.email,
        password: hashedPassword,
      },
    });

    const authResponse: AuthResponse = {
      id: user.id,
      name: user.name,
      whatsapp_number: user.whatsappNumber,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email!,
      token: '',
    };

    logger.debug(`Generating token for user ID: ${user.id}`);
    const token: string = generateToken(authResponse);
    authResponse.token = token;

    logger.info(`User created successfully: ${user.email}`);
    return authResponse;
  }

  async loginUser(userData: LoginRequestModel): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (!user) {
      logger.warn(`User not found with email: ${userData.email}`);
      throw new AppError('User not found', 404);
    }

    const isValidPassword: boolean = await verifyPassword(
      userData.password,
      user.password!,
    );
    if (!isValidPassword) {
      logger.warn(`Invalid password for user with email: ${userData.email}`);
      throw new AppError('Credentials not match', 401);
    }

    const authResponse: AuthResponse = {
      id: user.id,
      name: user.name,
      whatsapp_number: user.whatsappNumber,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email!,
      token: '',
    };

    logger.debug(`Generating token for user ID: ${user.id}`);
    const token: string = generateToken(authResponse);
    authResponse.token = token;

    logger.info(`User logged in successfully: ${user.email}`);
    return authResponse;
  }
}

export default new AuthService();
