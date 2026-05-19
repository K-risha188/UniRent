const User = require('../models/User');
const Item = require('../models/Item');
const Booking = require('../models/Booking');

exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalItems = await Item.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('renter', 'name email')
            .populate('item', 'title');

        res.json({
            totalUsers,
            totalItems,
            totalBookings,
            recentBookings
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllItems = async (req, res) => {
    try {
        const items = await Item.find().populate('owner', 'name email');
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.toggleAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.role = user.role === 'admin' ? 'student' : 'admin';
        await user.save();
        res.json({ message: `User role updated to ${user.role}`, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUnverifiedUsers = async (req, res) => {
    try {
        const unverifiedUsers = await User.find({ isVerified: false, role: { $ne: 'admin' } })
            .select('name email university idCardImage createdAt')
            .sort({ createdAt: -1 });
        res.json(unverifiedUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.verifyUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.isVerified = true;
        await user.save();

        res.json({ message: 'User verification approved successfully.', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
