const mongoose = require('mongoose');

/**
 * @typedef {Object} ItemSchema
 * @property {String} title - Descriptive name of the gear listed by the student
 * @property {String} description - Quality condition details and description of capabilities
 * @property {Number} pricePerDay - Base daily rental cost
 * @property {Number} securityDeposit - Required refundable security collateral hold
 * @property {String[]} images - List of photo file URLs uploaded to describe the gear
 * @property {mongoose.Schema.Types.ObjectId} owner - The active campus profile listing the item
 * @property {String} university - Enforced campus circle bounds limit (e.g. Parul University)
 * @property {String} moderationStatus - State of automated keyword safety check (approved / flagged)
 */
const itemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    pricePerDay: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    images: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    university: { type: String, required: true },
    availability: [{
        startDate: { type: Date },
        endDate: { type: Date }
    }],
    isAvailable: { type: Boolean, default: true },
    moderationStatus: { type: String, enum: ['approved', 'flagged'], default: 'approved' },
    moderationReason: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', itemSchema);
