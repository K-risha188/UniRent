const mongoose = require('mongoose');

/**
 * @typedef {Object} BookingSchema
 * @property {mongoose.Schema.Types.ObjectId} item - Referenced rental gear listing document
 * @property {mongoose.Schema.Types.ObjectId} renter - Student profile initiating the checkout request
 * @property {mongoose.Schema.Types.ObjectId} owner - Student listing owner receiving rental dividends
 * @property {Date} startDate - Reservation check-in/handover date
 * @property {Date} endDate - Scheduled return check-out date
 * @property {Number} totalPrice - Accumulated active rental cost based on day multiplier
 * @property {Number} securityDeposit - Safely held escrow collateral balance for damage liabilities
 * @property {String} status - Active phase state of transaction (Escrow calendar pipeline status)
 * @property {String} paymentStatus - Escrow ledger holding flag (unpaid / paid)
 * @property {Object} verification - Pre-rental & Post-rental condition validation logs and checklists
 */
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
