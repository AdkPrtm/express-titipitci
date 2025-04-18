import { Request, Response, NextFunction } from "express";
import redisClientUtil from "../utils/redis-client.util";
import { logger } from "../utils/logger.util";

interface CacheOptions {
    ttl?: number;
    keyPrefix?: string;
}

export const cacheMiddleware = (options: CacheOptions = {}) => {
    const { ttl, keyPrefix = 'api' } = options

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Skip Caching if non method GET Request
        if (req.method !== 'GET') {
            next()
        }

        // Generate Cache Key
        const cacheKey = `${keyPrefix}:${req.originalUrl}`

        try {
            // Trying to get data cache
            const cachedData = await redisClientUtil.get<any>(cacheKey);

            if (cachedData) {
                logger.debug(`Cache hit for ${keyPrefix}`)
                res.status(200).json(cachedData)
                return;
            }

            // Override res.json to store the response in cache before sending
            const originalJson = res.json;
            res.json = function (body) {
                // Only cache successful responses
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    redisClientUtil.set(cacheKey, body, ttl)
                        .catch(err => logger.error(`Failed to cache response for ${cacheKey}`, err));
                }

                return originalJson.call(this, body);
            };

            next();
        } catch (error) {

        }
    }
}