import { logger } from '../utils/logger.util';
import { ApiResponse } from '../models/response.model';
import { UserResponse } from '../models/user-response.model';
import userServices from '../services/user.service';
import { Request, Response, NextFunction } from 'express';
import redisClientUtil from '../utils/redis-client.util';

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

      await redisClientUtil.del('users:/api/user');
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
      const users = await userServices.getAllUser();
      const response: ApiResponse<UserResponse[]> = {
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
      logger.debug(`[${req.id}] Getting user by id: ${req.params.id}`);
      const user = await userServices.getUserById(parseInt(req.params.id));

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const response: ApiResponse<UserResponse> = {
        message: 'Get user successfully',
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
