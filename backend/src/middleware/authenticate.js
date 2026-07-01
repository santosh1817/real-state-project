import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getUserById } from '../services/auth.service.js';
import { HttpError } from '../utils/httpError.js';

export async function authenticate(req, res, next) {
  try {
    // Read token from: Authorization: Bearer <token>
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Authentication required');

    // Verify JWT and load the latest user from database.
    const payload = jwt.verify(token, env.jwtAccessSecret);
    const user = await getUserById(payload.sub);
    if (!user) throw new HttpError(401, 'User no longer exists');
    // Attach user to request so controllers/services can check ownership/role.
    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new HttpError(401, 'Invalid or expired token'));
  }
}
