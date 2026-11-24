import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { VideoModel } from '../models/video.model';
import { processVideo } from '../services/pipeline.service';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';

const outputDir = process.env.OUTPUT_DIR || './outputs';

export const uploadVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No video file provided' });
      return;
    }
    const { source_language = 'hi',
      target_language = 'en',
      voice = 'male',
      speed = 1,
      quality = '1080p'
    } = req.body;
    const userId = req.user!.id;

    const video = await VideoModel.create({
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

    logger.info(`Video uploaded by user ${userId}: ${video.id}`);

    // Start processing immediately (No Redis)
    logger.info("Starting video processing...");

    processVideo(video.id).catch(err => {
      logger.error(`Processing failed for ${video.id}:`, err);
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
  } catch (error: any) {
    logger.error('Upload error:', error);
    res.status(500).json({ error: `Upload failed: ${error.message}` });
  }
};

export const getVideoStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const video = await VideoModel.findByIdAndUser(id, req.user!.id);

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
  } catch (error: any) {
    logger.error('Get status error:', error);
    res.status(500).json({ error: 'Failed to get video status' });
  }
};

export const getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const videos = await VideoModel.findByUser(req.user!.id, limit, offset);
    const total = await VideoModel.countByUser(req.user!.id);

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
  } catch (error: any) {
    logger.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch video history' });
  }
};

export const downloadVideo = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const video = await VideoModel.findById(id);

    if (!video) {
      res.status(404).json({ error: "Video not found" });
      return;
    }

    if (video.status !== "completed" || !video.translated_video) {
      res.status(400).json({ error: "Video is not ready" });
      return;
    }

    // Cloudinary URL
    if (
      video.translated_video.startsWith("http://") ||
      video.translated_video.startsWith("https://")
    ) {
      res.redirect(video.translated_video);
      return;
    }

    // Local file (fallback)
    const filePath = path.resolve(outputDir, video.translated_video);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "Output file not found" });
      return;
    }

    res.download(filePath, `translated_${video.original_filename}`);
  } catch (error: any) {
    logger.error("Download error:", error);

    res.status(500).json({
      error: "Download failed",
    });
  }
};

export const retryVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const video = await VideoModel.findByIdAndUser(id, req.user!.id);

    if (!video) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    if (video.status !== 'failed') {
      res.status(400).json({ error: 'Only failed videos can be retried' });
      return;
    }

    await VideoModel.updateStatus(id, 'uploaded', {
      error_message: undefined,
      processing_steps: [] as any,
    });

    processVideo(id).catch(err => {
      logger.error(`Retry processing failed for ${id}:`, err);
    });

    res.json({ message: 'Video processing restarted', id });
  } catch (error: any) {
    logger.error('Retry error:', error);
    res.status(500).json({ error: 'Retry failed' });
  }
};
export const deleteVideo = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const video = await VideoModel.findByIdAndUser(id, req.user!.id);

    if (!video) {
      res.status(404).json({ error: "Video not found" });
      return;
    }

    await VideoModel.delete(id);

    res.json({
      success: true,
      message: "Video deleted successfully",
    });

  } catch (error: any) {
    logger.error("Delete video failed:", error);

    res.status(500).json({
      error: "Failed to delete video",
    });
  }
};

