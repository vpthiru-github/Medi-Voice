require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');

const mongoUri = process.env.MONGODB_URI;
console.log('URI:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));

mongoose.connect(mongoUri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  bufferCommands: false,
  autoIndex: false,
  autoCreate: false,
})
.then(() => {
  console.log('✅ MongoDB connection successful');
  process.exit(0);
})
.catch(error => {
  console.error('❌ MongoDB connection failed:', error.message);
  console.error('Full error:', error);
  process.exit(1);
});