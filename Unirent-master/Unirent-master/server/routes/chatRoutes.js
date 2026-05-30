const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @module ChatRoutes
 * @description Direct peer-to-peer real-time communication routing between student renters and gear owners.
 * @security JWT Authentication (authMiddleware)
 */

/**
 * @route GET /api/chat
 * @desc Get all open chat threads for the logged-in student user
 */
router.get('/', authMiddleware, chatController.getChats);

/**
 * @route GET /api/chat/:id
 * @desc Fetch full chronological text message history of a specific chat channel
 */
router.get('/:id', authMiddleware, chatController.getChatById);

/**
 * @route POST /api/chat
 * @desc Initialize or lookup an existing communication thread between two students
 */
router.post('/', authMiddleware, chatController.createOrGetChat);

/**
 * @route POST /api/chat/:id/messages
 * @desc Send a new real-time text message to a specific conversation channel
 */
router.post('/:id/messages', authMiddleware, chatController.sendMessage);

module.exports = router;
