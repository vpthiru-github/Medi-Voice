const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'staff', 'admin'],
    default: 'patient'
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate access token
userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { 
      userId: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET || 'fallback-secret',
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      issuer: 'medi-hub-api'
    }
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { 
      userId: this._id,
      tokenType: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: 'medi-hub-api'
    }
  );
};

// Check if profile is complete
userSchema.methods.isProfileComplete = function() {
  return !!(this.firstName && this.lastName && this.email && this.phone);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
