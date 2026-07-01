import dotenv from 'dotenv';

// Load values from backend/.env into process.env.
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Central config object used by the whole backend.
export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  redisUrl: process.env.REDIS_URL || '',
  refreshTokenCleanupIntervalMs: Number(process.env.REFRESH_TOKEN_CLEANUP_INTERVAL_MS || 60 * 60 * 1000),
  cloudinaryUrl: process.env.CLOUDINARY_URL || '',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || ''
};

// Database connection is required before the API can start.
if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

// Fail early if PORT is invalid.
if (!Number.isFinite(env.port) || env.port <= 0) {
  throw new Error('PORT must be a positive number');
}

// Cleanup timer should not run too frequently.
if (!Number.isFinite(env.refreshTokenCleanupIntervalMs) || env.refreshTokenCleanupIntervalMs < 60000) {
  throw new Error('REFRESH_TOKEN_CLEANUP_INTERVAL_MS must be at least 60000');
}

if (isProduction) {
  // Production must never run with placeholder or weak JWT secrets.
  const weakSecrets = [
    ['JWT_ACCESS_SECRET', env.jwtAccessSecret],
    ['JWT_REFRESH_SECRET', env.jwtRefreshSecret]
  ].filter(([, value]) => !value || value.length < 32 || value.startsWith('dev-') || value.startsWith('replace-'));

  if (weakSecrets.length) {
    throw new Error(`${weakSecrets.map(([key]) => key).join(', ')} must be strong production secrets`);
  }
}
