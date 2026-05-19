const Review = require('../models/Review');
const Booking = require('../models/Booking');

exports.createReview = async (req, res) => {
    try {
        const { itemId, rating, comment, bookingId } = req.body;

        // Check if user actually rented this item and booking is completed
        const booking = await Booking.findOne({
            _id: bookingId,
            renter: req.user._id,
            item: itemId
        });

        if (!booking) {
            return res.status(403).json({ error: 'You can only review items you have rented' });
        }

        const review = new Review({
            item: itemId,
            user: req.user._id,
            rating,
            comment
        });

        await review.save();
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getItemReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ item: req.params.itemId })
            .populate('user', 'name image university')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
