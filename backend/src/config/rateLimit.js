import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import { RedisStore } from 'rate-limit-redis';
import { env } from './env.js';

let redisClient;

function createRedisStore(prefix) {
  // If Redis is not configured, use the default in-memory limiter for development.
  if (!env.redisUrl) return undefined;
  if (!redisClient) {
    // Reuse one Redis connection for all rate limiters.
    redisClient = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true
    });
    redisClient.on('error', (error) => {
      console.error('Redis rate-limit connection error:', error.message);
    });
  }
  return new RedisStore({
    prefix,
    sendCommand: (...args) => redisClient.call(...args)
  });
}

export function createRateLimiter({ windowMs, limit, prefix, message }) {
  // Build a rate limiter with the same response format as the API.
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: createRedisStore(prefix),
    message
  });
}
