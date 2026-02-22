import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env');
    process.exit(1);
}

const userSchema = new mongoose.Schema({
    username: String,
    adminName: String,
    adminEmail: String
});

const onboardingSchema = new mongoose.Schema({
    completed: Boolean,
    adminName: String,
    adminEmail: String
});

const User = mongoose.model('User', userSchema);
const Onboarding = mongoose.model('Onboarding', onboardingSchema);

async function debug() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log('\n--- USERS ---');
        console.log(JSON.stringify(users, null, 2));

        const onboarding = await Onboarding.find({});
        console.log('\n--- ONBOARDING DATA ---');
        console.log(JSON.stringify(onboarding, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

debug();
