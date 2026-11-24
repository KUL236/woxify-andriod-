import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth.routes';
import { videoRoutes } from './routes/video.routes';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';
import { initDatabase } from './config/database';
import fs from 'fs';

dotenv.config();

const app = express();
app.set('trust proxy', 1); // cloudflare tunnel / reverse proxy ke peeche rate-limit sahi chale
const PORT = process.env.PORT || 5000;

// Ensure upload/output directories exist
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const outputDir = process.env.OUTPUT_DIR || './outputs';
[uploadDir, outputDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS (web frontend + Android/Capacitor app)
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)
  .concat([
    'http://localhost',          // Capacitor Android (androidScheme: http)
    'https://localhost',         // Capacitor Android (androidScheme: https)
    'capacitor://localhost',     // Capacitor iOS
    'ionic://localhost',
  ]);

app.use(cors({
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
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Static file serving for outputs
app.use('/outputs', express.static(path.resolve(outputDir)));
app.use('/uploads', express.static(path.resolve(uploadDir)));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), service: 'AI Video Translator' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/video', videoRoutes);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await initDatabase();
    app.listen(Number(PORT), "0.0.0.0", () => {
      logger.info(`🚀 AI Video Translator Backend running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
