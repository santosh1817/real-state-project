import { getUploadedImageUrl } from '../services/upload.service.js';
import { successResponse } from '../utils/response.js';

export async function uploadImageController(req, res, next) {
  try {
    // Upload service returns either Cloudinary URL or local fallback URL.
    const url = await getUploadedImageUrl(req);
    res.status(201).json(successResponse({
      url
    }));
  } catch (error) {
    next(error);
  }
}
