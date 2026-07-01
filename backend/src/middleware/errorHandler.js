import multer from 'multer';
import { ZodError } from 'zod';

export function notFound(req, res, next) {
  // Runs after all routes; if reached, the route does not exist.
  next(Object.assign(new Error(`Route not found: ${req.method} ${req.originalUrl}`), {
    statusCode: 404,
    code: 'ROUTE_NOT_FOUND'
  }));
}

function defaultCode(statusCode) {
  // Convert HTTP status into a frontend-friendly error code.
  const codes = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_SERVER_ERROR'
  };
  return codes[statusCode] || 'API_ERROR';
}

function errorResponse(statusCode, message, error, extra = {}) {
  // Every error response follows this common shape.
  return {
    success: false,
    statusCode,
    code: extra.code || error.code || defaultCode(statusCode),
    message,
    ...extra
  };
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof ZodError) {
    // Zod gives field-level validation errors.
    return res.status(400).json(errorResponse(400, 'Validation failed', error, {
      code: 'VALIDATION_ERROR',
      issues: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
    }));
  }

  if (error instanceof multer.MulterError) {
    // Multer handles upload errors like file too large.
    const messages = {
      LIMIT_FILE_SIZE: 'Image size must be 5MB or less',
      LIMIT_UNEXPECTED_FILE: 'Only one image file is allowed'
    };
    return res.status(400).json(errorResponse(400, messages[error.code] || error.message, error, {
      code: `UPLOAD_${error.code}`
    }));
  }

  const statusCode = error.statusCode || 500;
  // Expected errors show their message; unexpected 500 errors stay generic.
  res.status(statusCode).json(errorResponse(statusCode, statusCode === 500 ? 'Internal server error' : error.message, error, {
    details: error.details
  }));
}
