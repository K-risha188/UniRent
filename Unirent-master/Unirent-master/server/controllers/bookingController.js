const Booking = require('../models/Booking');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.createBooking = async (req, res) => {
    try {
        const { itemId, startDate, endDate } = req.body;

        const item = await Item.findById(itemId);
        if (!item) return res.status(404).json({ error: 'Item not found' });

        if (item.owner.toString() === req.user._id.toString()) {
            return res.status(400).json({ error: 'You cannot rent your own item' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return res.status(400).json({ error: 'Start date cannot be after end date' });
        }

        // Check for overlapping approved/active bookings
        const overlappingBooking = await Booking.findOne({
            item: itemId,
            status: { $in: ['approved', 'active', 'requested_return'] },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        });
        if (overlappingBooking) {
            return res.status(400).json({ error: 'This item is already booked for the selected dates.' });
        }
        const diffTime = Math.abs(end - start);
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        const totalPrice = diffDays * item.pricePerDay;
        const platformFee = totalPrice * 0.05; // 5% fee
        const totalRequired = totalPrice + item.securityDeposit + platformFee;

        const user = await User.findById(req.user._id);
        const currentBalance = user.walletBalance || 0;
        if (currentBalance < totalRequired) {
            return res.status(400).json({ error: 'Insufficient wallet balance. Please top up.' });
        }

        // Deduct from wallet
        user.walletBalance = currentBalance - totalRequired;
        await user.save();

        const booking = new Booking({
            item: itemId,
            renter: req.user._id,
            owner: item.owner,
            startDate: start,
            endDate: end,
            totalPrice,
            securityDeposit: item.securityDeposit
        });

        await booking.save();

        // Log transactions
        await Transaction.insertMany([
            {
                user: req.user._id,
                amount: -(totalPrice + item.securityDeposit),
                type: 'debit',
                purpose: 'RENTAL_PAYMENT',
                relatedBooking: booking._id,
                description: `Payment for renting ${item.title} (Rent + Deposit)`
            },
            {
                user: req.user._id,
                amount: -platformFee,
                type: 'debit',
                purpose: 'PLATFORM_FEE',
                relatedBooking: booking._id,
                description: `Platform fee for renting ${item.title}`
            }
        ]);

        await Notification.create({
            recipient: item.owner,
            message: `New rental request for ${item.title}`,
            type: 'booking',
            relatedId: booking._id
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ renter: req.user._id })
            .populate('item')
            .populate('owner', 'name university');
        res.json(bookings);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getReceivedBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ owner: req.user._id })
            .populate('item')
            .populate('renter', 'name university');
        res.json(bookings);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        if (booking.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (status === 'approved') {
            const overlappingBooking = await Booking.findOne({
                item: booking.item,
                _id: { $ne: booking._id },
                status: { $in: ['approved', 'active', 'requested_return'] },
                $or: [
                    { startDate: { $lte: booking.endDate }, endDate: { $gte: booking.startDate } }
                ]
            });
            if (overlappingBooking) {
                return res.status(400).json({ error: 'Cannot approve this booking because the item is already booked for overlapping dates.' });
            }
        }

        booking.status = status;
        await booking.save();
        await booking.populate('item', 'title');

        if (status === 'rejected') {
            const renterUser = await User.findById(booking.renter);
            const platformFee = booking.totalPrice * 0.05;
            const refundAmount = booking.totalPrice + booking.securityDeposit + platformFee;
            renterUser.walletBalance = (renterUser.walletBalance || 0) + refundAmount;
            await renterUser.save();

            await Transaction.create({
                user: booking.renter,
                amount: refundAmount,
                type: 'credit',
                purpose: 'DEPOSIT_REFUND',
                relatedBooking: booking._id,
                description: `Refund for rejected request: ${booking.item.title}`
            });
        }

        await Notification.create({
            recipient: booking.renter,
            message: `Your request for ${booking.item.title} was ${status}`,
            type: 'booking',
            relatedId: booking._id
        });

        // If approved, we could potentially update the item's availability array
        // or just rely on the existing overlap check that looks at approved bookings.

        res.json(booking);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.submitVerification = async (req, res) => {
    try {
        const { type, notes } = req.body; // type: 'preRental' or 'postRental'

        // Merge existing photos and newly uploaded files
        let allPhotos = [];
        if (req.body.existingPhotos) {
            let existing = req.body.existingPhotos;
            if (typeof existing === 'string') {
                try {
                    existing = JSON.parse(existing);
                } catch (e) {
                    existing = [existing];
                }
            }
            if (Array.isArray(existing)) {
                allPhotos = [...allPhotos, ...existing];
            }
        }

        if (req.files && req.files.length > 0) {
            const uploadedPaths = req.files.map(file => file.path.replace(/\\/g, '/'));
            allPhotos = [...allPhotos, ...uploadedPaths];
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        // Only owner or renter can submit verification
        const isAuthorized = [booking.owner.toString(), booking.renter.toString()].includes(req.user._id.toString());
        if (!isAuthorized) return res.status(403).json({ error: 'Not authorized' });

        if (!['preRental', 'postRental'].includes(type)) {
            return res.status(400).json({ error: 'Invalid verification type' });
        }

        // 1. Guard against invalid states
        if (type === 'preRental') {
            if (booking.status !== 'approved' && booking.status !== 'active') {
                return res.status(400).json({ error: 'Handover verification can only be done for approved or active bookings' });
            }
        } else if (type === 'postRental') {
            if (!['active', 'requested_return', 'completed'].includes(booking.status)) {
                return res.status(400).json({ error: 'Return verification can only be done for active, return-requested, or completed bookings' });
            }
        }

        // 2. Check if already verified but allow proceeding if status needs update
        const alreadyVerified = booking.verification?.[type]?.verifiedAt;

        // 3. Map the data (only if not already verified or to refresh it)
        if (!booking.verification) booking.verification = {};

        if (!alreadyVerified) {
            booking.verification[type] = {
                photos: allPhotos,
                notes,
                verifiedAt: new Date()
            };
            booking.markModified('verification');
        }

        // 4. Auto-update status based on verification type (Ensure it transitions)
        let statusChanged = false;
        if (type === 'preRental' && booking.status === 'approved') {
            booking.status = 'active';
            statusChanged = true;
        } else if (type === 'postRental' && (booking.status === 'active' || booking.status === 'requested_return')) {
            booking.status = 'completed';
            statusChanged = true;
        }

        if (!alreadyVerified || statusChanged) {
            await booking.save();
            await booking.populate('item', 'title');

            if (type === 'preRental') {
                await Notification.create({
                    recipient: booking.renter,
                    message: `Handover confirmed for ${booking.item.title}`,
                    type: 'booking',
                    relatedId: booking._id
                });
            } else if (type === 'postRental' && statusChanged) {
                // Transfer funds
                const ownerUser = await User.findById(booking.owner);
                ownerUser.walletBalance = (ownerUser.walletBalance || 0) + booking.totalPrice;
                await ownerUser.save();

                const renterUser = await User.findById(booking.renter);
                renterUser.walletBalance = (renterUser.walletBalance || 0) + booking.securityDeposit;
                await renterUser.save();

                await Transaction.insertMany([
                    {
                        user: booking.owner,
                        amount: booking.totalPrice,
                        type: 'credit',
                        purpose: 'RENTAL_EARNING',
                        relatedBooking: booking._id,
                        description: `Earnings from renting ${booking.item.title}`
                    },
                    {
                        user: booking.renter,
                        amount: booking.securityDeposit,
                        type: 'credit',
                        purpose: 'DEPOSIT_REFUND',
                        relatedBooking: booking._id,
                        description: `Security deposit refund for ${booking.item.title}`
                    }
                ]);

                await Notification.create({
                    recipient: booking.owner,
                    message: `Return completed for ${booking.item.title}`,
                    type: 'booking',
                    relatedId: booking._id
                });
            }
        } else if (alreadyVerified && !statusChanged) {
            return res.status(400).json({ error: `${type === 'preRental' ? 'Handover' : 'Return'} verification already completed` });
        }
        res.json({ message: `${type} verification submitted`, booking });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.requestReturn = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        if (booking.renter.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Only the renter can request a return' });
        }

        if (booking.status !== 'active') {
            const errorMsg = booking.status === 'requested_return' ? 'Return already requested' :
                booking.status === 'completed' ? 'Rental already completed' :
                    'Can only request return for active rentals';
            return res.status(400).json({ error: errorMsg });
        }

        booking.status = 'requested_return';
        await booking.save();
        await booking.populate('item', 'title');

        await Notification.create({
            recipient: booking.owner,
            message: `Return requested for ${booking.item.title}`,
            type: 'booking',
            relatedId: booking._id
        });

        res.json({ message: 'Return request sent to owner', booking });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getItemHistory = async (req, res) => {
    try {
        const bookings = await Booking.find({
            item: req.params.itemId,
            status: 'completed'
        })
            .populate('renter', 'name university')
            .sort('-createdAt');

        const history = bookings.map(b => ({
            id: b._id,
            renter: b.renter,
            handover: b.verification ? b.verification.preRental : null,
            return: b.verification ? b.verification.postRental : null,
            date: b.endDate
        }));

        res.json(history);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        // Ensure the logged-in user is indeed the renter
        if (booking.renter.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Only the renter can cancel this booking request' });
        }

        // Restrict unilateral cancellation to pending requests
        if (booking.status !== 'pending') {
            return res.status(400).json({ error: 'You can only cancel a pending booking request' });
        }

        // Transition status to cancelled
        booking.status = 'cancelled';
        await booking.save();
        await booking.populate('item', 'title');

        // Refund held funds: rent price + security deposit + 5% platform fee
        const platformFee = booking.totalPrice * 0.05;
        const refundAmount = booking.totalPrice + booking.securityDeposit + platformFee;

        const renterUser = await User.findById(booking.renter);
        renterUser.walletBalance = (renterUser.walletBalance || 0) + refundAmount;
        await renterUser.save();

        // Create transaction log
        await Transaction.create({
            user: booking.renter,
            amount: refundAmount,
            type: 'credit',
            purpose: 'DEPOSIT_REFUND',
            relatedBooking: booking._id,
            description: `Refund for cancelled request: ${booking.item.title}`
        });

        // Notify the owner of the cancellation
        await Notification.create({
            recipient: booking.owner,
            message: `Booking request for ${booking.item.title} was cancelled by the renter`,
            type: 'booking',
            relatedId: booking._id
        });

        res.json({ message: 'Booking request cancelled successfully and funds fully refunded', booking });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


