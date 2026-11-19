const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username cannot be more than 50 characters']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create unique index on username field
UserSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
