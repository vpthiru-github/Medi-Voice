const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient-enhanced');
const User = require('../models/User-enhanced');
const { auth } = require('../middleware/auth-patient');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new patient (only patients can register)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user account first
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: 'patient',
      phone,
      isActive: true,
      isEmailVerified: true
    });

    await user.save();
    console.log('User created:', { email: user.email, password: user.password });

    // Generate unique medicalRecordNumber
    const medicalRecordNumber = `MRN-${Date.now()}`;
    // Create patient profile linked to user (if not already exists)
    let savedPatient = await Patient.findOne({ userId: user._id });
    if (!savedPatient) {
      const patient = new Patient({
        userId: user._id,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || 'not-specified',
        bloodType: 'Unknown',
        medicalRecordNumber,
        emergencyContact: {
          name: 'Not provided',
          relationship: 'Not provided',
          phone: 'Not provided'
        }
      });
      savedPatient = await patient.save();
      console.log('Created Patient profile for user:', user.email, savedPatient._id);
    } else {
      console.log('Patient profile already exists for user:', user.email, savedPatient._id);
    }

    // Generate JWT token using user data
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: {
        patient: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error.errors) {
      for (const key in error.errors) {
        console.error(`Validation error for ${key}:`, error.errors[key].message);
      }
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login patient (only patients can login)
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email with patient role
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      role: 'patient'
    }).select('+password');
    
    if (!user) {
      console.log('Login attempt failed: user not found for email', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    console.log('Login attempt: found user', { email: user.email, password: user.password });

    // Check password
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get patient profile
    const patient = await Patient.findOne({ userId: user._id });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        patient: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          bloodType: patient?.bloodType || 'Unknown',
          gender: patient?.gender || 'not-specified'
        },
        token,
        dashboardRoute: '/dashboard'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile (any role)
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    // The authenticate middleware already sets req.user with user data
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If it's a patient, also get patient data
    let patientData = null;
    if (user.role === 'patient') {
      patientData = await Patient.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        patient: patientData ? {
          id: patientData._id,
          patientId: patientData.patientId,
          medicalRecordNumber: patientData.medicalRecordNumber,
          bloodType: patientData.bloodType,
          gender: patientData.gender,
          status: patientData.status
        } : null
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

module.exports = router;