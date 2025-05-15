import { AppError } from '../middlewares/error-handler.middleware';
import {
  ChangePasswordModel,
  CreateUserAdminRequestModel,
  LoginRequestModel,
  UpdateUserAdminRequestModel,
} from '../models/auth-request.model';
import { AuthResponse } from '../models/auth-response.model';
import { prisma } from '../config/app';
import { hashPassword, verifyPassword } from '../utils/password.utils';
import { generateToken } from '../config/auth';
import { logger } from '../utils/logger.util';
import { UserResponse } from '../models/user-response.model';

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

    userData.name = userData.name.split(' ')
      .map(name => name.charAt(0).toUpperCase() + name.slice(1))
      .join(' ');
    userData.email = userData.email.toLowerCase();

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
      created_at: user.createdAt,
      updated_at: user.updatedAt,
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
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      email: user.email!,
      token: '',
    };

    logger.debug(`Generating token for user ID: ${user.id}`);
    const token: string = generateToken(authResponse);
    authResponse.token = token;

    logger.info(`User logged in successfully: ${user.email}`);
    return authResponse;
  }

  async changePassword(userData: ChangePasswordModel): Promise<void> {

    const user = await prisma.user.findUnique({
      where: {
        id: userData.user_id,
      },
    });

    if (!user) {
      logger.warn(`User not found with id: ${userData.user_id}`);
      throw new AppError('User not found', 404);
    }

    const isValidPassword: boolean = await verifyPassword(
      userData.old_password,
      user.password!,
    );

    if (!isValidPassword) {
      logger.warn(`Invalid password for user with id: ${userData.user_id}`);
      throw new AppError('Credentials not match', 401);
    }

    const hashedPassword: string = await hashPassword(userData.new_password);
    const updatedUser = await prisma.user.update({
      where: {
        id: userData.user_id,
      },
      data: {
        password: hashedPassword,
      },
    });

    if (!updatedUser) {
      logger.error(`Failed to update password for user with id: ${userData.user_id}`);
      throw new AppError('Failed to update password', 500);
    }

    logger.info(`User change password successfully: ${user.email}`);
  }

  async updateUser(userData: UpdateUserAdminRequestModel): Promise<void> {
    const user = await prisma.user.findUnique({
      where: {
        id: userData.user_id,
      },
    });

    if (!user) {
      logger.warn(`User not found with id: ${userData.user_id}`);
      throw new AppError('User not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userData.user_id,
      },
      data: {
        name: userData.name,
        whatsappNumber: userData.whatsapp_number,
        address: userData.address,
        role: userData.role,
      },
    });

    if (!updatedUser) {
      logger.error(`Failed to update user with id: ${userData.user_id}`);
      throw new AppError('Failed to update user', 500);
    }
  }

  async getMe(userId: number): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      logger.warn(`User not found with id: ${userId}`);
      throw new AppError('User not found', 404);
    }

    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      whatsapp_number: user.whatsappNumber,
      address: user.address,
      role: user.role,
      email: user.email!,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };

    return userResponse;
  }
}

export default new AuthService();
