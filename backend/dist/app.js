"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = require("./routes/auth.routes");
const video_routes_1 = require("./routes/video.routes");
const error_middleware_1 = require("./middleware/error.middleware");
const logger_1 = require("./utils/logger");
const database_1 = require("./config/database");
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set('trust proxy', 1); // cloudflare tunnel / reverse proxy ke peeche rate-limit sahi chale
const PORT = process.env.PORT || 5000;
// Ensure upload/output directories exist
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const outputDir = process.env.OUTPUT_DIR || './outputs';
[uploadDir, outputDir].forEach(dir => {
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
});
// Security middleware
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// CORS (web frontend + Android/Capacitor app)
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean)
    .concat([
    'http://localhost', // Capacitor Android (androidScheme: http)
    'https://localhost', // Capacitor Android (androidScheme: https)
    'capacitor://localhost', // Capacitor iOS
    'ionic://localhost',
]);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // no-origin = mobile native / curl / same-origin requests
        if (!origin || allowedOrigins.includes(origin) || process.env.CORS_ALLOW_ALL === 'true') {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging
app.use((0, morgan_1.default)('combined', { stream: { write: (msg) => logger_1.logger.info(msg.trim()) } }));
// Static file serving for outputs
app.use('/outputs', express_1.default.static(path_1.default.resolve(outputDir)));
app.use('/uploads', express_1.default.static(path_1.default.resolve(uploadDir)));
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString(), service: 'AI Video Translator' });
});
// Routes
app.use('/api/auth', auth_routes_1.authRoutes);
app.use('/api/video', video_routes_1.videoRoutes);
// Error handling
app.use(error_middleware_1.errorHandler);
// Start server
const startServer = async () => {
    try {
        await (0, database_1.initDatabase)();
        app.listen(Number(PORT), "0.0.0.0", () => {
            logger_1.logger.info(`🚀 AI Video Translator Backend running on port ${PORT}`);
            logger_1.logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=app.js.map