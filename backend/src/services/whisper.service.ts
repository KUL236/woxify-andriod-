import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const API_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

export interface WhisperResult {
    transcript: string;
    language: string;
}

export async function transcribeAudio(
    audioPath: string
): Promise<WhisperResult> {

    const form = new FormData();

    form.append("file", fs.createReadStream(audioPath));

    form.append("model", "whisper-large-v3");

    form.append("response_format", "verbose_json");

    const response = await axios.post(API_URL, form, {
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