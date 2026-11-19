const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Auto-setup function that runs on server start
 * Creates default admin user if no users exist in database
 */
async function autoSetup() {
  try {
    console.log('🔍 Checking if admin user exists...');
    
    // Count users in database
    const userCount = await User.countDocuments();
    
    if (userCount > 0) {
      console.log('✅ Admin user already exists. Skipping auto-setup.');
      return;
    }
    
    console.log('⚙️  No users found. Creating default admin user...');
    
    // Create default admin user
    const username = 'admin';
    const password = 'admin123';
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const user = new User({
      username,
      passwordHash,
      createdAt: new Date(),
      role: 'admin'
    });
    
    await user.save();
    
    console.log('✅ Default admin user created successfully!');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('  DEFAULT LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('═══════════════════════════════════════');
    console.log('  ⚠️  IMPORTANT: Change password after first login!');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error in auto-setup:', error.message);
    // Don't throw - allow server to continue starting
  }
}

module.exports = { autoSetup };
