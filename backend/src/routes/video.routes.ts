import { Router } from 'express';
import {
  uploadVideo,
  getVideoStatus,
  getHistory,
  downloadVideo,
  retryVideo,
  deleteVideo,
} from '../controllers/video.controller';

import { authenticateToken } from '../middleware/auth.middleware';
import { videoUpload } from '../middleware/upload.middleware';

export const videoRoutes = Router();

/* Public Download Route */
videoRoutes.get('/download/:id', downloadVideo);

/* Protected Routes */
videoRoutes.post(
  '/upload',
  authenticateToken,
  videoUpload.single('video'),
  uploadVideo
);

videoRoutes.get(
  '/status/:id',
  authenticateToken,
  getVideoStatus
);

videoRoutes.get(
  '/history',
  authenticateToken,
  getHistory
);

videoRoutes.post(
  '/retry/:id',
  authenticateToken,
  retryVideo
);
videoRoutes.delete(
  '/:id',
  authenticateToken,
  deleteVideo
);