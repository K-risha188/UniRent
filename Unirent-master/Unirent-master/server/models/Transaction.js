const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    purpose: {
        type: String,
        required: true // e.g., 'TOP_UP', 'RENTAL_PAYMENT', 'RENTAL_EARNING', 'DEPOSIT_REFUND', 'PLATFORM_FEE'
    },
    relatedBooking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        default: null
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
