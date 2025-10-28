const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  // User Reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true
  },
  
  // Basic Information
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true
  },
  
  subSpecialties: [{
    type: String,
    trim: true
  }],
  
  qualifications: [{
    degree: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    country: String
  }],
  
  yearsOfExperience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Years of experience cannot be negative']
  },
  
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  
  languages: [{
    type: String,
    trim: true
  }],
  
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: [0, 'Consultation fee cannot be negative']
  },
  
  consultationDuration: {
    type: Number,
    default: 30,
    min: [15, 'Consultation duration must be at least 15 minutes'],
    max: [180, 'Consultation duration cannot exceed 3 hours']
  },
  
  // Working Hours
  workingHours: {
    monday: {
      isWorking: { type: Boolean, default: false },
      startTime: String,
      endTime: String,
      breakStart: String,
      breakEnd: String
    },
    tuesday: {
      isWorking: { type: Boolean, default: false },
      startTime: String,
      endTime: String,
      breakStart: String,
      breakEnd: String
    },
    wednesday: {
      isWorking: { type: Boolean, default: false },
      startTime: String,
      endTime: String,
      breakStart: String,
      breakEnd: String
    },
    thursday: {
      isWorking: { type: Boolean, default: false },
      startTime: String,
      endTime: String,
      breakStart: String,
      breakEnd: String
    },
    friday: {
      isWorking: { type: Boolean, default: false },
      startTime: String,
      endTime: String,
      breakStart: String,
      breakEnd: String
    },
    saturday: {
      isWorking: { type: Boolean, default: false },
      startTime: String,
      endTime: String,
      breakStart: String,
      breakEnd: String
    },
    sunday: {
      isWorking: { type: Boolean, default: false },
      startTime: String,
      endTime: String,
      breakStart: String,
      breakEnd: String
    }
  },
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  acceptsNewPatients: {
    type: Boolean,
    default: true
  },
  
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  
  roomNumber: {
    type: String,
    trim: true
  },
  
  // Hospital Affiliations
  hospitalAffiliations: [{
    hospitalName: String,
    position: String,
    startDate: Date,
    endDate: Date,
    isCurrent: { type: Boolean, default: false }
  }],
  
  // Awards
  awards: [{
    title: String,
    organization: String,
    year: Number,
    description: String
  }],
  
  // Publications
  publications: [{
    title: String,
    journal: String,
    year: Number,
    doi: String,
    url: String
  }],
  
  // Rating
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
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
  
  // Verification
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  
  verifiedAt: Date,
  
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  
  // Unavailable Dates
  unavailableDates: [{
    date: {
      type: Date,
      required: true
    },
    reason: String,
    isFullDay: {
      type: Boolean,
      default: true
    },
    startTime: String,
    endTime: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
doctorSchema.index({ user: 1 });
doctorSchema.index({ licenseNumber: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ department: 1 });
doctorSchema.index({ isAvailable: 1 });
doctorSchema.index({ acceptsNewPatients: 1 });
doctorSchema.index({ verificationStatus: 1 });
doctorSchema.index({ 'rating.average': -1 });
doctorSchema.index({ createdAt: -1 });

// Compound indexes for common queries
doctorSchema.index({ specialization: 1, isAvailable: 1, acceptsNewPatients: 1 });
doctorSchema.index({ department: 1, isAvailable: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);