require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./src/models/User-enhanced');
const Doctor = require('./src/models/Doctor-enhanced');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://thirumalairaj786:Thiru%40123@thirucluster01.lw7hhzh.mongodb.net/?retryWrites=true&w=majority&appName=ThiruCluster01', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedDoctors = async () => {
  try {
    console.log('🌱 Starting doctor seeding...');

    // Check if doctors already exist
    const existingDoctors = await Doctor.countDocuments();
    if (existingDoctors > 0) {
      console.log(`✅ Found ${existingDoctors} existing doctors. Skipping seed.`);
      process.exit(0);
    }

    // Sample doctors data
    const doctorsData = [
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@medihub.com',
        specialization: 'Cardiology',
        experience: 15,
        consultationFee: 200,
        rating: 4.8
      },
      {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@medihub.com',
        specialization: 'Neurology',
        experience: 12,
        consultationFee: 250,
        rating: 4.9
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@medihub.com',
        specialization: 'Dermatology',
        experience: 8,
        consultationFee: 180,
        rating: 4.7
      },
      {
        firstName: 'Robert',
        lastName: 'Wilson',
        email: 'robert.wilson@medihub.com',
        specialization: 'Orthopedics',
        experience: 20,
        consultationFee: 300,
        rating: 4.9
      },
      {
        firstName: 'Lisa',
        lastName: 'Brown',
        email: 'lisa.brown@medihub.com',
        specialization: 'Pediatrics',
        experience: 10,
        consultationFee: 150,
        rating: 4.6
      }
    ];

    // Create users and doctors
    for (const doctorData of doctorsData) {
      console.log(`Creating doctor: Dr. ${doctorData.firstName} ${doctorData.lastName}`);

      // Create user account
      const hashedPassword = await bcrypt.hash('Doctor@123', 12);
      const user = new User({
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        email: doctorData.email,
        password: hashedPassword,
        role: 'doctor',
        isActive: true,
        isEmailVerified: true
      });

      await user.save();

      // Create doctor profile
      const doctor = new Doctor({
        user: user._id,
        specialization: doctorData.specialization,
        experience: doctorData.experience,
        consultationFee: doctorData.consultationFee,
        rating: doctorData.rating,
        isActive: true,
        isAvailable: true,
        qualifications: ['MBBS', 'MD'],
        languages: ['English'],
        workingHours: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '09:00', end: '13:00' }
        }
      });

      await doctor.save();
      console.log(`✅ Created: Dr. ${doctorData.firstName} ${doctorData.lastName} (${doctorData.specialization})`);
    }

    console.log('🎉 Doctor seeding completed successfully!');
    console.log(`📊 Created ${doctorsData.length} doctors`);
    
  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding
seedDoctors();
