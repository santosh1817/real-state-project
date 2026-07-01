import { createProperty, deleteProperty, getProperty, getSimilarProperties, listProperties, updateProperty } from '../services/property.service.js';
import { successResponse } from '../utils/response.js';

export async function listPropertiesController(req, res, next) {
  try {
    // Use validated filters from query string to search listings.
    const result = await listProperties(req.validated.query);
    res.json(successResponse({ items: result.data, nextCursor: result.nextCursor }));
  } catch (error) {
    next(error);
  }
}

export async function createPropertyController(req, res, next) {
  try {
    // req.user comes from authenticate middleware.
    res.status(201).json(successResponse(await createProperty(req.user.id, req.validated.body)));
  } catch (error) {
    next(error);
  }
}

export async function getPropertyController(req, res, next) {
  try {
    // Detail API returns the selected property plus similar recommendations.
    const property = await getProperty(req.validated.params.id);
    const similar = await getSimilarProperties(req.validated.params.id);
    res.json(successResponse({ property, similar }));
  } catch (error) {
    next(error);
  }
}

export async function updatePropertyController(req, res, next) {
  try {
    // Service checks if user is owner or admin before updating.
    res.json(successResponse(await updateProperty(req.validated.params.id, req.user, req.validated.body)));
  } catch (error) {
    next(error);
  }
}

export async function deletePropertyController(req, res, next) {
  try {
    // Delete is a soft delete, so property is hidden but row remains in database.
    await deleteProperty(req.validated.params.id, req.user);
    res.json(successResponse(null));
  } catch (error) {
    next(error);
  }
}
