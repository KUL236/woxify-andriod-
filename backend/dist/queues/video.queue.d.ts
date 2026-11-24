import { Queue, Worker, QueueEvents } from 'bullmq';
export declare const videoQueue: Queue<any, any, string, any, any, string>;
export declare const addVideoJob: (videoId: string) => Promise<void>;
export declare const createWorker: () => Worker;
export declare const queueEvents: QueueEvents;
//# sourceMappingURL=video.queue.d.ts.map