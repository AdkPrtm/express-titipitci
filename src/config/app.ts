import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.util";
import redisClient from "../utils/redis-client.util";

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || "development";

export const prisma = new PrismaClient();

export const connectDB = async () => {
    try {
        await prisma.$connect();
        prisma.$extends({
            result: {
                user: {
                  password: {
                    compute() {
                      return undefined;
                    },
                  },
                },
              },
        })
        logger.info("Database connected");
    } catch (error) {
        logger.error('Failed to connect to the database', error);
        process.exit(1);
    }
}

export const connectRedis = async () => {
    try {
        await redisClient.connect();
        logger.info("Redis connected");
    } catch (error) {
        logger.error('Failed to connect to Redis', error);
    }
}
