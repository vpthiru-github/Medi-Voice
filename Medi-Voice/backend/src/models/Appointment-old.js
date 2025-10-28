const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Appointment Identification
  appointmentId: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true
  },
  
  // Core References
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
    index: true
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: 15,
    max: 180,
    default: 30
  },
  timeZone: {
    type: String,
    default: 'America/New_York'
  },
  
  // Appointment Details
  type: {
    type: String,
    enum: [
      'routine-checkup',
      'follow-up',
      'consultation',
      'emergency',
      'surgery',
      'diagnostic',
      'preventive',
      'specialist-referral',
      'second-opinion',
      'telemedicine',
      'vaccination',
      'lab-review',
      'therapy',
      'other'
    ],
    required: [true, 'Appointment type is required'],
    default: 'routine-checkup'
  },
  
  appointmentMethod: {
    type: String,
    enum: ['in-person', 'video-call', 'phone-call'],
    default: 'in-person'
  },
  
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent', 'emergency'],
    default: 'normal'
  },
  
  // Status Management
  status: {
    type: String,
    enum: [
      'scheduled',
      'confirmed',
      'checked-in',
      'in-progress',
      'completed',
      'cancelled',
      'no-show',
      'rescheduled'
    ],
    default: 'scheduled',
    index: true
  },
  
  statusHistory: [{
    status: {
      type: String,
      enum: [
        'scheduled',
        'confirmed',
        'checked-in',
        'in-progress',
        'completed',
        'cancelled',
        'no-show',
        'rescheduled'
      ],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  
  // Appointment Purpose and Details
  chiefComplaint: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  symptoms: [{
    symptom: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'mild'
    },
    duration: {
      type: String,
      trim: true
    },
    frequency: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  
  reasonForVisit: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Referral Information
  referral: {
    isReferral: {
      type: Boolean,
      default: false
    },
    referringDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    referralReason: {
      type: String,
      trim: true
    },
    referralDate: Date,
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'stat'],
      default: 'routine'
    }
  },
  
  // Insurance and Billing
  insurance: {
    provider: {
      type: String,
      trim: true
    },
    policyNumber: {
      type: String,
      trim: true
    },
    groupNumber: {
      type: String,
      trim: true
    },
    copay: {
      type: Number,
      min: 0
    },
    authorizationRequired: {
      type: Boolean,
      default: false
    },
    authorizationNumber: {
      type: String,
      trim: true
    },
    isPreAuthorized: {
      type: Boolean,
      default: false
    }
  },
  
  // Financial Information
  billing: {
    estimatedCost: {
      type: Number,
      min: 0
    },
    actualCost: {
      type: Number,
      min: 0
    },
    copayAmount: {
      type: Number,
      min: 0
    },
    deductibleAmount: {
      type: Number,
      min: 0
    },
    insuranceCoverage: {
      type: Number,
      min: 0,
      max: 100
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'insurance-pending', 'denied'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'check', 'online'],
      trim: true
    }
  },
  
  // Location Information
  location: {
    facilityName: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'USA' }
    },
    room: {
      type: String,
      trim: true
    },
    floor: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    parkingInstructions: {
      type: String,
      trim: true
    }
  },
  
  // Pre-appointment Requirements
  preAppointmentRequirements: {
    fasting: {
      required: { type: Boolean, default: false },
      hours: { type: Number, min: 0 },
      instructions: { type: String, trim: true }
    },
    medications: {
      takeRegularMeds: { type: Boolean, default: true },
      specialInstructions: { type: String, trim: true }
    },
    documentsNeeded: [{
      type: String,
      trim: true
    }],
    preparationInstructions: {
      type: String,
      trim: true
    }
  },
  
  // Check-in Information
  checkIn: {
    checkedInAt: Date,
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    actualArrivalTime: Date,
    waitTime: {
      type: Number,
      min: 0
    },
    vitalSigns: {
      bloodPressure: {
        systolic: Number,
        diastolic: Number
      },
      heartRate: Number,
      temperature: {
        value: Number,
        unit: { type: String, enum: ['celsius', 'fahrenheit'], default: 'fahrenheit' }
      },
      weight: {
        value: Number,
        unit: { type: String, enum: ['lbs', 'kg'], default: 'lbs' }
      },
      height: {
        value: Number,
        unit: { type: String, enum: ['inches', 'cm'], default: 'inches' }
      },
      oxygenSaturation: Number,
      painLevel: {
        type: Number,
        min: 0,
        max: 10
      }
    }
  },
  
  // Appointment Outcome
  outcome: {
    diagnosis: [{
      code: String,
      description: String,
      isPrimary: { type: Boolean, default: false }
    }],
    treatment: {
      type: String,
      trim: true
    },
    prescriptions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription'
    }],
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpInstructions: {
      type: String,
      trim: true
    },
    nextAppointment: {
      recommended: { type: Boolean, default: false },
      timeframe: { type: String, trim: true },
      reason: { type: String, trim: true }
    },
    referrals: [{
      specialty: String,
      doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
      reason: String,
      urgency: { type: String, enum: ['routine', 'urgent', 'stat'], default: 'routine' }
    }],
    labOrders: [{
      testName: String,
      labCode: String,
      instructions: String,
      urgency: { type: String, enum: ['routine', 'urgent', 'stat'], default: 'routine' }
    }]
  },
  
  // Notifications and Reminders
  reminders: {
    emailReminders: [{
      type: { type: String, enum: ['24-hour', '2-hour', 'custom'] },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      customTime: Date
    }],
    smsReminders: [{
      type: { type: String, enum: ['24-hour', '2-hour', 'custom'] },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      customTime: Date
    }],
    phoneReminders: [{
      type: { type: String, enum: ['24-hour', '2-hour', 'custom'] },
      completed: { type: Boolean, default: false },
      completedAt: Date,
      customTime: Date
    }]
  },
  
  // Cancellation Information
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: [
        'patient-request',
        'doctor-unavailable',
        'emergency',
        'illness',
        'scheduling-conflict',
        'insurance-issue',
        'weather',
        'facility-closure',
        'other'
      ]
    },
    notes: {
      type: String,
      trim: true
    },
    refundAmount: {
      type: Number,
      min: 0
    },
    reschedulingOffered: {
      type: Boolean,
      default: true
    }
  },
  
  // Quality and Feedback
  feedback: {
    patientSatisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: {
        type: String,
        trim: true
      },
      submittedAt: Date
    },
    doctorNotes: {
      type: String,
      trim: true
    },
    staffNotes: {
      type: String,
      trim: true
    }
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
appointmentSchema.index({ patient: 1, scheduledTime: -1 });
appointmentSchema.index({ doctor: 1, scheduledTime: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentId: 1 }, { unique: true, sparse: true });
appointmentSchema.index({ scheduledTime: 1 });
appointmentSchema.index({ type: 1 });
appointmentSchema.index({ priority: 1 });
appointmentSchema.index({ 'referral.referringDoctor': 1 });

