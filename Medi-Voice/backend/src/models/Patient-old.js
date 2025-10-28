const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const patientSchema = new mongoose.Schema({
  // User authentication fields
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
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  
  phone: {
    type: String,
    trim: true
  },
  
  dateOfBirth: {
    type: Date
  },
  
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  
  role: {
    type: String,
    default: 'patient'
  },
  
  patientId: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true
  },
  
  emergencyContact: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  
  primaryDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'deceased', 'transferred'],
    default: 'active'
  },
  
  totalAppointments: {
    type: Number,
    default: 0
  },
  
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

patientSchema.index({ email: 1 }, { unique: true });
patientSchema.index({ patientId: 1 }, { unique: true, sparse: true });

// Hash password before saving
patientSchema.pre('save', async function(next) {
  // Generate patientId if not exists
  if (!this.patientId) {
    const count = await this.constructor.countDocuments();
    this.patientId = 'PAT' + String(count + 1).padStart(6, '0');
  }
  
  // Hash password if it's modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  next();
});

// Method to compare password
patientSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Patient', patientSchema);
