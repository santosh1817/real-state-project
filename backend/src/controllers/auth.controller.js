import { loginUser, refreshTokens, registerUser, revokeRefreshToken } from '../services/auth.service.js';
import { successResponse } from '../utils/response.js';

export async function registerController(req, res, next) {
  try {
    // Register returns user plus access/refresh tokens.
    res.status(201).json(successResponse(await registerUser(req.validated.body)));
  } catch (error) {
    next(error);
  }
}

export async function loginController(req, res, next) {
  try {
    // Login returns a fresh token pair.
    res.json(successResponse(await loginUser(req.validated.body)));
  } catch (error) {
    next(error);
  }
}

export async function refreshController(req, res, next) {
  try {
    // Refresh rotates the refresh token and returns a new pair.
    res.json(successResponse(await refreshTokens(req.validated.body.refreshToken)));
  } catch (error) {
    next(error);
  }
}

export async function logoutController(req, res, next) {
  try {
    await revokeRefreshToken(req.body.refreshToken);
    res.json(successResponse(null));
  } catch (error) {
    next(error);
  }
}

export function meController(req, res) {
  res.json(successResponse({ user: req.user }));
}
