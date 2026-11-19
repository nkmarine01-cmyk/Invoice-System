const { generateToken, verifyToken } = require('./jwtService');

// Set up environment variable for testing
process.env.JWT_SECRET = 'test-secret-key';

describe('JWT Service', () => {
  describe('generateToken', () => {
    test('should generate a valid JWT token for a username', () => {
      const username = 'testuser';
      const token = generateToken(username);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts separated by dots
    });

    test('should throw error if JWT_SECRET is not defined', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      expect(() => generateToken('testuser')).toThrow('JWT_SECRET is not defined');
      
      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('verifyToken', () => {
    test('should verify and decode a valid token', () => {
      const username = 'testuser';
      const token = generateToken(username);
      
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.username).toBe(username);
      expect(decoded.iat).toBeDefined(); // issued at
      expect(decoded.exp).toBeDefined(); // expiration
    });

    test('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.string';
      
      expect(() => verifyToken(invalidToken)).toThrow('Invalid token');
    });

    test('should throw error for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';
      
      expect(() => verifyToken(malformedToken)).toThrow('Invalid token');
    });

    test('should throw error if JWT_SECRET is not defined', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      expect(() => verifyToken('some.token.here')).toThrow('JWT_SECRET is not defined');
      
      process.env.JWT_SECRET = originalSecret;
    });

    test('should decode username from token correctly (round-trip)', () => {
      const username = 'admin';
      const token = generateToken(username);
      const decoded = verifyToken(token);
      
      expect(decoded.username).toBe(username);
    });
  });

  describe('Token expiration', () => {
    test('should set expiration to 24 hours', () => {
      const username = 'testuser';
      const token = generateToken(username);
      const decoded = verifyToken(token);
      
      const issuedAt = decoded.iat;
      const expiresAt = decoded.exp;
      const duration = expiresAt - issuedAt;
      
      // 24 hours = 86400 seconds
      expect(duration).toBe(86400);
    });
  });
});
