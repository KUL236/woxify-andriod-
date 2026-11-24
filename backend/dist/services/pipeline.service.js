"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processVideo = void 0;
const video_model_1 = require("../models/video.model");
const ffmpeg_service_1 = require("./ffmpeg.service");
const groq_service_1 = require("./groq.service");
const groq_service_2 = require("./groq.service");
const tts_service_1 = require("./tts.service");
const logger_1 = require("../utils/logger");
const path_1 = __importDefault(require("path"));
const cloudinary_service_1 = require("./cloudinary.service");
const updateStep = async (videoId, step, status, message, duration) => {
    await video_model_1.VideoModel.addProcessingStep(videoId, {
        step,
        status,
        message,
        timestamp: new Date().toISOString(),
        duration,
    });
};
const processVideo = async (videoId) => {
    let audioPath = null;
    let speechPath = null;
    const startTime = Date.now();
    logger_1.logger.info(`🎬 Starting video processing pipeline for: ${videoId}`);
    try {
        const video = await video_model_1.VideoModel.findById(videoId);
        if (!video)
            throw new Error('Video not found');
        if (!video.original_video)
            throw new Error('Original video path not found');
        // ──────────────────────────────────────────────
        // STEP 1: Extract audio
        // ──────────────────────────────────────────────
        await video_model_1.VideoModel.updateStatus(videoId, 'extracting_audio');
        await updateStep(videoId, 'extract_audio', 'in_progress', 'Extracting audio from video...');
        logger_1.logger.info("STEP 1 - Extract Audio");
        const stepStart = Date.now();
        audioPath = await (0, ffmpeg_service_1.extractAudio)(video.original_video, videoId);
        // Get video metadata while we're at it
        const videoInfo = await (0, ffmpeg_service_1.getVideoInfo)(video.original_video).catch(() => ({ duration: 0 }));
        await video_model_1.VideoModel.updateStatus(videoId, 'extracting_audio', { duration: videoInfo.duration });
        await updateStep(videoId, 'extract_audio', 'completed', 'Audio extracted successfully', Date.now() - stepStart);
        // ──────────────────────────────────────────────
        // STEP 2: Transcribe audio (Hindi → Text)
        // ──────────────────────────────────────────────
        await video_model_1.VideoModel.updateStatus(videoId, 'transcribing');
        await updateStep(videoId, 'transcribe', 'in_progress', 'Transcribing Hindi speech...');
        logger_1.logger.info("STEP 2 - Transcribe");
        const transcribeStart = Date.now();
        const chunks = await (0, ffmpeg_service_1.splitAudioIntoChunks)(audioPath, videoId);
        logger_1.logger.info(`Created ${chunks.length} audio chunks`);
        const transcripts = await Promise.all(chunks.map(async (chunk, index) => {
            logger_1.logger.info(`Transcribing chunk ${index + 1}/${chunks.length}`);
            const result = await (0, groq_service_1.transcribeAudio)(chunk);
            return result;
        }));
        const transcript = transcripts.join("\n");
        await video_model_1.VideoModel.updateStatus(videoId, 'transcribing', { transcript });
        await updateStep(videoId, 'transcribe', 'completed', `Transcribed ${transcript.length} characters`, Date.now() - transcribeStart);
        logger_1.logger.info(`✅ Transcription complete: "${transcript.substring(0, 100)}..."`);
        // ──────────────────────────────────────────────
        // STEP 3: Translate (Hindi → English)
        // ──────────────────────────────────────────────
        await video_model_1.VideoModel.updateStatus(videoId, 'translating');
        await updateStep(videoId, 'translate', 'in_progress', 'Translating to English...');
        logger_1.logger.info("STEP 3 - Translate");
        const translateStart = Date.now();
        const translatedText = await (0, groq_service_2.translateText)(transcript, video.source_language || 'Hindi', video.target_language || 'English');
        await video_model_1.VideoModel.updateStatus(videoId, 'translating', { translated_text: translatedText });
        await updateStep(videoId, 'translate', 'completed', `Translation complete`, Date.now() - translateStart);
        logger_1.logger.info(`✅ Translation complete: "${translatedText.substring(0, 100)}..."`);
        // ──────────────────────────────────────────────
        // STEP 4: Generate English speech
        // ──────────────────────────────────────────────
        await video_model_1.VideoModel.updateStatus(videoId, 'generating_speech');
        await updateStep(videoId, 'generate_speech', 'in_progress', 'Generating English voice...');
        logger_1.logger.info("STEP 4 - Generate Speech");
        const speechStart = Date.now();
        speechPath = await (0, tts_service_1.generateSpeech)(translatedText, video.target_language || 'English', videoId);
        await updateStep(videoId, 'generate_speech', 'completed', 'Voice generated successfully', Date.now() - speechStart);
        // ──────────────────────────────────────────────
        // STEP 5: Merge audio with video
        // ──────────────────────────────────────────────
        await video_model_1.VideoModel.updateStatus(videoId, 'merging');
        await updateStep(videoId, 'merge', 'in_progress', 'Merging dubbed audio with video...');
        logger_1.logger.info("STEP 5 - Merge");
        const mergeStart = Date.now();
        const outputVideoPath = await (0, ffmpeg_service_1.mergeAudioWithVideo)(video.original_video, speechPath, videoId, video.quality || '1080p', video.speed || 1.0);
        await updateStep(videoId, 'merge', 'completed', 'Video merged successfully', Date.now() - mergeStart);
        // ──────────────────────────────────────────────
        // STEP 6: Mark as completed
        // ──────────────────────────────────────────────
        // Cloudinary optional hai: keys ho to cloud pe upload, warna local file serve hogi
        let finalVideo = path_1.default.basename(outputVideoPath);
        if ((0, cloudinary_service_1.isCloudinaryConfigured)()) {
            try {
                logger_1.logger.info("Uploading merged video to Cloudinary...");
                const cloudinaryVideo = await (0, cloudinary_service_1.uploadToCloudinary)(outputVideoPath, "translated-videos", "video");
                finalVideo = cloudinaryVideo.url;
                (0, ffmpeg_service_1.cleanupFiles)([outputVideoPath]);
            }
            catch (err) {
                logger_1.logger.warn(`Cloudinary upload failed, using local file instead: ${err.message}`);
            }
        }
        else {
            logger_1.logger.info("Cloudinary not configured - keeping output video locally");
        }
        await video_model_1.VideoModel.updateStatus(videoId, "completed", {
            translated_video: finalVideo,
        });
        await updateStep(videoId, 'completed', 'completed', `Processing complete in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
        logger_1.logger.info(`🎉 Video processing completed: ${videoId} in ${Date.now() - startTime}ms`);
        // Cleanup intermediate files
        (0, ffmpeg_service_1.cleanupFiles)([audioPath, speechPath]);
    }
    catch (error) {
        logger_1.logger.error(`❌ Video processing failed for ${videoId}:`, error);
        await video_model_1.VideoModel.updateStatus(videoId, 'failed', {
            error_message: error.message,
        }).catch(() => { });
        await updateStep(videoId, 'failed', 'failed', error.message).catch(() => { });
        // Cleanup on error
        if (audioPath)
            (0, ffmpeg_service_1.cleanupFiles)([audioPath]);
        if (speechPath)
            (0, ffmpeg_service_1.cleanupFiles)([speechPath]);
        throw error;
    }
};
exports.processVideo = processVideo;
//# sourceMappingURL=pipeline.service.js.map