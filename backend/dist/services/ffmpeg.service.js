"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupFiles = exports.getVideoInfo = exports.mergeAudioWithVideo = exports.mergeAudioChunks = exports.splitAudioIntoChunks = exports.extractAudio = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../utils/logger");
const outputDir = process.env.OUTPUT_DIR || './outputs';
const extractAudio = (videoPath, videoId) => {
    return new Promise((resolve, reject) => {
        const audioPath = path_1.default.join(outputDir, `${videoId}_audio.mp3`);
        logger_1.logger.info(`Extracting audio from: ${videoPath}`);
        (0, fluent_ffmpeg_1.default)(videoPath)
            .noVideo()
            .audioCodec("libmp3lame")
            .audioBitrate("128k")
            .audioFrequency(16000)
            .audioChannels(1)
            .format("mp3")
            .output(audioPath)
            .on('start', (cmd) => logger_1.logger.debug(`FFmpeg command: ${cmd}`))
            .on('progress', (progress) => {
            logger_1.logger.debug(`Audio extraction progress: ${progress.percent?.toFixed(1)}%`);
        })
            .on('end', () => {
            logger_1.logger.info(`Audio extracted successfully: ${audioPath}`);
            resolve(audioPath);
        })
            .on('error', (err) => {
            logger_1.logger.error('Audio extraction failed:', err);
            reject(new Error(`Audio extraction failed: ${err.message}`));
        })
            .run();
    });
};
exports.extractAudio = extractAudio;
const splitAudioIntoChunks = (audioPath, videoId, chunkDuration = 300) => {
    return new Promise((resolve, reject) => {
        const chunkDir = path_1.default.join(outputDir, `${videoId}_chunks`);
        if (!fs_1.default.existsSync(chunkDir)) {
            fs_1.default.mkdirSync(chunkDir, { recursive: true });
        }
        const outputPattern = path_1.default.join(chunkDir, "chunk_%03d.mp3");
        (0, fluent_ffmpeg_1.default)(audioPath)
            .outputOptions([
            "-f",
            "segment",
            "-segment_time",
            String(chunkDuration),
            "-c",
            "copy"
        ])
            .output(outputPattern)
            .on("end", () => {
            const files = fs_1.default.readdirSync(chunkDir)
                .filter(file => file.endsWith(".mp3"))
                .sort()
                .map(file => path_1.default.join(chunkDir, file));
            resolve(files);
        })
            .on("error", reject)
            .run();
    });
};
exports.splitAudioIntoChunks = splitAudioIntoChunks;
const mergeAudioChunks = (chunks, videoId) => {
    return new Promise((resolve, reject) => {
        const listFile = path_1.default.join(outputDir, `${videoId}_chunks.txt`);
        const mergedAudio = path_1.default.join(outputDir, `${videoId}_merged.mp3`);
        fs_1.default.writeFileSync(listFile, chunks
            .map(file => `file '${path_1.default.resolve(file)}'`)
            .join("\n"));
        (0, fluent_ffmpeg_1.default)()
            .input(listFile)
            .inputOptions(["-f", "concat", "-safe", "0"])
            .outputOptions(["-c", "copy"])
            .output(mergedAudio)
            .on("end", () => {
            fs_1.default.unlinkSync(listFile);
            resolve(mergedAudio);
        })
            .on("error", reject)
            .run();
    });
};
exports.mergeAudioChunks = mergeAudioChunks;
const mergeAudioWithVideo = (videoPath, audioPath, videoId, quality = '1080p', speed = 1.0) => {
    return new Promise((resolve, reject) => {
        const outputPath = path_1.default.join(outputDir, `${videoId}_translated.mp4`);
        logger_1.logger.info(`Merging audio with video: ${videoPath}`);
        let scale = "1920:1080";
        switch (quality) {
            case "720p":
                scale = "1280:720";
                break;
            case "1080p":
                scale = "1920:1080";
                break;
            case "1440p":
                scale = "2560:1440";
                break;
            case "4k":
                scale = "3840:2160";
                break;
        }
        const speedFilter = speed !== 1.0 ? `setpts=${(1 / speed).toFixed(2)}*PTS` : null;
        (0, fluent_ffmpeg_1.default)()
            .input(videoPath)
            .input(audioPath)
            .outputOptions([
            "-vf",
            `scale=${scale},setpts=${(1 / speed).toFixed(2)}*PTS`,
            "-c:v",
            "libx264",
            "-preset",
            "slow",
            "-crf",
            "18",
            "-filter:a",
            `atempo=${speed}`,
            "-c:a",
            "aac",
            "-b:a",
            "320k",
            "-map",
            "0:v:0",
            "-map",
            "1:a:0",
            "-shortest",
            "-movflags",
            "+faststart",
        ])
            .output(outputPath)
            .on('start', (cmd) => logger_1.logger.debug(`FFmpeg merge command: ${cmd}`))
            .on('progress', (progress) => {
            logger_1.logger.debug(`Video merge progress: ${progress.percent?.toFixed(1)}%`);
        })
            .on('end', () => {
            logger_1.logger.info(`Video merged successfully: ${outputPath}`);
            resolve(outputPath);
        })
            .on('error', (err) => {
            logger_1.logger.error('Video merge failed:', err);
            reject(new Error(`Video merge failed: ${err.message}`));
        })
            .run();
    });
};
exports.mergeAudioWithVideo = mergeAudioWithVideo;
const getVideoInfo = (videoPath) => {
    return new Promise((resolve, reject) => {
        fluent_ffmpeg_1.default.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                reject(new Error(`Failed to get video info: ${err.message}`));
                return;
            }
            const videoStream = metadata.streams.find(s => s.codec_type === 'video');
            const format = metadata.format;
            resolve({
                duration: format.duration || 0,
                width: videoStream?.width,
                height: videoStream?.height,
                codec: videoStream?.codec_name,
                bitrate: format.bit_rate ? parseInt(String(format.bit_rate)) : undefined,
            });
        });
    });
};
exports.getVideoInfo = getVideoInfo;
const cleanupFiles = (filePaths) => {
    filePaths.forEach(fp => {
        if (fp && fs_1.default.existsSync(fp)) {
            try {
                fs_1.default.unlinkSync(fp);
                logger_1.logger.debug(`Cleaned up file: ${fp}`);
            }
            catch (err) {
                logger_1.logger.warn(`Failed to clean up file: ${fp}`, err);
            }
        }
    });
};
exports.cleanupFiles = cleanupFiles;
//# sourceMappingURL=ffmpeg.service.js.map