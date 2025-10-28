console.log('Starting test...');
try {
  require('dotenv').config();
  console.log('Dotenv loaded');
  
  const Application = require('./src/app');
  console.log('Application required');
  
  const app = new Application();
  console.log('Application created');
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}
