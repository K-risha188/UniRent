const { GoogleGenerativeAI } = require("@google/generative-ai");

// Comprehensive prohibited keywords list for robust local campus safety filters fallback
const PROHIBITED_KEYWORDS = [
    'gun', 'pistol', 'weapon', 'rifle', 'explosive', 'bomb', 'marijuana', 
    'cocaine', 'heroin', 'weed', 'meth', 'drugs', 'prohibited', 'xxx', 
    'porn', 'nude', 'explicit', 'contraband', 'cannabis', 'ammunition', 
    'hacking tool', 'virus', 'malware', 'knife', 'dagger', 'sword', 
    'ecstasy', 'fentanyl', 'heroin', 'crack', 'ammo', 'firearm'
];

/**
 * Automative AI Content Moderation & Local Blacklist Check
 * @param {string} title 
 * @param {string} description 
 * @param {string} category 
 * @returns {Promise<{ isSafe: boolean, reason: string }>}
 */
exports.checkSafety = async (title, description, category) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const combinedText = `${title || ''} ${description || ''} ${category || ''}`.toLowerCase();

    // 1. Run local keyword scan as primary safeguard and validation fast-path
    for (const word of PROHIBITED_KEYWORDS) {
        const regex = new RegExp(`\\b${word}s?\\b`, 'i');
        if (regex.test(combinedText)) {
            console.log(`SAFETY_MODERATOR: Flagged locally due to prohibited keyword: "${word}"`);
            return {
                isSafe: false,
                reason: `Listing flagged by automated safety filters due to prohibited keyword: "${word}".`
            };
        }
    }

    // 2. If Gemini API key is available, run advanced AI safety evaluation (Vision/Text analysis context)
    if (apiKey) {
        try {
            console.log("SAFETY_MODERATOR: Querying Google Gemini AI for contextual safety check...");
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
            You are an automated safety moderation agent for "UniRent", a university campus student-to-student rental marketplace.
            Analyze the listing details below to ensure it is appropriate, harmless, and safe for a student university environment. 
            Prohibited items include weapons, guns, explosives, illicit drugs, explicit/adult content, illegal items, hacking tools, academic plagiarism tools, and toxic chemicals.
            
            Listing to Analyze:
            - Title: "${title}"
            - Description: "${description}"
            - Category: "${category || 'General'}"
            
            Task:
            Evaluate the content. Determine if the item is "safe" or "unsafe" for college student rentals. If it is "unsafe", explain the reason in detail.
            
            Response Format:
            Return ONLY a clean JSON object. Do not include any markdown formatting wrappers like \`\`\`json or \`\`\`. It must be parsed directly as JSON.
            The JSON must contain these exact keys:
            {
              "isSafe": boolean,
              "reason": "string describing safety violation if unsafe, or 'Passed' if safe"
            }
            `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text().trim();
            
            // Clean up markdown block styling if LLM returned it
            const cleanJsonText = responseText
                .replace(/^```json/i, "")
                .replace(/^```/, "")
                .replace(/```$/, "")
                .trim();

            const aiResponse = JSON.parse(cleanJsonText);
            console.log("SAFETY_MODERATOR: Gemini AI Safety evaluation response:", aiResponse);

            return {
                isSafe: aiResponse.isSafe === true || aiResponse.isSafe === 'true',
                reason: aiResponse.reason || "Passed automated campus listing policies check."
            };

        } catch (apiError) {
            console.error("SAFETY_MODERATOR_WARNING: Gemini safety API call failed. Defaulting to local keyword scan results (Clean).", apiError);
        }
    } else {
        console.log("SAFETY_MODERATOR: No Gemini API Key found. Completed safety review via local keyword scan (Clean).");
    }

    // Default response if local check passed and Gemini was unavailable or skipped
    return {
        isSafe: true,
        reason: "Passed automated campus listing policies check."
    };
};
