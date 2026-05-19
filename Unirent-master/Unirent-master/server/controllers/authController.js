const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');

const secret = process.env.JWT_SECRET || 'unirent_secret_key';

exports.register = async (req, res) => {
    try {
        const { name, email, password, university } = req.body;

        // University email validation is also handled by Mongoose schema but we can add a check here too
        if (!email.endsWith('@paruluniversity.ac.in')) {
            return res.status(400).json({ error: 'Please use your valid Parul University email (@paruluniversity.ac.in)' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a valid University ID Card image' });
        }

        const idCardImage = req.file.path.replace(/\\/g, '/');

        const user = new User({ name, email, password, university, idCardImage, isVerified: false });
        await user.save();

        const token = jwt.encode({ id: user._id }, secret);
        res.status(201).json({ token, user: { id: user._id, name, email, university, role: user.role } });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.encode({ id: user._id }, secret);
        res.json({ token, user: { id: user._id, name: user.name, email, university: user.university, role: user.role } });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, bio, image, phone, yearOfStudy, enrollmentId } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, bio, image, phone, yearOfStudy, enrollmentId },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.uploadIdCard = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a valid ID card image' });
        }

        const idCardImage = req.file.path.replace(/\\/g, '/');

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { idCardImage, isVerified: false }, // Reset verification status pending admin review
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getUserActivity = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch recent bookings where user is renter or owner
        const bookings = await Booking.find({
            $or: [{ renter: userId }, { owner: userId }]
        }).populate('item', 'title images category')
            .sort({ createdAt: -1 })
            .limit(10);

        // Fetch recent reviews received by the user
        const reviews = await Review.find({ reviewee: userId })
            .populate('reviewer', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        // Map bookings to activity format
        const bookingActivities = bookings.map(b => ({
            _id: `b_${b._id}`,
            type: b.owner.toString() === userId.toString() ? (b.status === 'pending' ? 'booking_request' : 'item_rented_out') : 'item_rented',
            title: b.owner.toString() === userId.toString() ? 'Rental Update' : 'Rented Item',
            message: b.owner.toString() === userId.toString()
                ? `Someone requested or rented your "${b.item?.title || 'item'}". Status: ${b.status}`
                : `You requested/rented "${b.item?.title || 'item'}". Status: ${b.status}`,
            createdAt: b.createdAt
        }));

        // Map reviews to activity format
        const reviewActivities = reviews.map(r => ({
            _id: `r_${r._id}`,
            type: 'review_received',
            title: 'New Review',
            message: `${r.reviewer?.name || 'A user'} left you a ${r.rating}-star review.`,
            createdAt: r.createdAt
        }));

        // Merge, sort, and slice
        const activities = [...bookingActivities, ...reviewActivities]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 15);

        res.json(activities);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a valid image' });
        }

        const image = req.file.path.replace(/\\\\/g, '/');

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { image },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
