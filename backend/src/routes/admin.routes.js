import express from 'express';
import { z } from 'zod';
import { adminDeletePropertyController, deleteUserController, listAdminPropertiesController, listUsersController, updateUserRoleController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeAdmin } from '../middleware/authorizeAdmin.js';
import { validate } from '../middleware/validate.js';

export const adminRouter = express.Router();

// Validate numeric :id route parameters.
const idSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.coerce.number().int().positive() })
});

const roleSchema = z.object({
  body: z.object({ role: z.enum(['USER', 'ADMIN']) }),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.coerce.number().int().positive() })
});

// Everything below this line is admin-only.
adminRouter.use(authenticate, authorizeAdmin);

// Admin user management.
adminRouter.get('/users', listUsersController);
adminRouter.patch('/users/:id/role', validate(roleSchema), updateUserRoleController);
adminRouter.delete('/users/:id', validate(idSchema), deleteUserController);
// Admin property management.
adminRouter.get('/properties', listAdminPropertiesController);
adminRouter.delete('/properties/:id', validate(idSchema), adminDeletePropertyController);
