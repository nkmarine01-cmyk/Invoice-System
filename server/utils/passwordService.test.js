const { hashPassword, comparePassword } = require('./passwordService');

describe('Password Service', () => {
  describe('hashPassword', () => {
    test('should hash a password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password); // Hash should not equal plain text
      expect(hash.length).toBeGreaterThan(0);
    });

    test('should generate different hashes for same password (due to salt)', async () => {
      const password = 'testpassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Different salts produce different hashes
    });

    test('should handle empty string password', async () => {
      const password = '';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('comparePassword', () => {
    test('should return true for matching password and hash', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      
      const isMatch = await comparePassword(password, hash);
      
      expect(isMatch).toBe(true);
    });

    test('should return false for non-matching password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hash = await hashPassword(password);
      
      const isMatch = await comparePassword(wrongPassword, hash);
      
      expect(isMatch).toBe(false);
    });

    test('should handle case-sensitive comparison', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);
      
      const isMatchCorrect = await comparePassword('TestPassword123', hash);
      const isMatchWrong = await comparePassword('testpassword123', hash);
      
      expect(isMatchCorrect).toBe(true);
      expect(isMatchWrong).toBe(false);
    });

    test('should return false for empty password against valid hash', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      
      const isMatch = await comparePassword('', hash);
      
      expect(isMatch).toBe(false);
    });
  });

  describe('Password hash round-trip', () => {
    test('should successfully hash and verify password (round-trip)', async () => {
      const password = 'mySecurePassword!123';
      
      // Hash the password
      const hash = await hashPassword(password);
      
      // Verify it matches
      const isValid = await comparePassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    test('should work with special characters', async () => {
      const password = 'P@ssw0rd!#$%^&*()';
      const hash = await hashPassword(password);
      const isValid = await comparePassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    test('should work with long passwords', async () => {
      const password = 'a'.repeat(72); // bcrypt limit is 72 characters
      const hash = await hashPassword(password);
      const isValid = await comparePassword(password, hash);
      
      expect(isValid).toBe(true);
    });
  });
});
