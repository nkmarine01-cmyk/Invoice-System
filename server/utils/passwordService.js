const bcrypt = require('bcryptjs');

/**
 * Hash a plain text password using bcrypt
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - The plain text password to compare
 * @param {string} hash - The hashed password to compare against
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
async function comparePassword(password, hash) {
  const isMatch = await bcrypt.compare(password, hash);
  return isMatch;
}

module.exports = {
  hashPassword,
  comparePassword
};
