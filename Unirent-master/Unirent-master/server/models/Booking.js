const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'active', 'requested_return', 'completed', 'cancelled', 'rejected'],
        default: 'pending'
    },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    verification: {
        preRental: {
            photos: [{ type: String }],
            notes: { type: String },
            verifiedAt: { type: Date }
        },
        postRental: {
            photos: [{ type: String }],
            notes: { type: String },
            verifiedAt: { type: Date }
        }
    },
    createdAt: { type: Date, default: Date.now }
}, { minimize: false });

module.exports = mongoose.model('Booking', bookingSchema);
