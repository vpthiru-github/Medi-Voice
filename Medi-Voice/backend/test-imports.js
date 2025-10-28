console.log('Testing imports...');
try {
  console.log('1. Testing express...');
  const express = require('express');
  console.log(' Express OK');

  console.log('2. Testing database...');
  const database = require('./src/config/database');
  console.log(' Database OK');

  console.log('3. Testing logger...');
  const logger = require('./src/config/logger');
  console.log(' Logger OK');

  console.log('4. Testing auth routes...');
  const authRoutes = require('./src/routes/auth');
  console.log(' Auth routes OK');

  console.log('5. Testing user routes...');
  const userRoutes = require('./src/routes/users');
  console.log(' User routes OK');

} catch (error) {
  console.error('Error during import:', error.message);
  console.error('Stack:', error.stack);
}
