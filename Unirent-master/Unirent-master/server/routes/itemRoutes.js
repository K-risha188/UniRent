const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

router.get('/', itemController.getAllItems);
router.get('/my-listings', authMiddleware, itemController.getOwnerItems);
router.get('/:id', itemController.getItemById);
router.post('/', authMiddleware, upload.array('images', 5), itemController.createItem);
router.put('/:id', authMiddleware, itemController.updateItem);
router.delete('/:id', authMiddleware, itemController.deleteItem);

module.exports = router;
