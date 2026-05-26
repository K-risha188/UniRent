const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const walletController = require('../controllers/walletController');

/**
 * @module WalletRoutes
 * @description Coordinates virtual balance holdings, token ledger top-ups, and student transactions.
 * @security JWT Authentication (auth middleware)
 */

/**
 * @route GET /api/wallet
 * @desc Get current student balance, active holds, and past financial transactions
 */
router.get('/', auth, walletController.getWalletDetails);

/**
 * @route POST /api/wallet/topup
 * @desc Simulate credit addition of virtual money to the student's active balance
 */
router.post('/topup', auth, walletController.topUpWallet);

module.exports = router;
