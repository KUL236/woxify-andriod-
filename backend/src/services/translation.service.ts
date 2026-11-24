import axios from "axios";
import translate from "translate";

const URL = "https://api.groq.com/openai/v1/chat/completions";

// Google Translate configuration
translate.engine = "google";

export async function translateText(
    text: string,
    source: string,
    target: string
): Promise<string> {
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

            const response = await axios.post(
                URL,
                {
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    temperature: 0.2,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return response.data.choices[0].message.content.trim();
        }

        throw new Error("GROQ_API_KEY not found");
    } catch (error) {
        console.log("Groq translation failed. Switching to Google Translate...");

        try {
            console.log("Source Language:", source);
            console.log("Target Language:", target);

            const translated = await translate(text, {
                from: source,
                to: target,
            });

            return translated as string;
        } catch (err) {
            console.error("Google Translate also failed:", err);
            throw new Error(
                "Translation failed using both Groq and Google Translate."
            );
        }
    }
}