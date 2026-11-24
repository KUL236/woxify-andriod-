"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueEvents = exports.createWorker = exports.addVideoJob = exports.videoQueue = void 0;
const bullmq_1 = require("bullmq");
const logger_1 = require("../utils/logger");
const pipeline_service_1 = require("../services/pipeline.service");
const connection = {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls: {},
};
exports.videoQueue = new bullmq_1.Queue('video-processing', {
    connection,
    defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 50,
    },
});
const addVideoJob = async (videoId) => {
    try {
        await Promise.race([
            exports.videoQueue.add('process-video', { videoId }, {
                jobId: videoId,
                priority: 1,
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Redis timeout")), 2000)),
        ]);
        logger_1.logger.info(`Video job added to queue: ${videoId}`);
    }
    catch (err) {
        logger_1.logger.error("Queue unavailable:", err);
        throw err;
    }
};
exports.addVideoJob = addVideoJob;
const createWorker = () => {
    const worker = new bullmq_1.Worker('video-processing', async (job) => {
        const { videoId } = job.data;
        logger_1.logger.info(`Processing job ${job.id} for video: ${videoId}`);
        await (0, pipeline_service_1.processVideo)(videoId);
    }, {
        connection,
        concurrency: 2,
    });
    worker.on('completed', (job) => {
        logger_1.logger.info(`✅ Job ${job.id} completed`);
    });
    worker.on('failed', (job, err) => {
        logger_1.logger.error(`❌ Job ${job?.id} failed:`, err.message);
    });
    worker.on('progress', (job, progress) => {
        logger_1.logger.info(`Job ${job.id} progress: ${progress}%`);
    });
    return worker;
};
exports.createWorker = createWorker;
exports.queueEvents = new bullmq_1.QueueEvents('video-processing', { connection });
//# sourceMappingURL=video.queue.js.map