import { AppError } from '../middlewares/error-handler.middleware';
import { CreateUserAdminRequestModel } from '../models/auth-request.model';
import { AuthResponse } from '../models/auth-response.model';
import { prisma } from '../config/app';
import { hashPassword } from '../utils/password.utils';
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
    const hashedPassword = await hashPassword(userData.password);

    logger.debug(`Creating user with email: ${userData.email}`);
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });

    const authResponse: AuthResponse = {
      id: user.id,
      name: user.name,
      whatsapp_number: user.whatsapp_number,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email!,
      token: '',
    };

    logger.debug(`Generating token for user ID: ${user.id}`);
    const token = generateToken(authResponse);
    authResponse.token = token;

    logger.info(`User created successfully: ${user.email}`);
    return authResponse;
  }
}

export default new AuthService();
