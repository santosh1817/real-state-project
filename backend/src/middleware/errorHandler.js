import { ZodError } from 'zod';

export function notFound(req, res, next) {
  next(Object.assign(new Error(`Route not found: ${req.method} ${req.originalUrl}`), { statusCode: 404 }));
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      issues: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
    });
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: statusCode === 500 ? 'Internal server error' : error.message,
    details: error.details
  });
}
