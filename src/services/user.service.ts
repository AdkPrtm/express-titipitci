import { CreateUserModel } from '../models/user-request.model';
import { UserResponse } from '../models/user-response.model';
import { prisma } from '../config/app';

class UserService {
  async createUser(userData: CreateUserModel): Promise<UserResponse> {
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        whatsappNumber: userData.whatsapp_number,
        address: userData.address,
        role: userData.role,
      },
    });

    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      whatsapp_number: user.whatsappNumber,
      address: user.address,
      role: user.role,
      email: user.email ?? '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return userResponse;
  }

  async getAllUser(): Promise<UserResponse[]> {
    const users = await prisma.user.findMany({
      where: {
        role: 'USER',
      },
    });

    const userResponse = users.map((user) => ({
      id: user.id,
      name: user.name,
      whatsapp_number: user.whatsappNumber,
      address: user.address,
      role: user.role,
      email: user.email ?? '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return userResponse;
  }

  async getUserById(id: number): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) return null;

    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      whatsapp_number: user.whatsappNumber,
      address: user.address,
      role: user.role,
      email: user.email ?? '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return userResponse;
  }
}

export default new UserService();
