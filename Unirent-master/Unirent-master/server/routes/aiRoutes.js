const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');

// Route for getting AI pricing and description recommendations
router.post('/recommendation', auth, aiController.getRecommendation);

// Route for interactive AI Support Assistant Chatbot
router.post('/chat', auth, aiController.chatWithAssistant);

module.exports = router;
