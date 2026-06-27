import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { createInquirySchema } from './inquiry.schemas.js';
import { createInquiry, listMyInquiries } from './inquiry.service.js';

export const inquiryRouter = express.Router();

const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many inquiries. Please try again later.' }
});

inquiryRouter.post('/properties/:propertyId/inquiries', authenticate, inquiryLimiter, validate(createInquirySchema), async (req, res, next) => {
  try {
    res.status(201).json(await createInquiry(req.validated.params.propertyId, req.user.id, req.validated.body));
  } catch (error) {
    next(error);
  }
});

inquiryRouter.get('/inquiries/mine', authenticate, async (req, res, next) => {
  try {
    res.json({ data: await listMyInquiries(req.user.id) });
  } catch (error) {
    next(error);
  }
});
