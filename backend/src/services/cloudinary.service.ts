import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const isCloudinaryConfigured = (): boolean =>
  !!(process.env.CLOUDINARY_CLOUD_NAME &&
     process.env.CLOUDINARY_API_KEY &&
     process.env.CLOUDINARY_API_SECRET);

export const uploadToCloudinary = async (
  filePath: string,
  folder: string = 'ai-video-translator',
  resourceType: 'video' | 'auto' = 'video'
): Promise<{ url: string; publicId: string }> => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  logger.info(`Uploading to Cloudinary: ${filePath}`);

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: resourceType,
    chunk_size: 6000000, // 6MB chunks for large videos
  });

  logger.info(`Cloudinary upload complete: ${result.secure_url}`);
  return { url: result.secure_url, publicId: result.public_id };
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (!isCloudinaryConfigured()) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    logger.info(`Deleted from Cloudinary: ${publicId}`);
  } catch (err) {
    logger.warn('Cloudinary delete failed:', err);
  }
};

export const getCloudinaryUrl = (publicId: string): string => {
  return cloudinary.url(publicId, { secure: true });
};
