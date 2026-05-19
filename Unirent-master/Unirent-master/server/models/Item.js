const mongoose = require('mongoose');

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
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', itemSchema);
