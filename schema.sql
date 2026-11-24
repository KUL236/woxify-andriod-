-- =====================================================
-- AI Video Translator — PostgreSQL Schema
-- Run: psql -U postgres -d ai_video_translator -f schema.sql
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────
-- USERS TABLE
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255)  NOT NULL,
  email         VARCHAR(255)  UNIQUE NOT NULL,
  password      VARCHAR(255)  NOT NULL,          -- bcrypt hash
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ─────────────────────────────────────────────────────
-- VIDEOS TABLE
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS videos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- File info
  original_filename   VARCHAR(500)  NOT NULL,
  original_video      VARCHAR(500),               -- path or Cloudinary URL
  translated_video    VARCHAR(500),               -- path or Cloudinary URL

  -- AI processing outputs
  transcript          TEXT,                        -- Groq Whisper output (Hindi)
  translated_text     TEXT,                        -- LLaMA 3.3 translation (English)

  -- Language settings
  source_language     VARCHAR(50)   NOT NULL DEFAULT 'hi',
  target_language     VARCHAR(50)   NOT NULL DEFAULT 'en',

  -- Status
  status              VARCHAR(50)   NOT NULL DEFAULT 'uploaded'
                        CHECK (status IN (
                          'uploaded',
                          'extracting_audio',
                          'transcribing',
                          'translating',
                          'generating_speech',
                          'merging',
                          'completed',
                          'failed'
                        )),
  error_message       TEXT,

  -- Metadata
  duration            FLOAT,                       -- seconds
  file_size           BIGINT,                      -- bytes

  -- Processing audit trail (array of step objects)
  processing_steps    JSONB         NOT NULL DEFAULT '[]'::jsonb,

  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_user_id    ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status     ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- ─────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DO $$ BEGIN
  CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────
-- SAMPLE QUERY: processing_steps JSON structure
-- ─────────────────────────────────────────────────────
-- Each element in processing_steps looks like:
-- {
--   "step": "transcribe",
--   "status": "completed",
--   "message": "Transcribed 842 characters",
--   "timestamp": "2024-01-15T10:23:45.123Z",
--   "duration": 4321
-- }
