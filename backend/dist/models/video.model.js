"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoModel = void 0;
const database_1 = require("../config/database");
class VideoModel {
    static async create(data) {
        const result = await database_1.pool.query(`INSERT INTO videos (
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
  RETURNING *`, [
            data.user_id,
            data.original_filename,
            data.original_video,
            data.file_size || 0,
            data.source_language || "hi",
            data.target_language || "en",
            data.voice || "male",
            data.speed || 1,
            data.quality || "1080p",
        ]);
        return result.rows[0];
    }
    static async findById(id) {
        const result = await database_1.pool.query('SELECT * FROM videos WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    static async findByIdAndUser(id, userId) {
        const result = await database_1.pool.query('SELECT * FROM videos WHERE id = $1 AND user_id = $2', [id, userId]);
        return result.rows[0] || null;
    }
    static async findByUser(userId, limit = 20, offset = 0) {
        const result = await database_1.pool.query('SELECT * FROM videos WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [userId, limit, offset]);
        return result.rows;
    }
    static async updateStatus(id, status, extra = {}) {
        const fields = ['status = $2'];
        const values = [id, status];
        let idx = 3;
        for (const [key, val] of Object.entries(extra)) {
            if (val !== undefined) {
                fields.push(`${key} = $${idx}`);
                values.push(typeof val === 'object' ? JSON.stringify(val) : val);
                idx++;
            }
        }
        const result = await database_1.pool.query(`UPDATE videos SET ${fields.join(', ')} WHERE id = $1 RETURNING *`, values);
        return result.rows[0] || null;
    }
    static async addProcessingStep(id, step) {
        await database_1.pool.query(`UPDATE videos SET processing_steps = processing_steps || $2::jsonb WHERE id = $1`, [id, JSON.stringify([step])]);
    }
    static async countByUser(userId) {
        const result = await database_1.pool.query('SELECT COUNT(*) as count FROM videos WHERE user_id = $1', [userId]);
        return parseInt(result.rows[0].count);
    }
    static async delete(id) {
        await database_1.pool.query("DELETE FROM videos WHERE id = $1", [id]);
    }
}
exports.VideoModel = VideoModel;
//# sourceMappingURL=video.model.js.map