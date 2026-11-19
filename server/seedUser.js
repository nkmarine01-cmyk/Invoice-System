/**
 * Seed Script for Initial User Creation
 * 
 * This script creates the initial owner/admin user for the M Marine Services
 * invoice management system. It should be run once during initial setup.
 * 
 * Usage:
 *   npm run seed:user
 * 
 * Default Credentials:
 *   Username: admin
 *   Password: admin123
 * 
 * IMPORTANT: Change the default password after first login in production!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Main seed function
const seedUser = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ username: 'admin' });
    
    if (existingUser) {
      console.log('⚠️  User already exists! Skipping creation.');
      console.log('Username: admin');
      console.log('If you need to reset the password, delete the user first.');
      process.exit(0);
    }

    // Default credentials
    const username = 'admin';
    const password = 'admin123';

    // Hash the password
    console.log('Hashing password...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user document
    const user = new User({
      username,
      passwordHash
    });

    // Save to database
    await user.save();

    console.log('✅ Initial user created successfully!');
    console.log('');
    console.log('Login Credentials:');
    console.log('==================');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login in production!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedUser();
