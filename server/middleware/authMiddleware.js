const { verifyToken } = require('../utils/jwtService');

/**
 * Authentication middleware
 * Validates JWT token from Authorization header
 * Attaches decoded user data to req.user
 */
function authMiddleware(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Attach user data to request
    req.user = decoded;
    
    // Proceed to next middleware/route handler
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.message === 'Token has expired') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.message === 'Invalid token') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = authMiddleware;
