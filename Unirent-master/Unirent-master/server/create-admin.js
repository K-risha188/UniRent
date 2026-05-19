const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/unirent';
const email = process.argv[2];

if (!email) {
    console.error('Please provide a university email: node create-admin.js <email>');
    process.exit(1);
}

async function promoteToAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`Successfully promoted ${user.name} (${email}) to Admin.`);
        process.exit(0);
    } catch (error) {
        console.error('Error promoting user:', error);
        process.exit(1);
    }
}

promoteToAdmin();
