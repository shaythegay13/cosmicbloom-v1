require('dotenv').config();
const mongoose = require('mongoose');
const { seedCharities } = require('../utils/seedData');

async function seed() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Seed data
        await seedCharities();

        console.log('🌱 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
