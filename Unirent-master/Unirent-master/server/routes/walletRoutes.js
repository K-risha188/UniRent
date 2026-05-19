const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const walletController = require('../controllers/walletController');

router.get('/', auth, walletController.getWalletDetails);
router.post('/topup', auth, walletController.topUpWallet);

module.exports = router;
