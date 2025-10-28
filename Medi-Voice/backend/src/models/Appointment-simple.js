const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Appointment Identification
  appointmentNumber: {
    type: String
    // Note: Will be auto-generated in pre-save middleware
  },
  
  // Participants
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient reference is required']
  },
  
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor reference is required']
  },
  
  // Scheduling Information
  scheduledTime: {
    type: Date,
    required: [true, 'Scheduled time is required'],
    validate: {
      validator: function(value) {
        // Allow appointments to be scheduled for today or future dates
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        return new Date(value) >= today;
      },
      message: 'Scheduled time cannot be in the past'
    }
  },
  
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [180, 'Duration cannot exceed 3 hours'],
    default: 30
  },
  
  // Appointment Details
  appointmentType: {
    type: String,
    required: [true, 'Appointment type is required'],
    enum: {
      values: ['consultation', 'follow-up', 'check-up', 'emergency', 'second-opinion'],
      message: 'Invalid appointment type'
    },
    default: 'consultation'
  },
  
  reason: {
    type: String,
    required: [true, 'Reason for appointment is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // Status Management
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      message: 'Invalid appointment status'
    },
    default: 'scheduled'
  },
  
  // Financial Information
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: [0, 'Consultation fee cannot be negative']
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'cancelled'],
    default: 'pending'
  },
  
  // Timing
  actualStartTime: Date,
  actualEndTime: Date,
  
  // Cancellation
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'system', 'admin']
  },
  cancellationDate: Date,
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate appointment number before saving
appointmentSchema.pre('save', async function(next) {
  if (this.isNew && !this.appointmentNumber) {
    const count = await this.constructor.countDocuments();
    this.appointmentNumber = `APT-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Virtual for appointment duration in hours
appointmentSchema.virtual('durationInHours').get(function() {
  return this.duration / 60;
});

// Virtual for formatted scheduled time
appointmentSchema.virtual('formattedScheduledTime').get(function() {
  return this.scheduledTime.toLocaleString();
});

// Indexes
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ scheduledTime: 1 });
appointmentSchema.index({ appointmentType: 1 });
appointmentSchema.index({ createdAt: -1 });

// Populate doctor and patient info on find
appointmentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'doctor',
    select: 'firstName lastName specialization consultationFee hospital phone email'
  }).populate({
    path: 'patient',
    select: 'firstName lastName email phone'
  });
  next();
});

// Instance method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const scheduledTime = new Date(this.scheduledTime);
  const timeDifference = scheduledTime - now;
  const hoursUntilAppointment = timeDifference / (1000 * 60 * 60);
  
  return hoursUntilAppointment > 24 && ['scheduled', 'confirmed'].includes(this.status);
};

// Instance method to cancel appointment
appointmentSchema.methods.cancel = function(reason, cancelledBy) {
  if (!this.canBeCancelled()) {
    throw new Error('Appointment cannot be cancelled at this time');
  }
  
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
  this.cancellationDate = new Date();
  
  return this.save();
};

// Static method to find appointments by date range
appointmentSchema.statics.findByDateRange = function(startDate, endDate, doctorId = null) {
  const query = {
    scheduledTime: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  if (doctorId) {
    query.doctor = doctorId;
  }
  
  return this.find(query);
};

// Static method to find upcoming appointments
appointmentSchema.statics.findUpcoming = function(patientId = null, doctorId = null) {
  const query = {
    scheduledTime: { $gte: new Date() },
    status: { $in: ['scheduled', 'confirmed'] }
  };
  
  if (patientId) query.patient = patientId;
  if (doctorId) query.doctor = doctorId;
  
  return this.find(query).sort({ scheduledTime: 1 });
};

module.exports = mongoose.model('AppointmentSimple', appointmentSchema);
