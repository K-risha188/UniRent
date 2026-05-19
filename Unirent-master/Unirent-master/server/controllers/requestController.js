const Request = require('../models/Request');

exports.createRequest = async (req, res) => {
    try {
        const { title, description, urgency, deadline } = req.body;
        const newRequest = new Request({
            user: req.user._id,
            title,
            description,
            urgency,
            deadline
        });
        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const requests = await Request.find({ status: 'open' })
            .populate('user', 'name image university')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
};

exports.fulfillRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json({ error: 'Request not found' });

        request.status = 'fulfilled';
        await request.save();

        res.json(request);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
