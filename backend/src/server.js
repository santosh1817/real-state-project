import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { createRateLimiter } from './config/rateLimit.js';
import { prisma } from './db/prisma.js';
import { swaggerSpec } from './docs/swagger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { adminRouter } from './routes/admin.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { inquiryRouter } from './routes/inquiry.routes.js';
import { propertyRouter } from './routes/property.routes.js';
import { uploadRouter } from './routes/upload.routes.js';
import { pruneExpiredRefreshTokens } from './services/auth.service.js';
import { uploadsDir } from './services/upload.service.js';
import { successResponse } from './utils/response.js';

const app = express();

// Security and request parsing middleware.
app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
// Global API rate limit protects the backend from too many requests.
app.use(createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  prefix: 'rl:global:',
  message: { success: false, statusCode: 429, code: 'TOO_MANY_REQUESTS', message: 'Too many requests. Please try again later.' }
}));
// Serve local uploads in development/fallback mode.
app.use('/uploads', express.static(uploadsDir));

// Health check and API documentation.
app.get('/health', (req, res) => res.json(successResponse({ ok: true })));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Feature route groups.
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/uploads', uploadRouter);
app.use('/api/properties', propertyRouter);
app.use('/api', inquiryRouter);

// 404 and error handler must be registered after all routes.
app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
  console.log(`Swagger docs at http://localhost:${env.port}/api-docs`);
});

// Periodically remove expired/revoked refresh tokens from database.
const refreshTokenCleanupTimer = setInterval(() => {
  pruneExpiredRefreshTokens().catch((error) => {
    console.error('Refresh token cleanup failed:', error.message);
  });
}, env.refreshTokenCleanupIntervalMs);
refreshTokenCleanupTimer.unref();

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function shutdown() {
  // Graceful shutdown closes timer, HTTP server, and DB connection.
  clearInterval(refreshTokenCleanupTimer);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
