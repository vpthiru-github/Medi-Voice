require('dotenv').config();
console.log('Starting test server...');

try {
  console.log('Loading database...');
  const DatabaseConnection = require('./src/config/database');
  console.log('Database module loaded');

  console.log('Loading app...');
  const createApp = require('./src/app-enhanced');
  console.log('App module loaded');

  console.log('Creating app...');
  const app = createApp();
  console.log('App created');

  console.log('Starting server without database...');
  const server = app.listen(5000, () => {
    console.log('Server started successfully on port 5000');
  });

  console.log('Now connecting to database...');
  DatabaseConnection.connect().catch(err => {
    console.error('Database connection failed:', err.message);
  });

} catch (error) {
  console.error('Error occurred:', error);
  process.exit(1);
}