import { AuthResponse } from '@/models/auth-response.model';
import { logger } from '../utils/logger.util';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../models/response.model';
import authService from '../services/auth.service';

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

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
