import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: 'd:/Work/SPM/live/backend/.env' });

const visitorSchema = new mongoose.Schema({}, { strict: false });
const Visitor = mongoose.model('Visitor', visitorSchema);

const settingsSchema = new mongoose.Schema({}, { strict: false });
const Settings = mongoose.model('Settings', settingsSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('--- SETTINGS CHECK ---');
        const settingsList = await Settings.find();
        console.log(`Found ${settingsList.length} settings docs.`);
        settingsList.forEach((s, i) => {
            console.log(`[${i}] ID: ${s._id} | trialEnabled: ${s.trialEnabled}`);
        });
        
        console.log('\n--- TARGET VISITOR CHECK ---');
        const visitor = await Visitor.findOne({ fingerprint: /B2AIUTJ5/i });
        if (visitor) {
            console.log('Found Visitor:', visitor.fingerprint);
            console.log('isWhitelisted:', visitor.isWhitelisted);
            console.log('firstSeen:', visitor.firstSeen);
            console.log('isExtended:', visitor.isExtended);
            console.log('extendedAt:', visitor.extendedAt);
            console.log('expiredAt:', visitor.expiredAt);
            
            // Re-run the proxy.js logic
            let reason = 'ALLOWED';
            let locked = false;
            
            const trialEnabled = settingsList.length > 0 ? settingsList[0].trialEnabled : true;
            if (trialEnabled === false) {
                reason = 'ALLOWED (Global Trial Disabled)';
            } else if (visitor.isWhitelisted) {
                reason = 'ALLOWED (Whitelisted)';
            } else {
                const now = new Date();
                const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
                const isInitialTrialOver = (now - visitor.firstSeen) > sevenDaysMs;
                if (isInitialTrialOver && !visitor.isExtended) {
                    reason = 'LOCKED (Initial Trial Expired)';
                    locked = true;
                }
            }
            console.log('\nCalculated Status:', reason);
        } else {
            console.log('Visitor not found.');
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
