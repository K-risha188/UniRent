const Item = require('../models/Item');
const Notification = require('../models/Notification');
const User = require('../models/User');
const safetyModerator = require('../utils/safetyModerator');

exports.createItem = async (req, res) => {
    try {
        const { title, description, pricePerDay, securityDeposit, category } = req.body;

        let allImages = [];

        // Add any string URLs passed from the body
        if (req.body.existingImages) {
            let existing = req.body.existingImages;
            // Parse if it's sent as a JSON string from FormData
            if (typeof existing === 'string') {
                try {
                    existing = JSON.parse(existing);
                } catch (e) {
                    existing = [existing];
                }
            }
            if (Array.isArray(existing)) {
                allImages = [...allImages, ...existing];
            }
        }

        // Add local file paths uploaded via multer
        if (req.files && req.files.length > 0) {
            const uploadedPaths = req.files.map(file => file.path.replace(/\\/g, '/'));
            allImages = [...allImages, ...uploadedPaths];
        }

        const safety = await safetyModerator.checkSafety(title, description, category);

        const item = new Item({
            title,
            description,
            pricePerDay,
            securityDeposit,
            images: allImages,
            category,
            owner: req.user._id,
            university: req.user.university,
            moderationStatus: safety.isSafe ? 'approved' : 'flagged',
            moderationReason: safety.isSafe ? '' : safety.reason,
            isAvailable: safety.isSafe ? true : false
        });

        await item.save();

        if (!safety.isSafe) {
            // 1. Dispatch notification to all Admins
            const admins = await User.find({ role: 'admin' }).select('_id');
            const adminNotifications = admins.map(admin => ({
                recipient: admin._id,
                message: `⚠️ Security Alert: "${item.title}" posted by ${req.user.name} was flagged for: "${safety.reason}"`,
                type: 'system',
                relatedId: item._id
            }));
            if (adminNotifications.length > 0) {
                await Notification.insertMany(adminNotifications);
            }

            // 2. Dispatch notification to the Owner
            const ownerNotification = new Notification({
                recipient: req.user._id,
                message: `⚠️ Your listing "${item.title}" was flagged by automated moderation for: "${safety.reason}". It is pending admin review.`,
                type: 'item',
                relatedId: item._id
            });
            await ownerNotification.save();
        } else {
            // Broadcast notification to other users
            const users = await User.find({ _id: { $ne: req.user._id } }).select('_id');
            const notifications = users.map(u => ({
                recipient: u._id,
                message: `New item added: ${item.title}`,
                type: 'item',
                relatedId: item._id
            }));
            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        }

        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllItems = async (req, res) => {
    try {
        const { university, category, search } = req.query;
        let query = { isAvailable: true, moderationStatus: { $ne: 'flagged' } };

        if (university) query.university = university;
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const items = await Item.find(query).populate('owner', 'name image university bio phone yearOfStudy');
        res.json(items);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('owner', 'name image university bio phone yearOfStudy');
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });

        if (item.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getOwnerItems = async (req, res) => {
    try {
        const items = await Item.find({ owner: req.user._id });
        res.json(items);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });

        if (item.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
