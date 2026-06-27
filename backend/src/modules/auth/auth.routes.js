import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { loginSchema, refreshSchema, registerSchema } from './auth.schemas.js';
import { loginUser, refreshTokens, registerUser, revokeRefreshToken } from './auth.service.js';

export const authRouter = express.Router();

authRouter.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    res.status(201).json(await registerUser(req.validated.body));
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    res.json(await loginUser(req.validated.body));
  } catch (error) {
    next(error);
  }
});

authRouter.post('/refresh', validate(refreshSchema), async (req, res, next) => {
  try {
    res.json(await refreshTokens(req.validated.body.refreshToken));
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', async (req, res, next) => {
  try {
    await revokeRefreshToken(req.body.refreshToken);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});
