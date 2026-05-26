const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

/**
 * @module AdminRoutes
 * @description Administrative management endpoints for campus marketplace moderation.
 * @security JWT Authentication (authMiddleware)
 * @security Role Authorization (adminMiddleware)
 */
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * @route GET /api/admin/stats
 * @desc Retrieve dashboard administrative telemetry (user count, active rentals, total volume)
 */
router.get('/stats', adminController.getStats);

/**
 * @route GET /api/admin/users
 * @desc Get lists of all registered university campus profiles
 */
router.get('/users', adminController.getAllUsers);

/**
 * @route GET /api/admin/items
 * @desc Retrieve list of all uploaded gear items across campus
 */
router.get('/items', adminController.getAllItems);

/**
 * @route DELETE /api/admin/items/:id
 * @desc Force administrative deletion of an item listing (policy enforcement violation)
 */
router.delete('/items/:id', adminController.deleteItem);

/**
 * @route PATCH /api/admin/items/:id/approve
 * @desc Admin review override to manually approve a flagged listing
 */
router.patch('/items/:id/approve', adminController.approveItem);

/**
 * @route PATCH /api/admin/users/:id/toggle-admin
 * @desc Promote/demote administrative permissions for a student profile
 */
router.patch('/users/:id/toggle-admin', adminController.toggleAdmin);

/**
 * @route GET /api/admin/unverified-users
 * @desc Fetch accounts pending student ID validation card approval
 */
router.get('/unverified-users', adminController.getUnverifiedUsers);

/**
 * @route PUT /api/admin/verify-user/:id
 * @desc Admin validation approval of a uploaded Student ID Card
 */
router.put('/verify-user/:id', adminController.verifyUser);

module.exports = router;
