import express from 'express';
import { uploadImageController } from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { uploadImage } from '../services/upload.service.js';

export const uploadRouter = express.Router();

// Multer reads one file field named "image", then controller returns the image URL.
uploadRouter.post('/images', authenticate, uploadImage.single('image'), uploadImageController);
