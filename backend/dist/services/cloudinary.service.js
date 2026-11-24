"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCloudinaryUrl = exports.deleteFromCloudinary = exports.uploadToCloudinary = exports.isCloudinaryConfigured = void 0;
const cloudinary_1 = require("cloudinary");
const logger_1 = require("../utils/logger");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const isCloudinaryConfigured = () => !!(process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET);
exports.isCloudinaryConfigured = isCloudinaryConfigured;
const uploadToCloudinary = async (filePath, folder = 'ai-video-translator', resourceType = 'video') => {
    if (!(0, exports.isCloudinaryConfigured)()) {
        throw new Error('Cloudinary is not configured');
    }
    logger_1.logger.info(`Uploading to Cloudinary: ${filePath}`);
    const result = await cloudinary_1.v2.uploader.upload(filePath, {
        folder,
        resource_type: resourceType,
        chunk_size: 6000000, // 6MB chunks for large videos
    });
    logger_1.logger.info(`Cloudinary upload complete: ${result.secure_url}`);
    return { url: result.secure_url, publicId: result.public_id };
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (publicId) => {
    if (!(0, exports.isCloudinaryConfigured)())
        return;
    try {
        await cloudinary_1.v2.uploader.destroy(publicId, { resource_type: 'video' });
        logger_1.logger.info(`Deleted from Cloudinary: ${publicId}`);
    }
    catch (err) {
        logger_1.logger.warn('Cloudinary delete failed:', err);
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
const getCloudinaryUrl = (publicId) => {
    return cloudinary_1.v2.url(publicId, { secure: true });
};
exports.getCloudinaryUrl = getCloudinaryUrl;
//# sourceMappingURL=cloudinary.service.js.map