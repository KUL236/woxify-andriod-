import dotenv from 'dotenv';
dotenv.config();
import { createWorker } from './video.queue';
import { logger } from '../utils/logger';

logger.info('🚀 Starting video processing worker...');
const worker = createWorker();

process.on('SIGTERM', async () => {
  logger.info('Worker shutting down...');
  await worker.close();
  process.exit(0);
});
