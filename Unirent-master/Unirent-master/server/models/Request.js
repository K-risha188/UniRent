const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    urgency: {
        type: String,
        enum: ['urgent', 'standard'],
        default: 'standard'
    },
    deadline: {
        type: Date
    },
    status: {
        type: String,
        enum: ['open', 'fulfilled'],
        default: 'open'
    }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
