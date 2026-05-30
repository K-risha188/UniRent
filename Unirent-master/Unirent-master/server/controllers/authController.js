const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const secret = process.env.JWT_SECRET;

exports.register = async (req, res) => {
    try {
        const { name, email, password, university, phone } = req.body;

        // University email validation is also handled by Mongoose schema but we can add a check here too
        if (!email.endsWith('@paruluniversity.ac.in')) {
            return res.status(400).json({ error: 'Please use your valid Parul University email (@paruluniversity.ac.in)' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a valid University ID Card image' });
        }

        const idCardImage = req.file.path.replace(/\\/g, '/');

        const user = new User({ name, email, password, university, phone, idCardImage, isVerified: false });
        await user.save();

        const token = jwt.encode({ id: user._id }, secret);
        res.status(201).json({ token, user: { id: user._id, name, email, university, phone: user.phone, role: user.role } });
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
        const currentUser = await User.findById(req.user._id);

        let phoneVerifiedState = currentUser.isPhoneVerified;
        if (phone !== undefined && phone !== currentUser.phone) {
            phoneVerifiedState = false;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, bio, image, phone, yearOfStudy, enrollmentId, isPhoneVerified: phoneVerifiedState },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        const targetPhone = phone || req.user.phone;

        if (!targetPhone) {
            return res.status(400).json({ error: 'Please provide a valid phone number.' });
        }

        // Generate 6-digit cryptographically secure numeric OTP
        const otpCode = crypto.randomInt(100000, 999999).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

        // If phone is different from user's current phone, update it and reset verification
        const updateData = {
            phoneOtp: otpCode,
            phoneOtpExpiry: otpExpiry,
            otpAttempts: 0 // Reset security attempts counter on new OTP request
        };
        if (phone && phone !== req.user.phone) {
            updateData.phone = phone;
            updateData.isPhoneVerified = false;
        }

        await User.findByIdAndUpdate(req.user._id, updateData);

        // Simulated SMS Dispatch Log (Premium CLI container feedback)
        console.log("\n====================================================");
        console.log("📲  SIMULATED SMS SERVICE DISPATCH LOG");
        console.log(`To: ${targetPhone}`);
        console.log(`Message: Your UniRent OTP verification code is: ${otpCode}`);
        console.log("====================================================\n");

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully! (Simulated)'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({ error: 'Please enter the 6-digit OTP code.' });
        }

        const user = await User.findById(req.user._id);

        if (!user.phoneOtp || !user.phoneOtpExpiry) {
            return res.status(400).json({ error: 'No OTP requested or OTP has expired. Please request a new one.' });
        }

        // Check if rate-limited beforehand
        if ((user.otpAttempts || 0) >= 5) {
            user.phoneOtp = null;
            user.phoneOtpExpiry = null;
            user.otpAttempts = 0;
            await user.save();
            return res.status(400).json({ error: 'Too many failed attempts. This OTP has been invalidated. Please request a new one.' });
        }

        // Check expiry
        if (new Date() > new Date(user.phoneOtpExpiry)) {
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }

        // Verify match
        if (user.phoneOtp !== otp) {
            const currentAttempts = (user.otpAttempts || 0) + 1;
            user.otpAttempts = currentAttempts;

            if (currentAttempts >= 5) {
                user.phoneOtp = null;
                user.phoneOtpExpiry = null;
                user.otpAttempts = 0;
                await user.save();
                return res.status(400).json({ error: 'Too many failed attempts. This OTP has been invalidated. Please request a new one.' });
            } else {
                await user.save();
                const remaining = 5 - currentAttempts;
                return res.status(400).json({ error: `Incorrect OTP. You have ${remaining} attempts remaining before this code is invalidated.` });
            }
        }

        // OTP matched successfully! Mark verified.
        user.isPhoneVerified = true;
        user.phoneOtp = null;
        user.phoneOtpExpiry = null;
        user.otpAttempts = 0; // Reset attempts counter on successful verification
        await user.save();

        // Strip password for response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: 'Phone number verified successfully!',
            user: userResponse
        });
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
