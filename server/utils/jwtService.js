const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a given username
 * @param {string} username - The username to encode in the token
 * @returns {string} JWT token with 24-hour expiration
 */
function generateToken(username) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const token = jwt.sign(
    { username },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return token;
}

/**
 * Verify and decode a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {object} Decoded token payload containing username
 * @throws {Error} If token is invalid, expired, or malformed
 */
function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    // Re-throw with more specific error messages
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

module.exports = {
  generateToken,
  verifyToken
};
