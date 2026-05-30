const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * @module ItemRoutes
 * @description Coordinates the registration, upload, whitelisting, and retrieval of rental items.
 */

// Ensure uploads directory exists
const uploadDir = 'uploads/items';
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
 * @route GET /api/items
 * @desc Public route to browse active, verified campus listings
 */
router.get('/', itemController.getAllItems);

/**
 * @route GET /api/items/my-listings
 * @desc Get all listings created by the logged-in student owner
 * @security JWT Authentication (authMiddleware)
 */
router.get('/my-listings', authMiddleware, itemController.getOwnerItems);

/**
 * @route GET /api/items/:id
 * @desc Retrieve detailed specs and owner information of a single gear item
 */
router.get('/:id', itemController.getItemById);

/**
 * @route POST /api/items
 * @desc Add a new rental listing (Runs keyword filter + upload files)
 * @security JWT Authentication (authMiddleware)
 */
router.post('/', authMiddleware, upload.array('images', 5), itemController.createItem);

/**
 * @route PUT /api/items/:id
 * @desc Edit an existing item listing (runs whitelist parameter protection + automatic re-moderation)
 * @security JWT Authentication (authMiddleware)
 */
router.put('/:id', authMiddleware, itemController.updateItem);

/**
 * @route DELETE /api/items/:id
 * @desc Remove/unlist a specific item from active student search indexes
 * @security JWT Authentication (authMiddleware)
 */
router.delete('/:id', authMiddleware, itemController.deleteItem);

module.exports = router;
