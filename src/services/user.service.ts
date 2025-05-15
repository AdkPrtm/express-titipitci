import { CreateUserModel, FilterUserModel } from '../models/user-request.model';
import { UserPaginationResponse, UserResponse } from '../models/user-response.model';
import { prisma } from '../config/app';
import { logger } from '../utils/logger.util';
import redisClientUtil from '../utils/redis-client.util';

class UserService {
  async createUser(userData: CreateUserModel): Promise<UserResponse> {

    logger.debug(`Checking if user exists with whatsapp number: ${userData.whatsapp_number}`);

    const isExistUser = await prisma.user.findMany({
      where: {
        whatsappNumber: userData.whatsapp_number
      }
    })

    if (isExistUser) {
      logger.warn(`User already registered with whatsapp number: ${userData.whatsapp_number}`);
      throw new Error('User already registered');
    }

    logger.debug(`Creating user with data: ${JSON.stringify(userData)}`);

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        whatsappNumber: userData.whatsapp_number,
        address: userData.address,
        role: userData.role,
      },
    });

    logger.info(`Created user with data: ${JSON.stringify(user)}`);

    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      whatsapp_number: user.whatsappNumber,
      address: user.address,
      role: user.role,
      email: user.email ?? '',
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };

    return userResponse;
  }

  async getAllUser(limit: number, cursor?: number): Promise<UserPaginationResponse> {
    logger.debug(`Getting all user data`);

    let count: number | null = await redisClientUtil.get('user-count');

    if (!count) {
      logger.info(`Cache miss for user count`);
      const userCount = await prisma.user.count();
      await redisClientUtil.set('user-count', userCount, 120);
      count = userCount
    }

    const users = await prisma.user.findMany({
      take: limit + 1,
      orderBy: { id: 'desc' },
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    if (!users) {
      logger.error(`Failed to get user data`);
      throw new Error('Failed to get user data');
    }

    const userData = users.map((user) => ({
      id: user.id,
      name: user.name,
      whatsapp_number: user.whatsappNumber,
      address: user.address,
      role: user.role,
      email: user.email ?? '',
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    }));

    logger.debug(`Got all user data`);
    const hasNextPage = users.length > limit;
    const data = hasNextPage ? userData.slice(0, -1) : userData;
    const dataTemp = hasNextPage ? users.slice(0, -1) : users;
    const nextCursor = hasNextPage ? dataTemp[data.length - 1].id : null;
    const totalPages = Math.ceil(count / limit);

    const response: UserPaginationResponse = {
      user: userData,
      next_cursor: nextCursor ?? 0,
      total_pages: totalPages,
      max_cursor: count,
      has_next_page: hasNextPage,
    }

    return response;
  }

  async getUserByKeyowrd({ keyword: keywordSearch, limit = 10, cursor }: FilterUserModel): Promise<UserPaginationResponse> {
    logger.debug(`Getting user with keyword: ${keywordSearch}`);

    const keyword = keywordSearch?.trim() ?? "";

    const keywordFilter = keyword
      ? {
        OR: [
          { name: { contains: keyword } },
          { email: { contains: keyword } },
          { whatsappNumber: { contains: keyword } },
        ],
      }
      : undefined;

    const [user, total] = await Promise.all([
      prisma.user.findMany({
        take: limit + 1,
        orderBy: { id: 'desc' },
        ...(cursor && {
          skip: 1,
          cursor: { id: cursor },
        }),
        where: keywordFilter,
      }),
      prisma.user.count({
        where: keywordFilter,
      }),
    ])

    if (!user) {
      logger.error(`Failed to get user with keyword: ${keywordSearch}`);
      throw new Error('Failed to get user');
    }

    logger.info(`Got user with keyword: ${keywordSearch}`);
    const userData = user.map((user) => ({
      id: user.id,
      name: user.name,
      whatsapp_number: user.whatsappNumber,
      address: user.address,
      role: user.role,
      email: user.email ?? '',
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    }))

    const hasNextPage = user.length > limit;
    const data = hasNextPage ? userData.slice(0, -1) : userData;
    const dataTemp = hasNextPage ? user.slice(0, -1) : user;
    const nextCursor = hasNextPage ? dataTemp[data.length - 1].id : null;
    const totalPages = Math.ceil(total / limit);

    const userResponse: UserPaginationResponse = {
      user: data,
      next_cursor: nextCursor ?? 0,
      total_pages: totalPages,
      max_cursor: 0, 
      has_next_page: hasNextPage
    };
    return userResponse;
  }

  async getTotalUser(): Promise<number> {
    logger.debug(`Getting total user`);

    const totalUser = await prisma.user.count();
    logger.info(`Got total user: ${totalUser}`);

    return totalUser;
  }
}

export default new UserService();
