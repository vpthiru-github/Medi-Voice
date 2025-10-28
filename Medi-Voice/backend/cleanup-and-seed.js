require('dotenv').config();
const mongoose = require('mongoose');

// Import the existing Doctor and Patient models
const Doctor = require('./src/models/Doctor-enhanced');
const Patient = require('./src/models/Patient-enhanced');
const User = require('./src/models/User-enhanced');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://thirumalairaj786:Thiru%40123@thirucluster01.lw7hhzh.mongodb.net/?retryWrites=true&w=majority&appName=ThiruCluster01', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const cleanupAndSeed = async () => {
  try {
    console.log('🧹 Starting database cleanup and seeding...');

    // Step 0: Remove users with missing passwords
    console.log('🗑️  Removing users with missing passwords...');
    await User.deleteMany({ $or: [ { password: { $exists: false } }, { password: null }, { password: undefined } ] });

    // Step 1: Clean up only appointments (keep existing doctors and patients)
    console.log('🗑️  Cleaning up appointments...');
    
    try {
      await mongoose.connection.db.collection('appointments').drop();
      console.log('✅ Dropped appointments collection');
    } catch (error) {
      console.log('ℹ️  Appointments collection does not exist or already dropped');
    }

    // Check existing data
    const existingDoctors = await Doctor.countDocuments();
    const existingPatients = await Patient.countDocuments();
    console.log(`📊 Found ${existingDoctors} existing doctors, ${existingPatients} existing patients`);

    // Step 2: Add new doctors to existing collection
    console.log('👨‍⚕️ Adding new doctors...');

    const doctorsData = [
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@medihub.com',
        password: 'Doctor@123',
        phone: '+1 (555) 123-4567',
        specialty: 'Cardiology',
        hospital: 'City General Hospital',
        licenseNumber: 'MD-CARD-001',
        experience: 15,
        consultationFee: 200,
        rating: { average: 4.8, totalReviews: 156 }
      },
      {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@medihub.com',
        password: 'Doctor@123',
        phone: '+1 (555) 987-6543',
        specialty: 'Neurology',
        hospital: 'Metro Medical Center',
        licenseNumber: 'MD-NEUR-002',
        experience: 12,
        consultationFee: 250,
        rating: { average: 4.9, totalReviews: 203 }
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@medihub.com',
        password: 'Doctor@123',
        phone: '+1 (555) 456-7890',
        specialty: 'Dermatology',
        hospital: 'Skin Care Specialists',
        licenseNumber: 'MD-DERM-003',
        experience: 8,
        consultationFee: 180,
        rating: { average: 4.7, totalReviews: 89 }
      },
      {
        firstName: 'Robert',
        lastName: 'Wilson',
        email: 'robert.wilson@medihub.com',
        password: 'Doctor@123',
        phone: '+1 (555) 321-9876',
        specialty: 'Orthopedics',
        hospital: 'Orthopedic Excellence Center',
        licenseNumber: 'MD-ORTH-004',
        experience: 20,
        consultationFee: 300,
        rating: { average: 4.9, totalReviews: 312 }
      },
      {
        firstName: 'Lisa',
        lastName: 'Brown',
        email: 'lisa.brown@medihub.com',
        password: 'Doctor@123',
        phone: '+1 (555) 654-3210',
        specialty: 'Pediatrics',
        hospital: 'Children\'s Health Center',
        licenseNumber: 'MD-PED-005',
        experience: 10,
        consultationFee: 150,
        rating: { average: 4.6, totalReviews: 127 }
      }
    ];

    // Create doctors with User-Doctor relationship
    for (const doctorData of doctorsData) {
      console.log(`Creating doctor: Dr. ${doctorData.firstName} ${doctorData.lastName}`);
      
      // Check if doctor already exists
      const existingUser = await User.findOne({ email: doctorData.email });
      if (existingUser) {
        console.log(`⚠️  Doctor ${doctorData.email} already exists, skipping...`);
        continue;
      }
      
      // Create user account first
      const user = new User({
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        email: doctorData.email,
        password: doctorData.password,
        role: 'doctor',
        phone: doctorData.phone,
        isActive: true,
        isEmailVerified: true
      });
      
      await user.save();
      
      // Create doctor profile
      const doctor = new Doctor({
        userId: user._id,
        specialty: doctorData.specialty,
        hospital: doctorData.hospital,
        licenseNumber: doctorData.licenseNumber,
        experience: doctorData.experience,
        consultationFee: doctorData.consultationFee,
        rating: doctorData.rating,
        isVerified: true,
        isAcceptingNewPatients: true
      });
      
      await doctor.save();
      console.log(`✅ Created: Dr. ${doctorData.firstName} ${doctorData.lastName} (${doctorData.specialty})`);
    }

    // Step 3: Create a test patient
    console.log('👤 Creating test patient...');
    
    // Check if patient already exists
    const existingPatientUser = await User.findOne({ email: 'john.doe@patient.com' });
    if (!existingPatientUser) {
      // Create user account first
      const patientUser = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@patient.com',
        password: 'Patient@123',
        role: 'patient',
        phone: '+1 (555) 111-2222',
        isActive: true,
        isEmailVerified: true
      });
      
      await patientUser.save();
      
      // Create patient profile
      const testPatient = new Patient({
        userId: patientUser._id,
        dateOfBirth: new Date('1990-01-15'),
        gender: 'male',
        bloodType: 'O+',
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'spouse',
          phone: '+1 (555) 111-3333'
        }
      });
      
      await testPatient.save();
      console.log('✅ Created test patient: John Doe (john.doe@patient.com)');
    } else {
      console.log('⚠️  Test patient already exists, skipping...');
    }

    console.log('🎉 Database cleanup and seeding completed successfully!');
    console.log(`📊 Created ${doctorsData.length} doctors and 1 test patient`);
    console.log('🔑 All doctors have password: Doctor@123');
    console.log('🔑 Test patient password: Patient@123');
    console.log('📧 Doctor emails: sarah.johnson@medihub.com, michael.chen@medihub.com, etc.');
    console.log('📧 Patient email: john.doe@patient.com');
    
  } catch (error) {
    console.error('❌ Error during cleanup and seeding:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the cleanup and seeding
cleanupAndSeed();
