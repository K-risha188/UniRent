const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.getWalletDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('walletBalance');
        const transactions = await Transaction.find({ user: req.user._id }).sort('-createdAt');

        res.json({
            balance: user.walletBalance || 0,
            transactions
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.topUpWallet = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid top-up amount' });
        }

        const user = await User.findById(req.user._id);
        user.walletBalance = (user.walletBalance || 0) + amount;
        await user.save();

        const transaction = new Transaction({
            user: user._id,
            amount,
            type: 'credit',
            purpose: 'TOP_UP',
            description: `Wallet top-up of ₹${amount}`
        });
        await transaction.save();

        res.json({
            message: 'Top-up successful',
            balance: user.walletBalance,
            transaction
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
