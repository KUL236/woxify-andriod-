"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcribeAudio = transcribeAudio;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
const API_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
async function transcribeAudio(audioPath) {
    const form = new form_data_1.default();
    form.append("file", fs_1.default.createReadStream(audioPath));
    form.append("model", "whisper-large-v3");
    form.append("response_format", "verbose_json");
    const response = await axios_1.default.post(API_URL, form, {
        headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            ...form.getHeaders(),
        },
        maxBodyLength: Infinity,
    });
    return {
        transcript: response.data.text,
        language: response.data.language,
    };
}
//# sourceMappingURL=whisper.service.js.map