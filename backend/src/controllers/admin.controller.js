import { adminDeleteProperty, deleteUser, listAdminProperties, listUsers, updateUserRole } from '../services/admin.service.js';
import { successResponse } from '../utils/response.js';

export async function listUsersController(req, res, next) {
  try {
    // Return users for admin dashboard.
    res.json(successResponse({ items: await listUsers() }));
  } catch (error) {
    next(error);
  }
}

export async function updateUserRoleController(req, res, next) {
  try {
    // Change one user's role to USER or ADMIN.
    res.json(successResponse(await updateUserRole(req.validated.params.id, req.validated.body.role)));
  } catch (error) {
    next(error);
  }
}

export async function deleteUserController(req, res, next) {
  try {
    // Admin cannot delete their own account; service checks that rule.
    await deleteUser(req.validated.params.id, req.user.id);
    res.json(successResponse(null));
  } catch (error) {
    next(error);
  }
}

export async function listAdminPropertiesController(req, res, next) {
  try {
    // Return active properties visible in admin property table.
    res.json(successResponse({ items: await listAdminProperties() }));
  } catch (error) {
    next(error);
  }
}

export async function adminDeletePropertyController(req, res, next) {
  try {
    // Admin soft-deletes any active property.
    await adminDeleteProperty(req.validated.params.id);
    res.json(successResponse(null));
  } catch (error) {
    next(error);
  }
}
