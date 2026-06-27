import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getUserById } from '../modules/auth/auth.service.js';
import { HttpError } from '../utils/httpError.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Authentication required');

    const payload = jwt.verify(token, env.jwtAccessSecret);
    const user = await getUserById(payload.sub);
    if (!user) throw new HttpError(401, 'User no longer exists');
    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new HttpError(401, 'Invalid or expired token'));
  }
}
