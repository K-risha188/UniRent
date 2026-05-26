const express = require('express');
const router = express.Router();
const { createRequest, getRequests, fulfillRequest } = require('../controllers/requestController');
const auth = require('../middleware/authMiddleware');

/**
 * @module RequestRoutes
 * @description Coordinates the university wishlist board where students request unavailable items.
 * @security JWT Authentication (auth middleware)
 */

/**
 * @route GET /api/requests
 * @desc Get all open community gear requests posted by campus students
 */
router.get('/', auth, getRequests);

/**
 * @route POST /api/requests
 * @desc Publish a new item request onto the campus wishlist board
 */
router.post('/', auth, createRequest);

/**
 * @route PATCH /api/requests/:id/fulfill
 * @desc Mark a community request as fulfilled by linking it to an active rental
 */
router.patch('/:id/fulfill', auth, fulfillRequest);

module.exports = router;
