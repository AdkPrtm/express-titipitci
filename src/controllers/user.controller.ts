import { logger } from '../utils/logger.util';
import { ApiResponse } from '../models/response.model';
import { UserPaginationResponse, UserResponse } from '../models/user-response.model';
import userServices from '../services/user.service';
import { Request, Response, NextFunction } from 'express';
import redisClientUtil from '../utils/redis-client.util';
import { FilterUserModel } from '@/models/user-request.model';

class UserController {
  async createUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      logger.debug(
        `[${req.id}] Creating user with data: ${JSON.stringify(req.body)}`,
      );
      const user = await userServices.createUser(req.body);
      const response: ApiResponse<UserResponse> = {
        message: 'User created successfully',
        data: user,
      };

      await redisClientUtil.delAllSpecificKey('users');
      await redisClientUtil.set(`user:${user.id}`, user, 600);

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAllUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      logger.debug(`[${req.id}] Getting all user data`);

      const rawLimit = req.query.limit;
      const limit = typeof rawLimit === 'string' ? parseInt(rawLimit, 10) : 10;

      const rawCursor = req.query.cursor;
      const cursor = typeof rawCursor === 'string' ? parseInt(rawCursor, 10) : undefined;

      const users = await userServices.getAllUser(limit, cursor);
      const response: ApiResponse<UserPaginationResponse> = {
        message: 'Get retrieved successfully',
        data: users,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getuserById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      logger.debug(`[${req.id}] Getting user by keyword: ${req.query}`);

      const { keyword, limit, cursor } = req.query;
      const filter: FilterUserModel = {};

      if (keyword !== undefined && keyword !== null) filter.keyword = String(keyword);
      if (limit !== undefined && limit !== null) filter.limit = Number(limit);
      if (cursor !== undefined && cursor !== null) filter.cursor = Number(cursor);

      const user = await userServices.getUserByKeyowrd(filter);

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const response: ApiResponse<UserPaginationResponse> = {
        message: 'Search user successfully',
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getTotalUser(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(`[${req.id}] Getting total user`);
      const totalUser = await userServices.getTotalUser();
      const response: ApiResponse<number> = {
        message: 'Get total user successfully',
        data: totalUser,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
