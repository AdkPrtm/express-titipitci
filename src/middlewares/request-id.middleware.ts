import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const requestId = uuidv4();
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
};

// Add the request ID type to Express Request
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}