// Virtual properties
appointmentSchema.virtual('isUpcoming').get(function() {
  return this.scheduledTime > new Date() && ['scheduled', 'confirmed'].includes(this.status);
});

appointmentSchema.virtual('isPast').get(function() {
  return this.scheduledTime < new Date();
});

appointmentSchema.virtual('actualDuration').get(function() {
  if (this.checkIn && this.checkIn.checkedInAt && this.endTime) {
    return Math.round((this.endTime - this.checkIn.checkedInAt) / (1000 * 60));
  }
  return null;
});

appointmentSchema.virtual('isOverdue').get(function() {
  return this.scheduledTime < new Date() && ['scheduled', 'confirmed', 'checked-in'].includes(this.status);
});

appointmentSchema.virtual('canBeCancelled').get(function() {
  const now = new Date();
  const timeDiff = this.scheduledTime - now;
  const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);
  return hoursUntilAppointment > 24 && ['scheduled', 'confirmed'].includes(this.status);
});

// Pre-save middleware to generate appointment ID
appointmentSchema.pre('save', async function(next) {
  if (!this.appointmentId) {
    const count = await this.constructor.countDocuments();
    this.appointmentId = `APT${String(count + 1).padStart(8, '0')}`;
  }
  
  // Calculate end time if not provided
  if (!this.endTime && this.scheduledTime && this.duration) {
    this.endTime = new Date(this.scheduledTime.getTime() + (this.duration * 60 * 1000));
  }
  
  next();
});

// Pre-save middleware to update status history
appointmentSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this.lastModifiedBy
    });
  }
  next();
});

// Instance methods
appointmentSchema.methods.performCheckIn = function(vitalSigns, checkedInBy) {
  this.status = 'checked-in';
  this.checkIn = {
    checkedInAt: new Date(),
    checkedInBy: checkedInBy,
    actualArrivalTime: new Date(),
    vitalSigns: vitalSigns
  };
  
  // Calculate wait time
  if (this.scheduledTime) {
    this.checkIn.waitTime = Math.max(0, (this.checkIn.actualArrivalTime - this.scheduledTime) / (1000 * 60));
  }
  
  return this.save();
};

