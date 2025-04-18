import { Request, Response, NextFunction } from "express";
import {verifyToken} from "../config/auth";
import { AppError } from "./error-handler.middleware";
import { logger } from "../utils/logger.util";
import { prisma } from "../config/app";


declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                role: string;
            };
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction):Promise<void> => {

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new AppError('Unauthorized', 401);
        }

        const token = authHeader.split(' ')[1];
        if (!token) throw new AppError('Invalid token format', 401);

        const decodedToken = verifyToken(token);
        if (!decodedToken) throw new AppError('Invalid token', 401);

        const user = await prisma.user.findUnique({
            where: {
                id: decodedToken.userId
            }
        });

        if (!user) throw new AppError('User not found', 404);

        req.user = {
            id: user.id,
            email: user.email!,
            role: user.role
        };

        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
          } else {
            logger.error(`[${req.id}] from IP : ${req.ip} has made authentication error: ${error}`);
            next(new AppError('Authentication failed', 401));
          }
    }
}

export const authorize = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        next(new AppError('User not authenticated', 401));
        return;
      }
  
      if (!allowedRoles.includes(req.user.role)) {
        next(new AppError('Insufficient permissions', 403));
        return;
      }
  
      next();
    };
  };