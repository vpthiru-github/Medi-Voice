require('dotenv').config();

console.log('🔍 Starting Enhanced Medi-Hub Backend...');

try {
  console.log('📦 Loading dependencies...');
  const createApp = require('./app-enhanced');
  console.log('✅ App factory loaded');
  
  const DatabaseConnection = require('./config/database');
  console.log('✅ Database connection module loaded');
  
  const PORT = process.env.PORT || 5000;
  console.log(`📡 Port configured: ${PORT}`);
  
  // Create the Express application with all enhancements
  console.log('🏗️ Creating Express application...');
  const app = createApp();
  console.log('✅ Express application created');
  
  // Initialize database connection
  console.log('🔗 Initializing database connection...');
  DatabaseConnection.connect();
  console.log('✅ Database connection initiated');
  
  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received. Shutting down gracefully...');
    process.exit(0);
  });
  
  // Unhandled promise rejection handling
  process.on('unhandledRejection', (err, promise) => {
    console.error('🚨 Unhandled Promise Rejection:', err);
    // Close server & exit process
    process.exit(1);
  });
  
  // Unhandled exception handling
  process.on('uncaughtException', (err) => {
    console.error('🚨 Uncaught Exception:', err);
    process.exit(1);
  });
  
  // Start server
  console.log('🚀 Starting HTTP server...');
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Enhanced Medi-Hub Backend Server Started Successfully!`);
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌐 Local URL: http://localhost:${PORT}`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
    console.log(`🧪 Test Endpoint: http://localhost:${PORT}/api/test`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/`);
    console.log(`\n🔐 Authentication Endpoints:`);
    console.log(`   POST /api/auth/register - User registration`);
    console.log(`   POST /api/auth/login - User login`);
    console.log(`   POST /api/auth/demo-login - Demo login`);
    console.log(`   GET /api/auth/me - Get user profile`);
    console.log(`   PUT /api/auth/profile - Update profile`);
    console.log(`   POST /api/auth/change-password - Change password`);
    console.log(`   POST /api/auth/logout - User logout`);
    console.log(`\n🎭 Demo Endpoints (matching frontend):`);
    console.log(`   GET /api/demo/doctors - Demo doctors data`);
    console.log(`   GET /api/demo/patients - Demo patients data`);
    console.log(`   GET /api/demo/laboratories - Demo labs data`);
    console.log(`\n👥 Supported User Roles:`);
    console.log(`   • Patient - Healthcare consumers`);
    console.log(`   • Doctor - Medical practitioners`);
    console.log(`   • Staff - Healthcare facility staff`);
    console.log(`   • Laboratory - Lab technicians and managers`);
    console.log(`   • Admin - System administrators`);
    console.log(`\n🛡️ Security Features:`);
    console.log(`   • JWT-based authentication`);
    console.log(`   • Role-based access control`);
    console.log(`   • Rate limiting`);
    console.log(`   • Input sanitization`);
    console.log(`   • CORS protection`);
    console.log(`   • Security headers (Helmet)`);
    console.log(`   • Demo mode support`);
    console.log(`\n⏰ Started at: ${new Date().toLocaleString()}\n`);
  });
  
  console.log('✅ Server setup completed');
  
  module.exports = server;
  
} catch (error) {
  console.error('💥 Fatal error during server startup:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}