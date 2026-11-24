"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVideo = exports.retryVideo = exports.downloadVideo = exports.getHistory = exports.getVideoStatus = exports.uploadVideo = void 0;
const video_model_1 = require("../models/video.model");
const pipeline_service_1 = require("../services/pipeline.service");
const logger_1 = require("../utils/logger");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const outputDir = process.env.OUTPUT_DIR || './outputs';
const uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No video file provided' });
            return;
        }
        const { source_language = 'hi', target_language = 'en', voice = 'male', speed = 1, quality = '1080p' } = req.body;
        const userId = req.user.id;
        const video = await video_model_1.VideoModel.create({
            user_id: userId,
            original_filename: req.file.originalname,
            original_video: req.file.path,
            file_size: req.file.size,
            source_language,
            target_language,
            voice,
            speed: Number(speed),
            quality,
        });
        logger_1.logger.info(`Video uploaded by user ${userId}: ${video.id}`);
        // Start processing immediately (No Redis)
        logger_1.logger.info("Starting video processing...");
        (0, pipeline_service_1.processVideo)(video.id).catch(err => {
            logger_1.logger.error(`Processing failed for ${video.id}:`, err);
        });
        res.status(201).json({
            message: 'Video uploaded and processing started',
            video: {
                id: video.id,
                original_filename: video.original_filename,
                status: video.status,
                source_language: video.source_language,
                target_language: video.target_language,
                voice: video.voice,
                speed: video.speed,
                quality: video.quality,
                created_at: video.created_at,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Upload error:', error);
        res.status(500).json({ error: `Upload failed: ${error.message}` });
    }
};
exports.uploadVideo = uploadVideo;
const getVideoStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const video = await video_model_1.VideoModel.findByIdAndUser(id, req.user.id);
        if (!video) {
            res.status(404).json({ error: 'Video not found' });
            return;
        }
        res.json({
            id: video.id,
            original_filename: video.original_filename,
            status: video.status,
            transcript: video.transcript,
            translated_text: video.translated_text,
            source_language: video.source_language,
            target_language: video.target_language,
            error_message: video.error_message,
            duration: video.duration,
            file_size: video.file_size,
            processing_steps: video.processing_steps,
            has_translated_video: !!video.translated_video,
            created_at: video.created_at,
            updated_at: video.updated_at,
        });
    }
    catch (error) {
        logger_1.logger.error('Get status error:', error);
        res.status(500).json({ error: 'Failed to get video status' });
    }
};
exports.getVideoStatus = getVideoStatus;
const getHistory = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const videos = await video_model_1.VideoModel.findByUser(req.user.id, limit, offset);
        const total = await video_model_1.VideoModel.countByUser(req.user.id);
        res.json({
            videos: videos.map(v => ({
                id: v.id,
                original_filename: v.original_filename,
                status: v.status,
                source_language: v.source_language,
                target_language: v.target_language,
                voice: v.voice,
                speed: v.speed,
                quality: v.quality,
                duration: v.duration,
                file_size: v.file_size,
                error_message: v.error_message,
                has_translated_video: !!v.translated_video,
                created_at: v.created_at,
                updated_at: v.updated_at,
            })),
            total,
            limit,
            offset,
        });
    }
    catch (error) {
        logger_1.logger.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to fetch video history' });
    }
};
exports.getHistory = getHistory;
const downloadVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const video = await video_model_1.VideoModel.findById(id);
        if (!video) {
            res.status(404).json({ error: "Video not found" });
            return;
        }
        if (video.status !== "completed" || !video.translated_video) {
            res.status(400).json({ error: "Video is not ready" });
            return;
        }
        // Cloudinary URL
        if (video.translated_video.startsWith("http://") ||
            video.translated_video.startsWith("https://")) {
            res.redirect(video.translated_video);
            return;
        }
        // Local file (fallback)
        const filePath = path_1.default.resolve(outputDir, video.translated_video);
        if (!fs_1.default.existsSync(filePath)) {
            res.status(404).json({ error: "Output file not found" });
            return;
        }
        res.download(filePath, `translated_${video.original_filename}`);
    }
    catch (error) {
        logger_1.logger.error("Download error:", error);
        res.status(500).json({
            error: "Download failed",
        });
    }
};
exports.downloadVideo = downloadVideo;
const retryVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const video = await video_model_1.VideoModel.findByIdAndUser(id, req.user.id);
        if (!video) {
            res.status(404).json({ error: 'Video not found' });
            return;
        }
        if (video.status !== 'failed') {
            res.status(400).json({ error: 'Only failed videos can be retried' });
            return;
        }
        await video_model_1.VideoModel.updateStatus(id, 'uploaded', {
            error_message: undefined,
            processing_steps: [],
        });
        (0, pipeline_service_1.processVideo)(id).catch(err => {
            logger_1.logger.error(`Retry processing failed for ${id}:`, err);
        });
        res.json({ message: 'Video processing restarted', id });
    }
    catch (error) {
        logger_1.logger.error('Retry error:', error);
        res.status(500).json({ error: 'Retry failed' });
    }
};
exports.retryVideo = retryVideo;
const deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const video = await video_model_1.VideoModel.findByIdAndUser(id, req.user.id);
        if (!video) {
            res.status(404).json({ error: "Video not found" });
            return;
        }
        await video_model_1.VideoModel.delete(id);
        res.json({
            success: true,
            message: "Video deleted successfully",
        });
    }
    catch (error) {
        logger_1.logger.error("Delete video failed:", error);
        res.status(500).json({
            error: "Failed to delete video",
        });
    }
};
exports.deleteVideo = deleteVideo;
//# sourceMappingURL=video.controller.js.map