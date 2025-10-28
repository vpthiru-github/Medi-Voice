const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
  // Basic Information (previously in User model)
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number']
  },
  
  // Professional Information
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true,
    enum: {
      values: [
        'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
        'Hematology', 'Infectious Disease', 'Nephrology', 'Neurology',
        'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry',
        'Pulmonology', 'Radiology', 'Surgery', 'Urology',
        'Family Medicine', 'Internal Medicine', 'Emergency Medicine',
        'Anesthesiology', 'Pathology', 'Obstetrics and Gynecology',
        'Ophthalmology', 'ENT', 'Plastic Surgery', 'General Practice'
      ],
      message: 'Please select a valid specialization'
    }
  },
  
  hospital: {
    type: String,
    required: [true, 'Hospital/Clinic name is required'],
    trim: true,
    maxlength: [100, 'Hospital name cannot exceed 100 characters']
  },
  
  // Medical Credentials
  licenseNumber: {
    type: String,
    required: [true, 'Medical license number is required'],
    unique: true,
    trim: true
  },
  
  // Experience and Consultation
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Experience cannot be negative'],
    max: [60, 'Experience cannot exceed 60 years']
  },
  
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: [0, 'Consultation fee cannot be negative']
  },
  
  consultationDuration: {
    type: Number,
    default: 30, // minutes
    min: [15, 'Consultation duration must be at least 15 minutes'],
    max: [180, 'Consultation duration cannot exceed 3 hours']
  },
  
  // Rating System
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  
  totalReviews: {
    type: Number,
    default: 0
  },
  
  // Availability and Schedule
  workingHours: {
    monday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      isAvailable: { type: Boolean, default: true }
    },
    tuesday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      isAvailable: { type: Boolean, default: true }
    },
    wednesday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      isAvailable: { type: Boolean, default: true }
    },
    thursday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      isAvailable: { type: Boolean, default: true }
    },
    friday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      isAvailable: { type: Boolean, default: true }
    },
    saturday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '13:00' },
      isAvailable: { type: Boolean, default: false }
    },
    sunday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '13:00' },
      isAvailable: { type: Boolean, default: false }
    }
  },
  
  // Professional Details
  qualifications: [{
    type: String,
    default: ['MBBS', 'MD']
  }],
  
  languages: [{
    type: String,
    default: ['English']
  }],
  
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  
  // Office Information
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isAcceptingNewPatients: {
    type: Boolean,
    default: true
  },
  
  // Statistics
  totalPatients: {
    type: Number,
    default: 0
  },
  
  totalAppointments: {
    type: Number,
    default: 0
  },
  
  completedAppointments: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  lastActiveDate: {
    type: Date,
    default: Date.now
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
doctorSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for formatted consultation fee
doctorSchema.virtual('formattedConsultationFee').get(function() {
  return `$${this.consultationFee}`;
});

// Indexes
doctorSchema.index({ email: 1 }, { unique: true });
doctorSchema.index({ licenseNumber: 1 }, { unique: true });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ hospital: 1 });
doctorSchema.index({ isActive: 1 });
doctorSchema.index({ isAvailable: 1 });
doctorSchema.index({ isVerified: 1 });
doctorSchema.index({ rating: -1 });
doctorSchema.index({ experience: -1 });
doctorSchema.index({ consultationFee: 1 });

// Pre-save middleware to hash password
doctorSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to check password
doctorSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to update rating
doctorSchema.methods.updateRating = function(newRating) {
  if (newRating < 1 || newRating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  // Simple average calculation
  const totalRating = (this.rating * this.totalReviews) + newRating;
  this.totalReviews += 1;
  this.rating = totalRating / this.totalReviews;
  
  return this.save();
};

// Instance method to check availability for a specific date and time
doctorSchema.methods.isAvailableAt = function(dateTime) {
  const date = new Date(dateTime);
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
  const timeString = date.toTimeString().substring(0, 5); // HH:MM format
  
  const daySchedule = this.workingHours[dayOfWeek];
  
  if (!daySchedule.isAvailable) {
    return false;
  }
  
  // Check if time is within working hours
  if (timeString < daySchedule.start || timeString > daySchedule.end) {
    return false;
  }
  
  return true;
};

// Static method to find doctors by specialization
doctorSchema.statics.findBySpecialization = function(specialization) {
  return this.find({ 
    specialization: new RegExp(specialization, 'i'),
    isActive: true,
    isVerified: true 
  });
};

// Static method to find available doctors
doctorSchema.statics.findAvailable = function() {
  return this.find({ 
    isActive: true,
    isAvailable: true,
    isAcceptingNewPatients: true,
    isVerified: true 
  });
};

// Static method to get top-rated doctors
doctorSchema.statics.findTopRated = function(limit = 10) {
  return this.find({ 
    isActive: true,
    isVerified: true 
  })
    .sort({ rating: -1, totalReviews: -1 })
    .limit(limit);
};

module.exports = mongoose.model('DoctorStandalone', doctorSchema);
