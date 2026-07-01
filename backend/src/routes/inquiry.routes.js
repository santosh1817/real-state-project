import express from 'express';
import { createRateLimiter } from '../config/rateLimit.js';
import { createInquiryController, listMyInquiriesController } from '../controllers/inquiry.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createInquirySchema } from '../schemas/inquiry.schemas.js';

export const inquiryRouter = express.Router();

const inquiryLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  prefix: 'rl:inquiry:',
  message: { success: false, statusCode: 429, code: 'TOO_MANY_REQUESTS', message: 'Too many inquiries. Please try again later.' }
});

// A logged-in buyer can contact the owner of one property.
inquiryRouter.post('/properties/:propertyId/inquiries', authenticate, inquiryLimiter, validate(createInquirySchema), createInquiryController);
// A logged-in owner can see inquiries received for their listings.
inquiryRouter.get('/inquiries/mine', authenticate, listMyInquiriesController);
