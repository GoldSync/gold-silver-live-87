import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: 'd:/Work/SPM/live/backend/.env' });

const visitorSchema = new mongoose.Schema({
    fingerprint: String,
    isWhitelisted: Boolean,
    expiredAt: Date,
    firstSeen: Date,
    isExtended: Boolean,
    extendedAt: Date,
    name: String,
    email: String
});
const Visitor = mongoose.model('Visitor', visitorSchema);

const settingsSchema = new mongoose.Schema({
    trialEnabled: { type: Boolean, default: true }
}, { strict: false });
const Settings = mongoose.model('Settings', settingsSchema);

async function run() {
    try {
        if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing');
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('--- DETAILED DB REPORT ---');
        
        const allSettings = await Settings.find();
        console.log(`Settings count: ${allSettings.length}`);
        console.log('All Settings documents:', JSON.stringify(allSettings, null, 2));
        
        const targetFingerprint = 'b2aiutj5o8bmmi3li8e'; // The likely one
        const visitor = await Visitor.findOne({ fingerprint: targetFingerprint });
        
        if (visitor) {
            console.log('Target Visitor:', JSON.stringify(visitor, null, 2));
        } else {
            console.log(`Visitor ${targetFingerprint} not found. Searching by regex...`);
            const v2 = await Visitor.findOne({ fingerprint: /B2AIUTJ5/i });
            if (v2) {
                console.log('Found Visitor by regex:', JSON.stringify(v2, null, 2));
            } else {
                console.log('STILL NOT FOUND. Listing all visitors...');
                const allV = await Visitor.find();
                console.log('All Visitors:', JSON.stringify(allV, null, 2));
            }
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
