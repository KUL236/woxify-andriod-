import { VideoModel, VideoStatus, ProcessingStep } from '../models/video.model';
import {
  extractAudio,
  splitAudioIntoChunks,
  mergeAudioWithVideo,
  getVideoInfo,
  cleanupFiles,
  mergeAudioChunks
} from './ffmpeg.service';
import { transcribeAudio } from './groq.service';
import { translateText } from './groq.service';
import { generateSpeech } from './tts.service';
import { logger } from '../utils/logger';
import path from 'path';
import { uploadToCloudinary, isCloudinaryConfigured } from "./cloudinary.service";

const updateStep = async (
  videoId: string,
  step: string,
  status: ProcessingStep['status'],
  message?: string,
  duration?: number
): Promise<void> => {
  await VideoModel.addProcessingStep(videoId, {
    step,
    status,
    message,
    timestamp: new Date().toISOString(),
    duration,
  });
};

export const processVideo = async (videoId: string): Promise<void> => {
  let audioPath: string | null = null;
  let speechPath: string | null = null;

  const startTime = Date.now();
  logger.info(`🎬 Starting video processing pipeline for: ${videoId}`);

  try {
    const video = await VideoModel.findById(videoId);
    if (!video) throw new Error('Video not found');
    if (!video.original_video) throw new Error('Original video path not found');

    // ──────────────────────────────────────────────
    // STEP 1: Extract audio
    // ──────────────────────────────────────────────
    await VideoModel.updateStatus(videoId, 'extracting_audio');
    await updateStep(videoId, 'extract_audio', 'in_progress', 'Extracting audio from video...');
    logger.info("STEP 1 - Extract Audio");
    const stepStart = Date.now();
    audioPath = await extractAudio(video.original_video, videoId);

    // Get video metadata while we're at it
    const videoInfo = await getVideoInfo(video.original_video).catch(() => ({ duration: 0 }));
    await VideoModel.updateStatus(videoId, 'extracting_audio', { duration: videoInfo.duration });
    await updateStep(videoId, 'extract_audio', 'completed', 'Audio extracted successfully', Date.now() - stepStart);

    // ──────────────────────────────────────────────
    // STEP 2: Transcribe audio (Hindi → Text)
    // ──────────────────────────────────────────────
    await VideoModel.updateStatus(videoId, 'transcribing');
    await updateStep(videoId, 'transcribe', 'in_progress', 'Transcribing Hindi speech...');
    logger.info("STEP 2 - Transcribe");
    const transcribeStart = Date.now();
    const chunks = await splitAudioIntoChunks(audioPath, videoId);

    logger.info(`Created ${chunks.length} audio chunks`);

    const transcripts = await Promise.all(
      chunks.map(async (chunk, index) => {

        logger.info(`Transcribing chunk ${index + 1}/${chunks.length}`);

        const result = await transcribeAudio(chunk);

        return result;

      })
    );

    const transcript = transcripts.join("\n");
    await VideoModel.updateStatus(videoId, 'transcribing', { transcript });
    await updateStep(videoId, 'transcribe', 'completed', `Transcribed ${transcript.length} characters`, Date.now() - transcribeStart);
    logger.info(`✅ Transcription complete: "${transcript.substring(0, 100)}..."`);

    // ──────────────────────────────────────────────
    // STEP 3: Translate (Hindi → English)
    // ──────────────────────────────────────────────
    await VideoModel.updateStatus(videoId, 'translating');
    await updateStep(videoId, 'translate', 'in_progress', 'Translating to English...');
    logger.info("STEP 3 - Translate")
    const translateStart = Date.now();
    const translatedText = await translateText(transcript, video.source_language || 'Hindi', video.target_language || 'English');
    await VideoModel.updateStatus(videoId, 'translating', { translated_text: translatedText });
    await updateStep(videoId, 'translate', 'completed', `Translation complete`, Date.now() - translateStart);
    logger.info(`✅ Translation complete: "${translatedText.substring(0, 100)}..."`);

    // ──────────────────────────────────────────────
    // STEP 4: Generate English speech
    // ──────────────────────────────────────────────
    await VideoModel.updateStatus(videoId, 'generating_speech');
    await updateStep(videoId, 'generate_speech', 'in_progress', 'Generating English voice...');
    logger.info("STEP 4 - Generate Speech");
    const speechStart = Date.now();
    speechPath = await generateSpeech(translatedText, video.target_language || 'English', videoId);
    await updateStep(videoId, 'generate_speech', 'completed', 'Voice generated successfully', Date.now() - speechStart);

    // ──────────────────────────────────────────────
    // STEP 5: Merge audio with video
    // ──────────────────────────────────────────────
    await VideoModel.updateStatus(videoId, 'merging');
    await updateStep(videoId, 'merge', 'in_progress', 'Merging dubbed audio with video...');
    logger.info("STEP 5 - Merge");
    const mergeStart = Date.now();
    const outputVideoPath = await mergeAudioWithVideo(video.original_video, speechPath, videoId, video.quality || '1080p', video.speed || 1.0);
    await updateStep(videoId, 'merge', 'completed', 'Video merged successfully', Date.now() - mergeStart);

    // ──────────────────────────────────────────────
    // STEP 6: Mark as completed
    // ──────────────────────────────────────────────
    // Cloudinary optional hai: keys ho to cloud pe upload, warna local file serve hogi
    let finalVideo = path.basename(outputVideoPath);

    if (isCloudinaryConfigured()) {
      try {
        logger.info("Uploading merged video to Cloudinary...");
        const cloudinaryVideo = await uploadToCloudinary(outputVideoPath, "translated-videos", "video");
        finalVideo = cloudinaryVideo.url;
        cleanupFiles([outputVideoPath]);
      } catch (err: any) {
        logger.warn(`Cloudinary upload failed, using local file instead: ${err.message}`);
      }
    } else {
      logger.info("Cloudinary not configured - keeping output video locally");
    }

    await VideoModel.updateStatus(videoId, "completed", {
      translated_video: finalVideo,
    });

    await updateStep(videoId, 'completed', 'completed', `Processing complete in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

    logger.info(`🎉 Video processing completed: ${videoId} in ${Date.now() - startTime}ms`);

    // Cleanup intermediate files
    cleanupFiles([audioPath, speechPath]);

  } catch (error: any) {
    logger.error(`❌ Video processing failed for ${videoId}:`, error);

    await VideoModel.updateStatus(videoId, 'failed', {
      error_message: error.message,
    }).catch(() => { });

    await updateStep(videoId, 'failed', 'failed', error.message).catch(() => { });

    // Cleanup on error
    if (audioPath) cleanupFiles([audioPath]);
    if (speechPath) cleanupFiles([speechPath]);

    throw error;
  }
};
