import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: 'd:/Work/SPM/live/backend/.env' });

const Visitor = mongoose.model('Visitor', new mongoose.Schema({}, { strict: false }));
const Settings = mongoose.model('Settings', new mongoose.Schema({}, { strict: false }));

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const settings = await Settings.findOne();
        console.log('--- GLOBAL STATUS ---');
        console.log('trialEnabled:', settings ? settings.trialEnabled : 'MISSING');
        
        const visitors = await Visitor.find();
        console.log('\n--- VISITORS AUDIT ---');
        visitors.forEach(v => {
            const whitelisted = !!v.isWhitelisted;
            const expired = !!v.expiredAt;
            const fingerprint = v.fingerprint || 'MISSING';
            const name = v.name || 'Anonymous';
            
            console.log(`[${fingerprint.substring(0, 8)}...] Name: ${name} | WL: ${whitelisted} | Expired: ${expired}`);
        });
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
