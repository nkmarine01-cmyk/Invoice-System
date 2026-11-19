/**
 * Unit tests for seed script functionality
 * Tests bcrypt hashing and password verification
 */

const bcrypt = require('bcryptjs');

describe('Seed Script Password Hashing', () => {
  test('bcrypt should hash password and verify correctly', async () => {
    const password = 'admin123';
    const saltRounds = 10;
    
    // Hash the password
    const hash = await bcrypt.hash(password, saltRounds);
    
    // Verify hash is not the same as password
    expect(hash).not.toBe(password);
    
    // Verify hash starts with bcrypt identifier
    expect(hash).toMatch(/^\$2[aby]\$/);
    
    // Verify password comparison returns true for correct password
    const isValid = await bcrypt.compare(password, hash);
    expect(isValid).toBe(true);
    
    // Verify password comparison returns false for incorrect password
    const isInvalid = await bcrypt.compare('wrongpassword', hash);
    expect(isInvalid).toBe(false);
  });

  test('bcrypt should generate different hashes for same password', async () => {
    const password = 'admin123';
    const saltRounds = 10;
    
    // Hash the same password twice
    const hash1 = await bcrypt.hash(password, saltRounds);
    const hash2 = await bcrypt.hash(password, saltRounds);
    
    // Hashes should be different due to different salts
    expect(hash1).not.toBe(hash2);
    
    // Both hashes should verify the same password
    const isValid1 = await bcrypt.compare(password, hash1);
    const isValid2 = await bcrypt.compare(password, hash2);
    expect(isValid1).toBe(true);
    expect(isValid2).toBe(true);
  });

  test('bcrypt should handle various password lengths', async () => {
    const passwords = [
      'a',           // 1 character
      'abc',         // 3 characters (minimum username length)
      'admin123',    // 8 characters (typical)
      'A'.repeat(50), // 50 characters (maximum username length)
      'A'.repeat(72)  // 72 characters (bcrypt limit)
    ];

    for (const password of passwords) {
      const hash = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    }
  });
});
