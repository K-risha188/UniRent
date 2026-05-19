const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All routes require authentication AND admin role
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.get('/items', adminController.getAllItems);
router.delete('/items/:id', adminController.deleteItem);
router.patch('/users/:id/toggle-admin', adminController.toggleAdmin);

// Verification routes
router.get('/unverified-users', adminController.getUnverifiedUsers);
router.put('/verify-user/:id', adminController.verifyUser);

module.exports = router;
