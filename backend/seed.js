const mongoose = require('mongoose');
require('dotenv').config();

const productSchema = new mongoose.Schema({
    category: { type: String, required: true },
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    weightUnit: { type: String, required: true },
    premium: { type: Number, default: 0 },
    purity: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);

    const seedProducts = [
        { name: '1g', category: 'goldBars', weight: 1, weightUnit: 'g', premium: 0, purity: 1.0 },
        { name: '5g', category: 'goldBars', weight: 5, weightUnit: 'g', premium: 0, purity: 1.0 },
        { name: '10g', category: 'goldBars', weight: 10, weightUnit: 'g', premium: 0, purity: 1.0 },
        { name: '1 oz', category: 'goldBars', weight: 1, weightUnit: 'oz', premium: 0, purity: 1.0 },
        { name: '100g', category: 'goldBars', weight: 100, weightUnit: 'g', premium: 0, purity: 1.0 },
        { name: '1 kg', category: 'goldBars', weight: 1000, weightUnit: 'g', premium: 0, purity: 1.0 },

        { name: '1/4 oz', category: 'goldCoins', weight: 0.25, weightUnit: 'oz', premium: 40, purity: 1.0 },
        { name: '1/2 oz', category: 'goldCoins', weight: 0.5, weightUnit: 'oz', premium: 65, purity: 1.0 },
        { name: '1 oz', category: 'goldCoins', weight: 1, weightUnit: 'oz', premium: 110, purity: 1.0 },

        { name: '1 oz', category: 'silverBars', weight: 1, weightUnit: 'oz', premium: 2.5, purity: 1.0 },
        { name: '100g', category: 'silverBars', weight: 100, weightUnit: 'g', premium: 5, purity: 1.0 },
        { name: '1 kg', category: 'silverBars', weight: 1000, weightUnit: 'g', premium: 30, purity: 1.0 },

        { name: '24K', category: 'jewelry', weight: 1, weightUnit: 'g', premium: 0, purity: 1.0 },
        { name: '22K', category: 'jewelry', weight: 1, weightUnit: 'g', premium: 0, purity: 22 / 24 },
        { name: '21K', category: 'jewelry', weight: 1, weightUnit: 'g', premium: 0, purity: 21 / 24 },
        { name: '18K', category: 'jewelry', weight: 1, weightUnit: 'g', premium: 0, purity: 18 / 24 },
    ];

    const exists = await Product.findOne({ name: '1 kg', category: 'goldBars' });
    if (!exists) {
        await Product.insertMany(seedProducts);
        console.log("✅ Seeded default products manually.");
    } else {
        console.log("ℹ️ Default products already exist.");
    }

    process.exit(0);
}
seed();
