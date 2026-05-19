const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, chatController.getChats);
router.get('/:id', authMiddleware, chatController.getChatById);
router.post('/', authMiddleware, chatController.createOrGetChat);
router.post('/:id/messages', authMiddleware, chatController.sendMessage);

module.exports = router;
