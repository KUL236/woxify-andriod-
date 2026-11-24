"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateText = exports.transcribeAudio = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../utils/logger");
const GROQ_API_URL = 'https://api.groq.com/openai/v1';
function splitTextIntoChunks(text, maxLength = 2500) {
    const chunks = [];
    let currentChunk = "";
    const paragraphs = text.split("\n");
    for (const paragraph of paragraphs) {
        if ((currentChunk + paragraph).length > maxLength) {
            if (currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
            }
            currentChunk = paragraph;
        }
        else {
            currentChunk += "\n" + paragraph;
        }
    }
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    return chunks;
}
const transcribeAudio = async (audioPath) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey)
        throw new Error('GROQ_API_KEY not configured');
    logger_1.logger.info(`Transcribing audio: ${audioPath}`);
    const formData = new form_data_1.default();
    formData.append('file', fs_1.default.createReadStream(audioPath));
    formData.append('model', 'whisper-large-v3');
    if (process.env.AUTO_DETECT !== "true") {
        formData.append("language", "hi");
    }
    formData.append('response_format', 'text');
    try {
        let response;
        for (let retry = 1; retry <= 3; retry++) {
            try {
                response = await axios_1.default.post(`${GROQ_API_URL}/audio/transcriptions`, formData, {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        ...formData.getHeaders(),
                    },
                    maxBodyLength: Infinity,
                    timeout: 120000,
                });
                break;
            }
            catch (err) {
                logger_1.logger.warn(`Retry ${retry}/3`);
                if (retry === 3)
                    throw err;
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        const transcript = typeof response?.data === 'string'
            ? response.data.trim()
            : response.data?.text?.trim() || '';
        if (!transcript)
            throw new Error('Empty transcription returned');
        logger_1.logger.info(`Transcription successful, length: ${transcript.length} chars`);
        return transcript;
    }
    catch (error) {
        const message = error.response?.data?.error?.message || error.message;
        logger_1.logger.error('Transcription failed:', message);
        throw new Error(`Transcription failed: ${message}`);
    }
};
exports.transcribeAudio = transcribeAudio;
const translateText = async (text, sourceLanguage = "Auto", targetLanguage = "English") => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey)
        throw new Error('GROQ_API_KEY not configured');
    logger_1.logger.info(`Translating text, length: ${text.length} chars`);
    const chunks = splitTextIntoChunks(text);
    logger_1.logger.info(`Translation split into ${chunks.length} chunks`);
    const systemPrompt = `You are a professional translator specializing in ${sourceLanguage} to ${targetLanguage} translation. 
Your translations should:
- Be natural and fluent in ${targetLanguage}
- Preserve the original meaning, tone, and emotion
- Maintain the speaker's style and personality
- Be suitable for video dubbing (natural speech patterns)
- Only output the translated text, nothing else`;
    const userPrompt = `Translate the following text to ${targetLanguage} while preserving meaning and emotion. Output ONLY the translation, no explanations or notes:

${text}`;
    try {
        const translatedChunks = [];
        for (let i = 0; i < chunks.length; i++) {
            logger_1.logger.info(`Translating chunk ${i + 1}/${chunks.length}`);
            const userPrompt = `Translate the following text to ${targetLanguage} while preserving meaning and emotion.

Only return the translated text.

${chunks[i]}`;
            const response = await axios_1.default.post(`${GROQ_API_URL}/chat/completions`, {
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                    {
                        role: "user",
                        content: userPrompt,
                    },
                ],
                temperature: 0.3,
                max_tokens: 4096,
            }, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                timeout: 60000,
            });
            const translation = response.data.choices?.[0]?.message?.content?.trim();
            if (!translation) {
                throw new Error(`Translation failed for chunk ${i + 1}`);
            }
            translatedChunks.push(translation);
        }
        logger_1.logger.info(`Translation complete (${translatedChunks.length} chunks)`);
        return translatedChunks.join("\n");
    }
    catch (error) {
        const message = error.response?.data?.error?.message || error.message;
        logger_1.logger.error('Translation failed:', message);
        throw new Error(`Translation failed: ${message}`);
    }
};
exports.translateText = translateText;
//# sourceMappingURL=groq.service.js.map