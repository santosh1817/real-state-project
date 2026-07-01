import { createInquiry, listMyInquiries } from '../services/inquiry.service.js';
import { successResponse } from '../utils/response.js';

export async function createInquiryController(req, res, next) {
  try {
    // Logged-in buyer creates one inquiry for a property.
    res.status(201).json(successResponse(await createInquiry(req.validated.params.propertyId, req.user.id, req.validated.body)));
  } catch (error) {
    next(error);
  }
}

export async function listMyInquiriesController(req, res, next) {
  try {
    // Logged-in owner sees inquiries received on their properties.
    res.json(successResponse({ items: await listMyInquiries(req.user.id) }));
  } catch (error) {
    next(error);
  }
}
