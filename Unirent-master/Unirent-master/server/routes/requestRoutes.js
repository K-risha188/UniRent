const express = require('express');
const router = express.Router();
const { createRequest, getRequests, fulfillRequest } = require('../controllers/requestController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getRequests);
router.post('/', auth, createRequest);
router.patch('/:id/fulfill', auth, fulfillRequest);

module.exports = router;
