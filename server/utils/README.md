# Authentication Utilities

This directory contains utility services for authentication functionality.

## jwtService.js

Provides JWT token generation and verification utilities for user authentication.

### Functions

#### `generateToken(username)`
Generates a JWT token for the given username with 24-hour expiration.

**Parameters:**
- `username` (string): The username to encode in the token

**Returns:** JWT token string

**Throws:** Error if JWT_SECRET environment variable is not defined

**Example:**
```javascript
const { generateToken } = require('./utils/jwtService');
const token = generateToken('admin');
```

#### `verifyToken(token)`
Verifies and decodes a JWT token.

**Parameters:**
- `token` (string): The JWT token to verify

**Returns:** Decoded token payload containing username, iat (issued at), and exp (expiration)

**Throws:** 
- "Token has expired" - if token is expired
- "Invalid token" - if token is malformed or has invalid signature

**Example:**
```javascript
const { verifyToken } = require('./utils/jwtService');
try {
  const decoded = verifyToken(token);
  console.log(decoded.username); // 'admin'
} catch (error) {
  console.error('Token verification failed:', error.message);
}
```

## passwordService.js

Provides password hashing and comparison utilities using bcrypt.

### Functions

#### `hashPassword(password)`
Hashes a plain text password using bcrypt with 10 salt rounds.

**Parameters:**
- `password` (string): The plain text password to hash

**Returns:** Promise resolving to hashed password string

**Example:**
```javascript
const { hashPassword } = require('./utils/passwordService');
const hash = await hashPassword('myPassword123');
```

#### `comparePassword(password, hash)`
Compares a plain text password with a hashed password.

**Parameters:**
- `password` (string): The plain text password to compare
- `hash` (string): The hashed password to compare against

**Returns:** Promise resolving to boolean (true if passwords match, false otherwise)

**Example:**
```javascript
const { comparePassword } = require('./utils/passwordService');
const isValid = await comparePassword('myPassword123', storedHash);
if (isValid) {
  console.log('Password is correct');
}
```

## Environment Variables

Make sure to set the following environment variable in your `.env` file:

```
JWT_SECRET=your-secret-key-change-this-in-production-use-a-long-random-string
```

**Important:** Use a strong, random secret key in production. The JWT_SECRET should be at least 32 characters long and contain a mix of letters, numbers, and special characters.

## Testing

Unit tests are provided for both services:

```bash
# Test JWT service
npm test -- utils/jwtService.test.js

# Test password service
npm test -- utils/passwordService.test.js

# Test all utilities
npm test -- utils/
```

## Security Notes

1. **Password Hashing:** Uses bcrypt with 10 salt rounds, which provides strong protection against brute-force attacks.

2. **JWT Tokens:** Tokens expire after 24 hours to limit the window of vulnerability if a token is compromised.

3. **Secret Key:** The JWT_SECRET must be kept confidential and should never be committed to version control.

4. **Password Length:** bcrypt has a maximum password length of 72 characters. Longer passwords are truncated.
