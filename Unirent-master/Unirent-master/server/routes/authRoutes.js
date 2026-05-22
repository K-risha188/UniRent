const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/id_cards';
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

router.post('/register', upload.single('idCardImage'), authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.get('/activity', authMiddleware, authController.getUserActivity);
router.put('/update-profile', authMiddleware, authController.updateProfile);
router.put('/upload-id-card', authMiddleware, upload.single('idCardImage'), authController.uploadIdCard);
router.put('/upload-profile-image', authMiddleware, upload.single('image'), authController.uploadProfileImage);
router.post('/send-otp', authMiddleware, authController.sendOtp);
router.post('/verify-otp', authMiddleware, authController.verifyOtp);

module.exports = router;
