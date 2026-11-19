const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * ONE-TIME SETUP ENDPOINT
 * This endpoint creates an admin user if none exists
 * For security, it only works if no users exist in the database
 * 
 * POST /api/setup/init
 * @returns {success: boolean, message: string}
 */
router.post('/init', async (req, res) => {
  try {
    console.log('Setup endpoint called...');
    
    // Check if any users exist
    const userCount = await User.countDocuments();
    
    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Setup already completed. Admin user exists.'
      });
    }
    
    // Create default admin user
    const username = 'admin';
    const password = 'admin123';
    
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const user = new User({
      username,
      passwordHash,
      createdAt: new Date(),
      role: 'admin'
    });
    
    await user.save();
    
    console.log('Admin user created via setup endpoint');
    
    return res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      credentials: {
        username: 'admin',
        password: 'admin123',
        warning: 'Please change password after first login!'
      }
    });
    
  } catch (error) {
    console.error('Setup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Setup failed',
      error: error.message
    });
  }
});

/**
 * Health check endpoint
 * GET /api/setup/status
 */
router.get('/status', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const adminExists = userCount > 0;
    
    res.json({
      success: true,
      setupCompleted: adminExists,
      userCount,
      message: adminExists 
        ? 'Admin user exists. System ready.' 
        : 'No users found. Run POST /api/setup/init to create admin user.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Status check failed',
      error: error.message
    });
  }
});

module.exports = router;
