const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/unirent';

async function resetDB() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            console.log(`Dropping collection: ${collection.collectionName}`);
            await collection.drop();
        }

        console.log('Successfully cleared all MongoDB data.');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
}

resetDB();
