import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { query } from '../../db/pool.js';
import { env } from '../../config/env.js';
import { HttpError } from '../../utils/httpError.js';

const publicUserFields = 'id, name, email, phone, created_at AS "createdAt"';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function signAccessToken(user) {
  return jwt.sign({ sub: String(user.id), email: user.email }, env.jwtAccessSecret, { expiresIn: env.accessTokenTtl });
}

function signRefreshToken(user) {
  return jwt.sign({ sub: String(user.id), type: 'refresh' }, env.jwtRefreshSecret, { expiresIn: env.refreshTokenTtl });
}

export async function registerUser(payload) {
  const existing = await query('SELECT id FROM users WHERE email = $1', [payload.email.toLowerCase()]);
  if (existing.rowCount) throw new HttpError(409, 'Email is already registered');

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const result = await query(
    `INSERT INTO users (name, email, password_hash, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING ${publicUserFields}`,
    [payload.name, payload.email.toLowerCase(), passwordHash, payload.phone || null]
  );

  return issueTokenPair(result.rows[0]);
}

export async function loginUser({ email, password }) {
  const result = await query('SELECT id, name, email, phone, password_hash FROM users WHERE email = $1', [email.toLowerCase()]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new HttpError(401, 'Invalid email or password');
  }

  return issueTokenPair({ id: user.id, name: user.name, email: user.email, phone: user.phone });
}

export async function issueTokenPair(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const decoded = jwt.decode(refreshToken);
  await query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, to_timestamp($3))',
    [user.id, hashToken(refreshToken), decoded.exp]
  );
  return { user, accessToken, refreshToken };
}

export async function refreshTokens(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
  } catch {
    throw new HttpError(401, 'Invalid refresh token');
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await query(
    `SELECT u.id, u.name, u.email, u.phone, u.created_at AS "createdAt"
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = $1 AND rt.revoked_at IS NULL AND rt.expires_at > NOW()`,
    [tokenHash]
  );
  if (!stored.rowCount) throw new HttpError(401, 'Refresh token has expired or was revoked');

  await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [tokenHash]);
  return issueTokenPair(stored.rows[0]);
}

export async function revokeRefreshToken(refreshToken) {
  if (!refreshToken) return;
  await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [hashToken(refreshToken)]);
}

export async function getUserById(id) {
  const result = await query(`SELECT ${publicUserFields} FROM users WHERE id = $1`, [id]);
  return result.rows[0];
}
