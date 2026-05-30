const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * @module BookingRoutes
 * @description Coordinates the P2P student rental lifecycle (Escrow dates, validation checks, and returns).
 * @security JWT Authentication (authMiddleware)
 */

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

/**
 * @route POST /api/bookings
 * @desc Initialize new booking (Escrow holding, date calendar locking, and rate checking)
 */
router.post('/', authMiddleware, bookingController.createBooking);

/**
 * @route GET /api/bookings/my-rentals
 * @desc Get all items booked by the current student renter
 */
router.get('/my-rentals', authMiddleware, bookingController.getUserBookings);

/**
 * @route GET /api/bookings/received-bookings
 * @desc Get all rental requests submitted for the active owner's gear
 */
router.get('/received-bookings', authMiddleware, bookingController.getReceivedBookings);

/**
 * @route PATCH /api/bookings/:id/status
 * @desc Update status (approve, reject, confirm pickup)
 */
router.patch('/:id/status', authMiddleware, bookingController.updateBookingStatus);

/**
 * @route POST /api/bookings/:id/verify
 * @desc Upload pre-rental or post-rental condition verification photographs
 */
router.post('/:id/verify', authMiddleware, upload.array('photos', 5), bookingController.submitVerification);

/**
 * @route PATCH /api/bookings/:id/request-return
 * @desc Flag rental status as ready for post-rental handover return checking
 */
router.patch('/:id/request-return', authMiddleware, bookingController.requestReturn);

/**
 * @route PATCH /api/bookings/:id/cancel
 * @desc Cancel a pending/approved reservation and trigger wallet deposit returns
 */
router.patch('/:id/cancel', authMiddleware, bookingController.cancelBooking);

/**
 * @route GET /api/bookings/item/:itemId/history
 * @desc Public history lookup showing absolute usage stats of a gear item
 */
router.get('/item/:itemId/history', bookingController.getItemHistory);

/**
 * @route GET /api/bookings/item/:itemId/reserved-dates
 * @desc Get all approved/active booking periods for a specific gear item
 */
router.get('/item/:itemId/reserved-dates', bookingController.getReservedDates);

module.exports = router;
