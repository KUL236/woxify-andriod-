"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const video_queue_1 = require("./video.queue");
const logger_1 = require("../utils/logger");
logger_1.logger.info('🚀 Starting video processing worker...');
const worker = (0, video_queue_1.createWorker)();
process.on('SIGTERM', async () => {
    logger_1.logger.info('Worker shutting down...');
    await worker.close();
    process.exit(0);
});
//# sourceMappingURL=worker.js.map