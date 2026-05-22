const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');

// Route for getting AI pricing and description recommendations
router.post('/recommendation', auth, aiController.getRecommendation);

module.exports = router;
