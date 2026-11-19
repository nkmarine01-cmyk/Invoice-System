const { login } = require('./authController');
const User = require('../models/User');
const { comparePassword } = require('../utils/passwordService');
const { generateToken } = require('../utils/jwtService');

// Mock dependencies
jest.mock('../models/User');
jest.mock('../utils/passwordService');
jest.mock('../utils/jwtService');

describe('AuthController - login', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    test('should return 400 when username is missing', async () => {
      req.body = { password: 'testpass' };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Username is required' });
    });

    test('should return 400 when username is empty string', async () => {
      req.body = { username: '', password: 'testpass' };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Username is required' });
    });

    test('should return 400 when username is only whitespace', async () => {
      req.body = { username: '   ', password: 'testpass' };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Username is required' });
    });

    test('should return 400 when password is missing', async () => {
      req.body = { username: 'testuser' };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Password is required' });
    });

    test('should return 400 when password is empty string', async () => {
      req.body = { username: 'testuser', password: '' };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Password is required' });
    });

    test('should return 400 when password is only whitespace', async () => {
      req.body = { username: 'testuser', password: '   ' };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Password is required' });
    });
  });

  describe('Authentication', () => {
    test('should return 401 when user not found', async () => {
      req.body = { username: 'nonexistent', password: 'testpass' };
      User.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ username: 'nonexistent' });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid username or password' });
    });

    test('should return 401 when password is invalid', async () => {
      req.body = { username: 'testuser', password: 'wrongpass' };
      const mockUser = {
        username: 'testuser',
        passwordHash: 'hashedpassword'
      };
      User.findOne.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(false);

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(comparePassword).toHaveBeenCalledWith('wrongpass', 'hashedpassword');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid username or password' });
    });

    test('should return 200 with token and username when credentials are valid', async () => {
      req.body = { username: 'testuser', password: 'correctpass' };
      const mockUser = {
        username: 'testuser',
        passwordHash: 'hashedpassword'
      };
      const mockToken = 'jwt.token.here';
      
      User.findOne.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(true);
      generateToken.mockReturnValue(mockToken);

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(comparePassword).toHaveBeenCalledWith('correctpass', 'hashedpassword');
      expect(generateToken).toHaveBeenCalledWith('testuser');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: mockToken,
        username: 'testuser'
      });
    });

    test('should trim username before database lookup', async () => {
      req.body = { username: '  testuser  ', password: 'correctpass' };
      const mockUser = {
        username: 'testuser',
        passwordHash: 'hashedpassword'
      };
      const mockToken = 'jwt.token.here';
      
      User.findOne.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(true);
      generateToken.mockReturnValue(mockToken);

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Error Handling', () => {
    test('should return 500 when database query fails', async () => {
      req.body = { username: 'testuser', password: 'testpass' };
      User.findOne.mockRejectedValue(new Error('Database connection failed'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error. Please try again.' });
    });

    test('should return 500 when password comparison fails', async () => {
      req.body = { username: 'testuser', password: 'testpass' };
      const mockUser = {
        username: 'testuser',
        passwordHash: 'hashedpassword'
      };
      User.findOne.mockResolvedValue(mockUser);
      comparePassword.mockRejectedValue(new Error('Bcrypt error'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error. Please try again.' });
    });

    test('should return 500 when token generation fails', async () => {
      req.body = { username: 'testuser', password: 'testpass' };
      const mockUser = {
        username: 'testuser',
        passwordHash: 'hashedpassword'
      };
      User.findOne.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(true);
      generateToken.mockImplementation(() => {
        throw new Error('JWT generation failed');
      });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error. Please try again.' });
    });
  });
});
