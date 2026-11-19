const User = require('../models/User');
const { comparePassword } = require('../utils/passwordService');
const { generateToken } = require('../utils/jwtService');

/**
 * Login endpoint - validates credentials and returns JWT token
 * POST /api/auth/login
 * @body {username: string, password: string}
 * @returns {token: string, username: string} on success
 * @returns {error: string} on failure
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Validate input - reject empty values
    if (!username || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required' });
    }

    if (!password || password.trim() === '') {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Query User model for username
    const user = await User.findOne({ username: username.trim() });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare password hash using passwordService
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token on success
    const token = generateToken(user.username);

    // Return token and username on success (200)
    return res.status(200).json({
      token,
      username: user.username
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

module.exports = {
  login
};
