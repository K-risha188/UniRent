const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    messages: [messageSchema],
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
