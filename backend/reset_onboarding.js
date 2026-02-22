import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function reset() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete onboarding and users to force re-setup
        await mongoose.connection.db.collection('onboardings').deleteMany({});
        await mongoose.connection.db.collection('users').deleteMany({});

        console.log('Onboarding and User records purged.');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

reset();
