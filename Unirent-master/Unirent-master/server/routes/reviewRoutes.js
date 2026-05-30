const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @module ReviewRoutes
 * @description Trust & validation loops allowing students to rate items post-transaction.
 */

/**
 * @route GET /api/reviews/:itemId
 * @desc Public route to fetch all reviews and condition reports for a specific gear item
 */
router.get('/:itemId', reviewController.getItemReviews);

/**
 * @route POST /api/reviews
 * @desc Submit a detailed feedback rating and review on a completed rental booking
 * @security JWT Authentication (authMiddleware)
 */
router.post('/', authMiddleware, reviewController.createReview);

module.exports = router;
