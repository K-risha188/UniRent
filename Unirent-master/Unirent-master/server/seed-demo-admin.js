const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/unirent';

async function seedAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB.');

        const adminEmail = 'admin';
        let user = await User.findOne({ email: adminEmail });

        if (!user) {
            console.log('Creating new demo admin user...');
            user = new User({
                name: 'Admin',
                email: adminEmail,
                password: 'admin', // Will be hashed by User model pre-save hook
                university: 'Parul University',
                role: 'admin',
                idCardImage: 'admin_bypass.jpg',
                isVerified: true
            });
        } else {
            console.log('User already exists, ensuring admin role...');
            user.role = 'admin';
        }

        await user.save();
        console.log('-----------------------------------');
        console.log('Demo Admin Account Ready:');
        console.log(`Email: ${adminEmail}`);
        console.log('Password: admin');
        console.log('Role: admin');
        console.log('-----------------------------------');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
