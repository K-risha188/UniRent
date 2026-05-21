const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/bookings';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

router.post('/', authMiddleware, bookingController.createBooking);
router.get('/my-rentals', authMiddleware, bookingController.getUserBookings);
router.get('/received-bookings', authMiddleware, bookingController.getReceivedBookings);
router.patch('/:id/status', authMiddleware, bookingController.updateBookingStatus);
router.post('/:id/verify', authMiddleware, upload.array('photos', 5), bookingController.submitVerification);
router.patch('/:id/request-return', authMiddleware, bookingController.requestReturn);

router.get('/item/:itemId/history', bookingController.getItemHistory);

module.exports = router;
