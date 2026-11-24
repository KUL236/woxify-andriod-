"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSpeech = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const gTTS = require("gtts");
const logger_1 = require("../utils/logger");
const ffmpeg_service_1 = require("./ffmpeg.service");
const language_1 = require("../config/language");
// "English" / "en" / "zh-CN" -> gTTS language code
const toGttsCode = (lang) => {
    const q = (lang || "en").trim().toLowerCase();
    const hit = language_1.LANGUAGES.find(l => l.code.toLowerCase() === q || l.name.toLowerCase() === q);
    return hit ? hit.code : "en";
};
function splitTextIntoChunks(text, maxLength = 2500) {
    const chunks = [];
    let current = "";
    const sentences = text.split(/[.!?]\s+/);
    for (const sentence of sentences) {
        if ((current + sentence).length > maxLength) {
            if (current.trim())
                chunks.push(current.trim());
            current = sentence + ". ";
        }
        else {
            current += sentence + ". ";
        }
    }
    if (current.trim()) {
        chunks.push(current.trim());
    }
    return chunks;
}
const generateSpeech = async (text, language = "en", videoId) => {
    const outputDir = process.env.OUTPUT_DIR || "./outputs";
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    }
    const chunks = splitTextIntoChunks(text).filter(c => c.trim().length > 0);
    if (chunks.length === 0)
        throw new Error("No text to convert to speech");
    const langCode = toGttsCode(language);
    logger_1.logger.info(`Generating ${chunks.length} speech chunks`);
    const audioFiles = [];
    for (let i = 0; i < chunks.length; i++) {
        const output = path_1.default.join(outputDir, `${videoId}_speech_${i}.mp3`);
        logger_1.logger.info(`Generating speech chunk ${i + 1}/${chunks.length}`);
        await new Promise((resolve, reject) => {
            const speech = new gTTS(chunks[i], langCode);
            speech.save(output, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
        audioFiles.push(output);
    }
    return await (0, ffmpeg_service_1.mergeAudioChunks)(audioFiles, videoId);
};
exports.generateSpeech = generateSpeech;
//# sourceMappingURL=tts.service.js.map