import fs from "fs";
import path from "path";
const gTTS = require("gtts");

import { logger } from "../utils/logger";
import { mergeAudioChunks } from "./ffmpeg.service";
import { LANGUAGES } from "../config/language";

// "English" / "en" / "zh-CN" -> gTTS language code
const toGttsCode = (lang: string): string => {
    const q = (lang || "en").trim().toLowerCase();
    const hit = LANGUAGES.find(l => l.code.toLowerCase() === q || l.name.toLowerCase() === q);
    return hit ? hit.code : "en";
};

function splitTextIntoChunks(
    text: string,
    maxLength: number = 2500
): string[] {

    const chunks: string[] = [];

    let current = "";

    const sentences = text.split(/[.!?]\s+/);

    for (const sentence of sentences) {

        if ((current + sentence).length > maxLength) {

            if (current.trim()) chunks.push(current.trim());

            current = sentence + ". ";

        } else {

            current += sentence + ". ";

        }

    }

    if (current.trim()) {
        chunks.push(current.trim());
    }

    return chunks;

}
export const generateSpeech = async (
    text: string,
    language: string = "en",
    videoId: string
): Promise<string> => {

    const outputDir = process.env.OUTPUT_DIR || "./outputs";

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const chunks = splitTextIntoChunks(text).filter(c => c.trim().length > 0);
    if (chunks.length === 0) throw new Error("No text to convert to speech");
    const langCode = toGttsCode(language);

    logger.info(`Generating ${chunks.length} speech chunks`);

    const audioFiles: string[] = [];

    for (let i = 0; i < chunks.length; i++) {

        const output = path.join(
            outputDir,
            `${videoId}_speech_${i}.mp3`
        );

        logger.info(`Generating speech chunk ${i + 1}/${chunks.length}`);

        await new Promise<void>((resolve, reject) => {

            const speech = new gTTS(chunks[i], langCode);

            speech.save(output, (err: any) => {

                if (err) reject(err);

                else resolve();

            });

        });

        audioFiles.push(output);

    }

    return await mergeAudioChunks(audioFiles, videoId);

}; 