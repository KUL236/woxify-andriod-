"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = exports.initDatabase = exports.pool = void 0;
const pg_1 = require("pg");
const logger_1 = require("../utils/logger");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase') || process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : undefined,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
exports.pool.on('error', (err) => {
    logger_1.logger.error('Unexpected error on idle database client:', err);
});
const initDatabase = async () => {
    const client = await exports.pool.connect();
    try {
        logger_1.logger.info('Connected to PostgreSQL database');
        await (0, exports.runMigrations)(client);
        logger_1.logger.info('Database migrations completed');
    }
    catch (error) {
        logger_1.logger.error('Database initialization failed:', error);
        throw error;
    }
    finally {
        client.release();
    }
};
exports.initDatabase = initDatabase;
const runMigrations = async (client) => {
    const db = client || await exports.pool.connect();
    const release = !client;
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        await db.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        original_filename VARCHAR(500) NOT NULL,
        original_video VARCHAR(500),
        translated_video VARCHAR(500),
        transcript TEXT,
        translated_text TEXT,
        source_language VARCHAR(50) DEFAULT 'hi',
        target_language VARCHAR(50) DEFAULT 'en',
        voice VARCHAR(50) DEFAULT 'male',
        speed FLOAT DEFAULT 1,
        quality VARCHAR(20) DEFAULT '1080p',
        status VARCHAR(50) DEFAULT 'uploaded' CHECK (status IN (
          'uploaded', 'extracting_audio', 'transcribing', 'translating',
          'generating_speech', 'merging', 'completed', 'failed'
        )),
        error_message TEXT,
        duration FLOAT,
        file_size BIGINT,
        processing_steps JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
        await db.query(`
      CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
      CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
      CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
    `);
        await db.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
        await db.query(`
      DO $$ BEGIN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
        await db.query(`
      DO $$ BEGIN
        CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
        logger_1.logger.info('Database schema initialized successfully');
    }
    finally {
        if (release)
            db.release();
    }
};
exports.runMigrations = runMigrations;
exports.default = exports.pool;
//# sourceMappingURL=database.js.map