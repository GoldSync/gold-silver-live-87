import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: 'd:/Work/SPM/live/backend/.env' });

const settingsSchema = new mongoose.Schema({}, { strict: false });
const Settings = mongoose.model('Settings', settingsSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const settings = await Settings.findOne();
        console.log('--- GLOBAL LOCK CHECK ---');
        console.log('isLocked:', settings ? settings.isLocked : 'NOT_FOUND');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
