import { pool } from '../config/database';

export type VideoStatus =
  | 'uploaded'
  | 'extracting_audio'
  | 'transcribing'
  | 'translating'
  | 'generating_speech'
  | 'merging'
  | 'completed'
  | 'failed';

export interface ProcessingStep {
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message?: string;
  timestamp?: string;
  duration?: number;
}

export interface Video {
  id: string;
  user_id: string;
  original_filename: string;
  original_video: string;
  translated_video?: string;
  transcript?: string;
  translated_text?: string;
  source_language: string;
  target_language: string;
  voice?: string;
  speed?: number;
  quality?: string;
  status: VideoStatus;
  error_message?: string;
  duration?: number;
  file_size?: number;
  processing_steps: ProcessingStep[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateVideoDto {
  user_id: string;
  original_filename: string;
  original_video: string;
  file_size?: number;
  source_language?: string;
  target_language?: string;
  voice?: string;
  speed?: number;
  quality?: string;
}

export class VideoModel {
  static async create(data: CreateVideoDto): Promise<Video> {
    const result = await pool.query(
      `INSERT INTO videos (
    user_id,
    original_filename,
    original_video,
    file_size,
    source_language,
    target_language,
    voice,
    speed,
    quality
  )
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
  RETURNING *`,
      [
        data.user_id,
        data.original_filename,
        data.original_video,
        data.file_size || 0,
        data.source_language || "hi",
        data.target_language || "en",
        data.voice || "male",
        data.speed || 1,
        data.quality || "1080p",
      ]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<Video | null> {
    const result = await pool.query('SELECT * FROM videos WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByIdAndUser(id: string, userId: string): Promise<Video | null> {
    const result = await pool.query(
      'SELECT * FROM videos WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0] || null;
  }

  static async findByUser(userId: string, limit = 20, offset = 0): Promise<Video[]> {
    const result = await pool.query(
      'SELECT * FROM videos WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async updateStatus(
    id: string,
    status: VideoStatus,
    extra: Partial<Video> = {}
  ): Promise<Video | null> {
    const fields: string[] = ['status = $2'];
    const values: any[] = [id, status];
    let idx = 3;

    for (const [key, val] of Object.entries(extra)) {
      if (val !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(typeof val === 'object' ? JSON.stringify(val) : val);
        idx++;
      }
    }

    const result = await pool.query(
      `UPDATE videos SET ${fields.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async addProcessingStep(id: string, step: ProcessingStep): Promise<void> {
    await pool.query(
      `UPDATE videos SET processing_steps = processing_steps || $2::jsonb WHERE id = $1`,
      [id, JSON.stringify([step])]
    );
  }

  static async countByUser(userId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM videos WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }
  static async delete(id: string): Promise<void> {
    await pool.query(
      "DELETE FROM videos WHERE id = $1",
      [id]
    );
  }
}
