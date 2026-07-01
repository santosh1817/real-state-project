import { HttpError } from '../utils/httpError.js';

export function authorizeAdmin(req, res, next) {
  // This middleware allows only ADMIN users to continue.
  if (req.user?.role !== 'ADMIN') {
    next(new HttpError(403, 'Admin access required'));
    return;
  }
  next();
}
