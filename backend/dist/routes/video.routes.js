"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoRoutes = void 0;
const express_1 = require("express");
const video_controller_1 = require("../controllers/video.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
exports.videoRoutes = (0, express_1.Router)();
/* Public Download Route */
exports.videoRoutes.get('/download/:id', video_controller_1.downloadVideo);
/* Protected Routes */
exports.videoRoutes.post('/upload', auth_middleware_1.authenticateToken, upload_middleware_1.videoUpload.single('video'), video_controller_1.uploadVideo);
exports.videoRoutes.get('/status/:id', auth_middleware_1.authenticateToken, video_controller_1.getVideoStatus);
exports.videoRoutes.get('/history', auth_middleware_1.authenticateToken, video_controller_1.getHistory);
exports.videoRoutes.post('/retry/:id', auth_middleware_1.authenticateToken, video_controller_1.retryVideo);
exports.videoRoutes.delete('/:id', auth_middleware_1.authenticateToken, video_controller_1.deleteVideo);
//# sourceMappingURL=video.routes.js.map