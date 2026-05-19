const Chat = require('../models/Chat');

exports.getChats = async (req, res) => {
    try {
        const chats = await Chat.find({ participants: { $in: [req.user._id] } })
            .populate('participants', 'name image university')
            .populate('item', 'title images')
            .sort({ updatedAt: -1 });
        res.json(chats);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getChatById = async (req, res) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.id,
            participants: { $in: [req.user._id] }
        })
            .populate('participants', 'name image university')
            .populate('item', 'title images pricePerDay')
            .populate('messages.sender', 'name');

        if (!chat) return res.status(404).json({ error: 'Chat not found' });
        res.json(chat);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.createOrGetChat = async (req, res) => {
    try {
        const { recipientId, itemId } = req.body;

        // Find existing chat between these users for this item
        let chat = await Chat.findOne({
            participants: { $all: [req.user._id, recipientId] },
            item: itemId
        });

        if (!chat) {
            chat = new Chat({
                participants: [req.user._id, recipientId],
                item: itemId,
                messages: []
            });
            await chat.save();
        }

        res.json(chat);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const chat = await Chat.findById(req.params.id);

        if (!chat || !chat.participants.includes(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const message = {
            sender: req.user._id,
            text,
            timestamp: new Date()
        };

        chat.messages.push(message);
        chat.updatedAt = new Date();
        await chat.save();

        res.status(201).json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