appointmentSchema.methods.startAppointment = function(startedBy) {
  this.status = 'in-progress';
  this.lastModifiedBy = startedBy;
  return this.save();
};

appointmentSchema.methods.completeAppointment = function(outcomeData, completedBy) {
  this.status = 'completed';
  this.outcome = { ...this.outcome, ...outcomeData };
  this.lastModifiedBy = completedBy;
  this.endTime = new Date();
  return this.save();
};

appointmentSchema.methods.cancelAppointment = function(cancellationData, cancelledBy) {
  this.status = 'cancelled';
  this.cancellation = {
    ...cancellationData,
    cancelledAt: new Date(),
    cancelledBy: cancelledBy
  };
  this.lastModifiedBy = cancelledBy;
  return this.save();
};

appointmentSchema.methods.reschedule = function(newDateTime, rescheduledBy, reason) {
  const oldDateTime = this.scheduledTime;
  this.scheduledTime = newDateTime;
  this.endTime = new Date(newDateTime.getTime() + (this.duration * 60 * 1000));
  this.status = 'rescheduled';
  this.lastModifiedBy = rescheduledBy;
  
  this.statusHistory.push({
    status: 'rescheduled',
    timestamp: new Date(),
    updatedBy: rescheduledBy,
    reason: reason,
    notes: `Rescheduled from ${oldDateTime.toISOString()} to ${newDateTime.toISOString()}`
  });
  
  return this.save();
};

appointmentSchema.methods.markNoShow = function(markedBy, reason) {
  this.status = 'no-show';
  this.lastModifiedBy = markedBy;
  this.statusHistory.push({
    status: 'no-show',
    timestamp: new Date(),
    updatedBy: markedBy,
    reason: reason || 'Patient did not show up for appointment'
  });
  return this.save();
};

appointmentSchema.methods.addFeedback = function(feedbackData) {
  this.feedback = { ...this.feedback, ...feedbackData };
  if (feedbackData.patientSatisfaction) {
    this.feedback.patientSatisfaction.submittedAt = new Date();
  }
  return this.save();
};

appointmentSchema.methods.sendReminder = function(type, method = 'email') {
  const reminderField = `${method}Reminders`;
  if (!this.reminders[reminderField]) {
    this.reminders[reminderField] = [];
  }
  
  this.reminders[reminderField].push({
    type: type,
    sent: method !== 'phone',
    completed: method === 'phone' ? false : undefined,
    sentAt: method !== 'phone' ? new Date() : undefined,
    customTime: type === 'custom' ? new Date() : undefined
  });
  
  return this.save();
};

// Static methods
appointmentSchema.statics.findByAppointmentId = function(appointmentId) {
  return this.findOne({ appointmentId: appointmentId.toUpperCase() })
    .populate('patient doctor')
    .populate('patient.user doctor.user');
};

appointmentSchema.statics.findUpcomingByPatient = function(patientId, limit = 10) {
  return this.find({
    patient: patientId,
    scheduledTime: { $gte: new Date() },
    status: { $in: ['scheduled', 'confirmed'] }
  }).sort({ scheduledTime: 1 }).limit(limit).populate('doctor');
};

appointmentSchema.statics.findUpcomingByDoctor = function(doctorId, limit = 20) {
  return this.find({
    doctor: doctorId,
    scheduledTime: { $gte: new Date() },
    status: { $in: ['scheduled', 'confirmed', 'checked-in'] }
  }).sort({ scheduledTime: 1 }).limit(limit).populate('patient');
};

appointmentSchema.statics.findTodaysAppointments = function(doctorId) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  return this.find({
    doctor: doctorId,
    scheduledTime: { $gte: startOfDay, $lt: endOfDay }
  }).sort({ scheduledTime: 1 }).populate('patient');
};

appointmentSchema.statics.findOverdueAppointments = function() {
  return this.find({
    scheduledTime: { $lt: new Date() },
    status: { $in: ['scheduled', 'confirmed', 'checked-in'] }
  }).populate('patient doctor');
};

appointmentSchema.statics.getAppointmentStats = function(doctorId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        doctor: mongoose.Types.ObjectId(doctorId),
        scheduledTime: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Appointment', appointmentSchema);