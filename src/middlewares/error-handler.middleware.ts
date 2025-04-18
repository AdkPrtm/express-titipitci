import { logger } from "../utils/logger.util";
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";


export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let statusCode = 500;
    let message = 'Internal Server Error'
    let stack = undefined

    // Handle known errors 
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof ZodError) {
        statusCode = 400;
        message = 'validation error';
        stack = JSON.stringify(err.errors)
    }

    // Log the error with Request ID
    logger.error(`[${req.id}] ${message}: ${err.message}`, {
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        body: req.body
    });

    // Send Response 
    res.status(statusCode).json({
        success: 'error',
        message,
        stack: process.env.NODE_ENV === 'development' ? (stack ?? err.stack) : undefined,
        requestId: req.id
    });
}