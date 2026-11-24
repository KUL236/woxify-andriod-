import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const uploadVideo: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getVideoStatus: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getHistory: (req: AuthRequest, res: Response) => Promise<void>;
export declare const downloadVideo: (req: AuthRequest, res: Response) => Promise<void>;
export declare const retryVideo: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteVideo: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=video.controller.d.ts.map