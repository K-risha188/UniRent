const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:itemId', reviewController.getItemReviews);
router.post('/', authMiddleware, reviewController.createReview);

module.exports = router;
