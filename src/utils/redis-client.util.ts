import { createClient } from 'redis';
import { logger } from './logger.util';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const defaultTTL = parseInt(process.env.REDIS_TTL || '3600', 10);

class RedisService {
    private readonly client;
    private isConnected = false;

    constructor() {
        this.client = createClient({
            url: redisUrl,
        });

        this.client.on('error', (err) => {
            logger.error('Redis Client Error', err);
            this.isConnected = false;
        });

        this.client.on('connect', () => {
            logger.info('Redis client connected');
            this.isConnected = true;
        });

        this.client.on('reconnecting', () => {
            logger.info('Redis client reconnecting');
        });

        this.client.on('end', () => {
            logger.info('Redis client connection closed');
            this.isConnected = false;
        });

        // Connect to redis
        this.connect().catch((err) => {
            logger.error('Failed to connect to Redis', err);
        });
    }

    async connect(): Promise<void> {
        if (!this.isConnected) {
            await this.client.connect();
            this.isConnected = true;
        }
    }

    async disconnect(): Promise<void> {
        if (this.isConnected) {
            await this.client.quit();
            this.isConnected = false;
        }
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            if (!this.isConnected) await this.connect();

            const data = await this.client.get(key);
            if (!data) return null;

            return JSON.parse(data) as T;
        } catch (error) {
            logger.error(`Error getting key ${key} from Redis`, error);
            return null;
        }
    }

    async set(key: string, value: unknown, ttl = defaultTTL): Promise<void> {
        try {
            if (!this.isConnected) await this.connect();

            const stringValue = JSON.stringify(value);
            await this.client.set(key, stringValue, { EX: ttl });
        } catch (error) {
            logger.error(`Error setting key ${key} in Redis`, error);
        }
    }

    async del(key: string): Promise<void> {
        try {
            if (!this.isConnected) await this.connect();

            await this.client.del(key);
        } catch (error) {
            logger.error(`Error deleting key ${key} from Redis`, error);
        }
    }

    async delAllSpecificKey(key: string): Promise<void> {
        try {
            if (!this.isConnected) await this.connect();

            const pattern = `${key}*`;
            let cursor = 0;
            let deletedCount = 0;

            do {
                // Using the node-redis client
                const scanResult = await this.client.scan(cursor, {
                    MATCH: pattern,
                    COUNT: 100
                });

                cursor = scanResult.cursor;
                const keys = scanResult.keys;

                if (keys.length > 0) {
                    await this.client.del(keys);
                    deletedCount += keys.length;
                }
            } while (cursor !== 0);

            await this.client.del(key);
        } catch (error) {
            logger.error(`Error deleting key ${key} from Redis`, error);
        }
    }

    async flushAll(): Promise<void> {
        try {
            if (!this.isConnected) await this.connect();

            await this.client.flushAll();
            logger.info('Redis cache cleared');
        } catch (error) {
            logger.error('Error clearing Redis cache', error);
        }
    }

    // Method untuk membuat cache key yang konsisten
    generateCacheKey(prefix: string, identifier: string | number): string {
        return `${prefix}:${identifier}`;
    }
}

// Singleton pattern untuk Redis service
export default new RedisService();