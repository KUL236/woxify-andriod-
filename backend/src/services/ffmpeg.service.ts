import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

const outputDir = process.env.OUTPUT_DIR || './outputs';

export interface VideoInfo {
  duration: number;
  width?: number;
  height?: number;
  codec?: string;
  bitrate?: number;
}

export const extractAudio = (videoPath: string, videoId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const audioPath = path.join(outputDir, `${videoId}_audio.mp3`);

    logger.info(`Extracting audio from: ${videoPath}`);

    ffmpeg(videoPath)
      .noVideo()
      .audioCodec("libmp3lame")
      .audioBitrate("128k")
      .audioFrequency(16000)
      .audioChannels(1)
      .format("mp3")
      .output(audioPath)
      .on('start', (cmd) => logger.debug(`FFmpeg command: ${cmd}`))
      .on('progress', (progress) => {
        logger.debug(`Audio extraction progress: ${progress.percent?.toFixed(1)}%`);
      })
      .on('end', () => {
        logger.info(`Audio extracted successfully: ${audioPath}`);
        resolve(audioPath);
      })
      .on('error', (err) => {
        logger.error('Audio extraction failed:', err);
        reject(new Error(`Audio extraction failed: ${err.message}`));
      })
      .run();
  });
};

export const splitAudioIntoChunks = (
  audioPath: string,
  videoId: string,
  chunkDuration: number = 300
): Promise<string[]> => {
  return new Promise((resolve, reject) => {

    const chunkDir = path.join(outputDir, `${videoId}_chunks`);

    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    const outputPattern = path.join(chunkDir, "chunk_%03d.mp3");

    ffmpeg(audioPath)
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

        const files = fs.readdirSync(chunkDir)
          .filter(file => file.endsWith(".mp3"))
          .sort()
          .map(file => path.join(chunkDir, file));

        resolve(files);

      })
      .on("error", reject)
      .run();

  });
};

export const mergeAudioChunks = (
  chunks: string[],
  videoId: string
): Promise<string> => {

  return new Promise((resolve, reject) => {

    const listFile = path.join(outputDir, `${videoId}_chunks.txt`);

    const mergedAudio = path.join(outputDir, `${videoId}_merged.mp3`);

    fs.writeFileSync(
      listFile,
      chunks
        .map(file => `file '${path.resolve(file)}'`)
        .join("\n")
    );

    ffmpeg()

      .input(listFile)

      .inputOptions(["-f", "concat", "-safe", "0"])

      .outputOptions(["-c", "copy"])

      .output(mergedAudio)

      .on("end", () => {

        fs.unlinkSync(listFile);

        resolve(mergedAudio);

      })

      .on("error", reject)

      .run();

  });

};


export const mergeAudioWithVideo = (
  videoPath: string,
  audioPath: string,
  videoId: string,
  quality: string = '1080p',
  speed: number = 1.0
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(outputDir, `${videoId}_translated.mp4`);

    logger.info(`Merging audio with video: ${videoPath}`);

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

    ffmpeg()
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
      .on('start', (cmd) => logger.debug(`FFmpeg merge command: ${cmd}`))
      .on('progress', (progress) => {
        logger.debug(`Video merge progress: ${progress.percent?.toFixed(1)}%`);
      })
      .on('end', () => {
        logger.info(`Video merged successfully: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        logger.error('Video merge failed:', err);
        reject(new Error(`Video merge failed: ${err.message}`));
      })
      .run();
  });
};

export const getVideoInfo = (videoPath: string): Promise<VideoInfo> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
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

export const cleanupFiles = (filePaths: string[]): void => {
  filePaths.forEach(fp => {
    if (fp && fs.existsSync(fp)) {
      try {
        fs.unlinkSync(fp);
        logger.debug(`Cleaned up file: ${fp}`);
      } catch (err) {
        logger.warn(`Failed to clean up file: ${fp}`, err);
      }
    }
  });
};
