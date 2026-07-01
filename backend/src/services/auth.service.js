import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../db/prisma.js';
import { HttpError } from '../utils/httpError.js';

function hashToken(token) {
  // Store only a hash of refresh tokens, never the raw token value.
  return crypto.createHash('sha256').update(token).digest('hex');
}

function publicUser(user) {
  if (!user) return null;
  // Return safe user data without passwordHash.
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt
  };
}

function signAccessToken(user) {
  // Access token is short-lived and is sent with protected API requests.
  return jwt.sign({ sub: String(user.id), email: user.email, role: user.role }, env.jwtAccessSecret, { expiresIn: env.accessTokenTtl });
}

function signRefreshToken(user) {
  // Refresh token is longer-lived and is used to get a new access token.
  return jwt.sign({ sub: String(user.id), type: 'refresh', jti: crypto.randomUUID() }, env.jwtRefreshSecret, { expiresIn: env.refreshTokenTtl });
}

export async function registerUser(payload) {
  // Keep emails lowercase so duplicate checks work reliably.
  const existing = await prisma.user.findUnique({ where: { email: payload.email.toLowerCase() }, select: { id: true } });
  if (existing) throw new HttpError(409, 'Email is already registered');

  // Password is hashed before saving; plain password is never stored.
  const passwordHash = await bcrypt.hash(payload.password, 12);
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email.toLowerCase(),
      passwordHash,
      phone: payload.phone || null,
      role: 'USER'
    }
  });

  return issueTokenPair(publicUser(user));
}

export async function loginUser({ email, password }) {
  // Compare entered password with the saved password hash.
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, 'Invalid email or password');
  }

  return issueTokenPair(publicUser(user));
}

export async function issueTokenPair(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const decoded = jwt.decode(refreshToken);
  // Save refresh token hash so it can be revoked/rotated later.
  await prisma.refreshToken.create({
    data: {
      userId: BigInt(user.id),
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(decoded.exp * 1000)
    }
  });
  return { user, accessToken, refreshToken };
}

export async function refreshTokens(refreshToken) {
  let payload;
  try {
    // Verify token signature and expiry before checking the database.
    payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
  } catch {
    throw new HttpError(401, 'Invalid refresh token');
  }

  const tokenHash = hashToken(refreshToken);
  // Token must exist, must not be revoked, and must not be expired.
  const stored = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() }
    },
    include: { user: true }
  });
  if (!stored) throw new HttpError(401, 'Refresh token has expired or was revoked');

  // Rotate refresh tokens: old token is revoked, new pair is issued.
  await prisma.refreshToken.update({ where: { tokenHash }, data: { revokedAt: new Date() } });
  return issueTokenPair(publicUser(stored.user));
}

export async function revokeRefreshToken(refreshToken) {
  if (!refreshToken) return;
  await prisma.refreshToken.updateMany({ where: { tokenHash: hashToken(refreshToken) }, data: { revokedAt: new Date() } });
}

export async function pruneExpiredRefreshTokens() {
  // Periodic cleanup keeps the refresh_tokens table small.
  return prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { revokedAt: { not: null } }
      ]
    }
  });
}

export async function getUserById(id) {
  return publicUser(await prisma.user.findUnique({ where: { id: BigInt(id) } }));
}
