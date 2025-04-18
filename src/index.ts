import app from "./app";
import { connectDB, connectRedis, PORT, prisma } from "./config/app";
import { logger } from "./utils/logger.util";
import redisClient from "./utils/redis-client.util";

// Connect to DB and Redis
connectDB()
connectRedis()
 
// Start server
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
    logger.error('UNHANDLED REJECTION! Shutting down...');
    logger.error(err.name, err.message);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...');
    logger.error(err.name, err.message);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully');

    try {
        // Close Redis connection
        await redisClient.disconnect();
        logger.info('Redis connection closed');

        // Close Prisma connection
        await prisma.$disconnect();
        logger.info('Database connection closed');

        process.exit(0);
    } catch (error) {
        logger.error('Error during graceful shutdown', error);
        process.exit(1);
    }
});