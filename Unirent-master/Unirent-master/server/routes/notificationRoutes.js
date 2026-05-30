const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const auth = require('../middleware/authMiddleware');

/**
 * @module NotificationRoutes
 * @description Coordinates real-time campus telemetry (system warnings, rental bookings, approvals, and return requests).
 * @security JWT Authentication (auth middleware)
 */

/**
 * @route GET /api/notifications
 * @desc Get all pending notifications for the logged-in student user
 */
router.get('/', auth, getNotifications);

/**
 * @route PATCH /api/notifications/read-all
 * @desc Mark all unread notifications as read simultaneously
 */
router.patch('/read-all', auth, markAllAsRead);

/**
 * @route PATCH /api/notifications/:id/read
 * @desc Mark a specific notification message as read
 */
router.patch('/:id/read', auth, markAsRead);

module.exports = router;
