import { Queue, Worker, QueueEvents } from 'bullmq';
import { logger } from '../utils/logger';
import { processVideo } from '../services/pipeline.service';

const connection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  tls: {},
};

export const videoQueue = new Queue('video-processing', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const addVideoJob = async (videoId: string): Promise<void> => {
  try {
    await Promise.race([
      videoQueue.add(
        'process-video',
        { videoId },
        {
          jobId: videoId,
          priority: 1,
        }
      ),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis timeout")), 2000)
      ),
    ]);

    logger.info(`Video job added to queue: ${videoId}`);
  } catch (err) {
    logger.error("Queue unavailable:", err);
    throw err;
  }
};

export const createWorker = (): Worker => {
  const worker = new Worker(
    'video-processing',
    async (job) => {
      const { videoId } = job.data;
      logger.info(`Processing job ${job.id} for video: ${videoId}`);
      await processVideo(videoId);
    },
    {
      connection,
      concurrency: 2,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`✅ Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`❌ Job ${job?.id} failed:`, err.message);
  });

  worker.on('progress', (job, progress) => {
    logger.info(`Job ${job.id} progress: ${progress}%`);
  });

  return worker;
};

export const queueEvents = new QueueEvents('video-processing', { connection });
