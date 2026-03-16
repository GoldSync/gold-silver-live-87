import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: 'd:/Work/SPM/live/backend/.env' });

const visitorSchema = new mongoose.Schema({
    fingerprint: String,
    isWhitelisted: Boolean,
    expiredAt: Date
}, { strict: false });
const Visitor = mongoose.model('Visitor', visitorSchema);

const settingsSchema = new mongoose.Schema({
    trialEnabled: Boolean
}, { strict: false });
const Settings = mongoose.model('Settings', settingsSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const settings = await Settings.findOne();
        console.log('TRIAL_ENABLED:', settings ? settings.trialEnabled : 'NOT_FOUND');
        
        const visitor = await Visitor.findOne({ fingerprint: /B2AIUTJ5/i });
        if (visitor) {
            console.log('VISITOR_FINGERPRINT:', visitor.fingerprint);
            console.log('VISITOR_WHITELISTED:', visitor.isWhitelisted);
            console.log('VISITOR_EXPIRED_AT:', visitor.expiredAt);
        } else {
            console.log('VISITOR_B2AIUTJ5_NOT_FOUND');
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
