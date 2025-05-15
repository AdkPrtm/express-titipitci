import { AuthResponse } from '@/models/auth-response.model';
import { logger } from '../utils/logger.util';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../models/response.model';
import authService from '../services/auth.service';
import { UserResponse } from '../models/user-response.model';

class AuthController {
  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(
        `[${req.id}] Register user with data: ${JSON.stringify(req.body)}`,
      );

      const user = await authService.createUser({
        ...req.body,
        whatsappNumber: req.body.whatsapp_number,
      });
      const response: ApiResponse<AuthResponse> = {
        message: 'User registered successfully',
        data: user,
      };

      res.cookie('token', user.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(
        `[${req.id}] Login user with data: ${JSON.stringify(req.body)}`,
      );
      const user = await authService.loginUser(req.body);
      const response: ApiResponse<AuthResponse> = {
        message: 'User logged in successfully',
        data: user,
      };

      res.cookie('token', user.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(
        `[${req.id}] Change password with data: ${JSON.stringify(req.body)}`,
      );

      await authService.changePassword({
        ...req.body,
        user_id: req.user?.id
      });

      const response: ApiResponse<void> = {
        message: 'Password changed successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(
        `[${req.id}] Update user with data: ${JSON.stringify(req.body)}`,
      );
      await authService.updateUser({
        ...req.body,
        user_id: req.user?.id
      });
      const response: ApiResponse<void> = {
        message: 'User updated successfully',
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async logOutUser(req: Request, res: Response, next: NextFunction){
    try {
      logger.debug(`[${req.id}] Log out user`);
      const response: ApiResponse<void> = {
        message: 'User logged out successfully',
      };
      res.clearCookie('token');
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug(`[${req.id}] Get me`);
      const user = await authService.getMe(req.user!.id);
      const response: ApiResponse<UserResponse> = {
        message: 'Get me successfully',
        data: user,
      }

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
