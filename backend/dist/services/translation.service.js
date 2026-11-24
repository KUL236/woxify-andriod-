"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateText = translateText;
const axios_1 = __importDefault(require("axios"));
const translate_1 = __importDefault(require("translate"));
const URL = "https://api.groq.com/openai/v1/chat/completions";
// Google Translate configuration
translate_1.default.engine = "google";
async function translateText(text, source, target) {
    try {
        // Use Groq if API key is available
        if (process.env.GROQ_API_KEY) {
            const prompt = `
Translate the following text.

Source Language:
${source}

Target Language:
${target}

Only return the translated text.

${text}
`;
            const response = await axios_1.default.post(URL, {
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.2,
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data.choices[0].message.content.trim();
        }
        throw new Error("GROQ_API_KEY not found");
    }
    catch (error) {
        console.log("Groq translation failed. Switching to Google Translate...");
        try {
            console.log("Source Language:", source);
            console.log("Target Language:", target);
            const translated = await (0, translate_1.default)(text, {
                from: source,
                to: target,
            });
            return translated;
        }
        catch (err) {
            console.error("Google Translate also failed:", err);
            throw new Error("Translation failed using both Groq and Google Translate.");
        }
    }
}
//# sourceMappingURL=translation.service.js.map