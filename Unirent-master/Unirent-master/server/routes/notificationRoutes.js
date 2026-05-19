const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getNotifications);
router.patch('/read-all', auth, markAllAsRead);
router.patch('/:id/read', auth, markAsRead);

module.exports = router;
