import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
    username: String,
    adminName: String,
    adminEmail: String
}, { strict: false });

const onboardingSchema = new mongoose.Schema({
    completed: Boolean,
    adminName: String,
    adminEmail: String
}, { strict: false });

const User = mongoose.model('User', userSchema);
const Onboarding = mongoose.model('Onboarding', onboardingSchema);

async function repair() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const onboarding = await Onboarding.findOne({ completed: true });
        if (!onboarding) {
            console.log('No completed onboarding found.');
            return;
        }

        console.log(`Found onboarding for: ${onboarding.adminName}`);

        const user = await User.findOne({ username: 'admin' });
        if (user) {
            user.adminName = onboarding.adminName;
            user.adminEmail = onboarding.adminEmail;
            await user.save();
            console.log('Admin user updated successfully.');
        } else {
            console.log('Admin user not found.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

repair();
