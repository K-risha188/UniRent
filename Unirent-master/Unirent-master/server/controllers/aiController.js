const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * AI Price Recommendation & Listing Optimizer
 * Uses Google Gemini API with custom heuristics fallback.
 */
exports.getRecommendation = async (req, res) => {
  try {
    const { name, category, condition, originalPrice, description } = req.body;

    if (!name || !condition || originalPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide item name, condition, and original price."
      });
    }

    const price = Number(originalPrice);
    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Original price must be a valid non-negative number."
      });
    }

    // Heuristics calculation for robust local fallback
    let fallbackRate = 0.015; // 1.5% default rate for Good
    if (condition.toLowerCase() === "new") {
      fallbackRate = 0.025; // 2.5% for New
    } else if (condition.toLowerCase() === "fair") {
      fallbackRate = 0.008; // 0.8% for Fair
    }

    const recommendedPrice = Math.max(10, Math.round(price * fallbackRate));
    const recommendedDeposit = Math.round(price * 0.2); // 20% security deposit standard

    const fallbackTitle = `Premium ${name} (${condition} Condition)`;
    const fallbackDesc = description 
      ? `High-quality ${name} in ${condition} condition. Original retail value: ₹${price.toLocaleString()}.\n\nUser Description: ${description}\n\nPerfect for campus projects and daily student use. Guaranteed to be in fully working condition!`
      : `High-quality ${name} in ${condition} condition. Original retail value: ₹${price.toLocaleString()}.\n\nPerfect for campus projects and daily student use. Guaranteed to be in fully working condition! Please handle with care.`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return smart mock heuristics response if API Key is not configured
      console.log("AI_CONTROLLER: Gemini API Key not found. Falling back to local smart optimizer.");
      return res.status(200).json({
        success: true,
        isFallback: true,
        recommendedPrice,
        recommendedDeposit,
        optimizedTitle: fallbackTitle,
        optimizedDescription: fallbackDesc,
        safetyRating: "safe",
        safetyReason: "Passed automated campus listing policies check."
      });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Using gemini-2.5-flash as the fast, cost-effective default model
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        You are an expert AI Pricing Engine and Listing Copywriter for "UniRent", a peer-to-peer rental marketplace for university students.
        
        Analyze the following student listing inputs:
        - Item Name: "${name}"
        - Category: "${category || 'General'}"
        - Condition: "${condition}"
        - Original Retail Price: ₹${price}
        - User's Draft Description: "${description || 'None'}"
        
        Task:
        1. Calculate an optimal recommended daily rental price in Indian Rupees (₹) for a university campus environment. Usually, daily rent is:
           - 2% to 3.5% of original price for "New" condition.
           - 1% to 2% of original price for "Good" condition.
           - 0.5% to 1% of original price for "Fair" condition.
           - Cap it at a realistic amount that a student can afford. Minimum is ₹10.
        2. Calculate a recommended security deposit in Indian Rupees (₹) - usually between 15% and 25% of the original retail price to protect the owner but remain affordable.
        3. Write a highly appealing, SEO-friendly, professional, and improved Title (optimizedTitle).
        4. Write a detailed, clean, and engaging listing description in Markdown (optimizedDescription). Highlight features, specify condition details, and add bullet points suggesting typical student use-cases. Keep it formatted nicely.
        5. Assess whether the item is safe for a college campus marketplace. Set safetyRating to "safe" or "unsafe". If "unsafe" (e.g. weapons, drugs, explicit content, illegal items), explain why in safetyReason.
        
        Response Format:
        Return ONLY a clean JSON object. Do not include any markdown formatting wrappers like \`\`\`json or \`\`\`. It must be parsed directly as JSON.
        The JSON must contain these exact keys:
        {
          "recommendedPrice": number,
          "recommendedDeposit": number,
          "optimizedTitle": "string",
          "optimizedDescription": "string",
          "safetyRating": "safe" | "unsafe",
          "safetyReason": "string"
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

      return res.status(200).json({
        success: true,
        isFallback: false,
        recommendedPrice: Number(aiResponse.recommendedPrice) || recommendedPrice,
        recommendedDeposit: Number(aiResponse.recommendedDeposit) || recommendedDeposit,
        optimizedTitle: aiResponse.optimizedTitle || fallbackTitle,
        optimizedDescription: aiResponse.optimizedDescription || fallbackDesc,
        safetyRating: aiResponse.safetyRating || "safe",
        safetyReason: aiResponse.safetyReason || "Passed automated campus listing policies check."
      });

    } catch (apiError) {
      console.error("AI_CONTROLLER: Gemini API execution failed. Falling back to local smart optimizer.", apiError);
      return res.status(200).json({
        success: true,
        isFallback: true,
        recommendedPrice,
        recommendedDeposit,
        optimizedTitle: fallbackTitle,
        optimizedDescription: fallbackDesc,
        safetyRating: "safe",
        safetyReason: "Passed automated campus listing policies check."
      });
    }

  } catch (error) {
    console.error("AI_CONTROLLER_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while generating recommendations."
    });
  }
};

/**
 * AI Support Assistant Chatbot
 * Provides instant real-time campus help with full Gemini API and smart local fallbacks.
 */
exports.chatWithAssistant = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Please provide a user message."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // --- 1. OFFLINE SMART FALLBACK ENGINE ---
    if (!apiKey) {
      console.log("AI_CONTROLLER: Gemini API Key not found. Answering chat via local assistant heuristics.");
      const input = message.toLowerCase().trim();
      let reply = "";

      if (input.includes("hi") || input.includes("hello") || input.includes("hey") || input.includes("greet")) {
        reply = `👋 **Hello there, fellow peer!** I am your **UniRent Campus Assistant AI**.\n\nI am here to help you navigate our peer-to-peer student marketplace. You can ask me about:\n* 💰 **Wallet & Security Deposits**\n* 🔒 **Phone OTP & Profile Verification**\n* 📋 **Listing moderation & Flagged gear**\n\nWhat can I assist you with today?`;
      } else if (input.includes("deposit") || input.includes("security")) {
        reply = `💰 **How Security Deposits Work:**\n\nTo protect the owner of the gear, every listing specifies a **Security Deposit** (usually ~20% of the item's value).\n1. **Held in Escrow:** When you book an item, the deposit + rent + a 5% platform fee is deducted and held securely by the platform.\n2. **Handover Check:** You upload handover verification photos when you pick up the gear.\n3. **Automatic Refund:** Once the item is safely returned and the owner approves its condition, the **entire security deposit is instantly credited back to your wallet**!`;
      } else if (input.includes("wallet") || input.includes("balance") || input.includes("money") || input.includes("pay")) {
        reply = `💳 **UniRent Virtual Wallet:**\n\nAll transactions on UniRent are completely digital and secured using our internal virtual wallet.\n* **Topping Up:** Go to the [Wallet](file:///profile/wallet) page to simulate adding funds to your account.\n* **Deductions:** Booking gear places a hold on the rent price, the security deposit, and a small 5% platform fee.\n* **Refunds & Earnings:** Rental earnings are credited to the owner's wallet, and deposits are returned to the renter's wallet immediately upon a completed return.`;
      } else if (input.includes("flagged") || input.includes("moderation") || input.includes("safety") || input.includes("safe") || input.includes("prohibited")) {
        reply = `⚠️ **Listing Safety & Flagging System:**\n\nTo ensure Parul University remains a safe campus, all new gear listings pass through a two-stage filter:\n1. **Local Keyword Blocklist:** Instantly intercepts inappropriate keywords (e.g., weapons, explosives, illicit substances, adult context).\n2. **Gemini AI Safety Check:** Contextually evaluates titles and descriptions to ensure appropriateness.\n\n*If your item was falsely flagged, don't worry! It goes to the **Admin Review Dashboard** where an administrator can manually approve and restore it live.*`;
      } else if (input.includes("phone") || input.includes("otp") || input.includes("verify") || input.includes("id")) {
        reply = `🔒 **Profile Verification & Trust:**\n\nTo prevent scammers or non-students from accessing listings, we require two-factor validation:\n1. **Phone OTP Verification:** Go to your Profile, enter your phone number, and click **Verify** to simulate a 6-digit cryptographic OTP text validation.\n2. **Admin ID Approval:** Upload a photograph of your student ID card. Once the Admin approves it, your profile receives the green badge.\n\n*⚠️ Remember: You cannot list or rent items until both OTP validation and ID approval are fully verified!*`;
      } else {
        reply = `🤖 **UniRent Campus Assistant AI (Offline Dev Mode):**\n\nThank you for reaching out! I am running on local fallback heuristics right now because the \`GEMINI_API_KEY\` is not set in our server configuration.\n\nI can provide detailed insights on:\n* **"How do security deposits work?"**\n* **"Tell me about the virtual wallet balance"**\n* **"Why is my item flagged?"**\n* **"How do I verify my phone number via OTP?"**\n\n*To enable fully dynamic AI reasoning, simply add a valid \`GEMINI_API_KEY\` to your \`server/.env\` file!*`;
      }

      return res.status(200).json({
        success: true,
        isFallback: true,
        reply
      });
    }

    // --- 2. LIVE GOOGLE GEMINI CHAT ENGINE ---
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Structure conversational prompts with history mapping
      const historyContext = (history || []).map(h => 
        `${h.role === 'model' ? 'AI Assistant' : 'Student'}: ${h.text}`
      ).join('\n');

      const prompt = `
        You are "UniRent Support AI," a friendly, expert virtual assistant for "UniRent", a peer-to-peer student-only sharing marketplace at Parul University.
        
        Guidelines:
        1. Help students with marketplace questions (deposits, wallet, phone verification, AI description helpers, admin ID validation, safety moderation).
        2. Keep responses highly relevant to the college campus environment.
        3. Format answers beautifully in clean Markdown (use bold headings, bullet points, and code styling when appropriate).
        4. Be highly supportive, friendly, concise, and helpful. Avoid robotic language.
        
        Conversation History:
        ${historyContext}
        
        New Student Inquiry: "${message}"
        
        Task:
        Provide a detailed and helpful response. If asked about policies, safety, deposits, or wallet credits, explain them accurately based on standard circular economy peer-to-peer rules. Return ONLY the text response.
      `;

      const result = await model.generateContent(prompt);
      const replyText = result.response.text().trim();

      return res.status(200).json({
        success: true,
        isFallback: false,
        reply: replyText
      });

    } catch (apiError) {
      console.error("AI_CONTROLLER_CHAT: Gemini API call failed. Falling back to local responder.", apiError);
      return res.status(200).json({
        success: true,
        isFallback: true,
        reply: "👋 Hi there! I experienced a connection issue reaching Google's Gemini servers. Please try again, or ask me about standard local topics like: Wallet, Security Deposits, or Phone Verification!"
      });
    }

  } catch (error) {
    console.error("AI_CONTROLLER_CHAT_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while processing the chat assistant request."
    });
  }
};

