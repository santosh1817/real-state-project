import express from 'express';
import { loginController, logoutController, meController, refreshController, registerController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, refreshSchema, registerSchema } from '../schemas/auth.schemas.js';

export const authRouter = express.Router();

// Create account and login are public routes.
authRouter.post('/register', validate(registerSchema), registerController);
authRouter.post('/login', validate(loginSchema), loginController);
// Refresh rotates refresh tokens; logout revokes the refresh token.
authRouter.post('/refresh', validate(refreshSchema), refreshController);
authRouter.post('/logout', logoutController);
// /me is protected and returns the current user from the token.
authRouter.get('/me', authenticate, meController);
