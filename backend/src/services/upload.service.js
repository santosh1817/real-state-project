import crypto from 'crypto';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.resolve(__dirname, '../../uploads');

fs.mkdirSync(uploadsDir, { recursive: true });

// Cloudinary is enabled only when required credentials exist.
export const isCloudinaryEnabled = Boolean(
  env.cloudinaryUrl ||
  (env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret)
);

if (isCloudinaryEnabled && !env.cloudinaryUrl) {
  // Configure Cloudinary using separate environment variables.
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret
  });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    // Local uploads need a unique filename to avoid overwriting files.
    cb(null, createUploadFilename(file));
  }
});

export const uploadImage = multer({
  // Cloudinary upload needs file buffer; local upload writes directly to disk.
  storage: isCloudinaryEnabled ? multer.memoryStorage() : storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Accept only image MIME types.
    if (!file.mimetype.startsWith('image/')) {
      cb(new HttpError(400, 'Only image files are allowed'));
      return;
    }
    cb(null, true);
  }
});

function uploadBufferToCloudinary(file) {
  return new Promise((resolve, reject) => {
    // Stream the uploaded file buffer to Cloudinary.
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'real-estate-platform/properties',
        resource_type: 'image',
        public_id: `${Date.now()}-${crypto.randomUUID()}`
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
}

function createUploadFilename(file) {
  // Keep original extension but make the name unique.
  const extension = path.extname(file.originalname).toLowerCase();
  return `${Date.now()}-${crypto.randomUUID()}${extension}`;
}

async function saveBufferLocally(req) {
  // Development fallback: save buffer to backend/uploads if Cloudinary is unavailable.
  const filename = createUploadFilename(req.file);
  const destination = path.join(uploadsDir, filename);
  await fs.promises.writeFile(destination, req.file.buffer);
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
}

export async function getUploadedImageUrl(req) {
  if (!req.file) throw new HttpError(400, 'Image file is required');
  if (isCloudinaryEnabled) {
    try {
      // Preferred path: return Cloudinary secure URL.
      return await uploadBufferToCloudinary(req.file);
    } catch (error) {
      console.error('Cloudinary upload failed:', error.message || error);
      if (env.nodeEnv !== 'production') {
        // In development, keep the app usable even if Cloudinary times out.
        return saveBufferLocally(req);
      }
      // In production, fail clearly instead of storing files on the server.
      throw new HttpError(502, 'Image storage provider failed');
    }
  }
  // If Cloudinary is disabled, return the local file URL.
  return `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
}
