const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');

/**
 * @module AiRoutes
 * @description Google Gemini AI-assisted routing endpoints for pricing analysis, safety validation, and chatbot support.
 * @security JWT Authentication (auth middleware)
 */

/**
 * @route POST /api/ai/recommendation
 * @desc Get AI description polishing, optimal price/day, and safety audit context
 */
router.post('/recommendation', auth, aiController.getRecommendation);

/**
 * @route POST /api/ai/chat
 * @desc Multi-turn interactive campus chatbot support utilizing Gemini 2.5 and offline heuristics
 */
router.post('/chat', auth, aiController.chatWithAssistant);

module.exports = router;
