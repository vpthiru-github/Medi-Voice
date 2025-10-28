require('dotenv').config();
const Application = require('./app');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

// Create and initialize application
const application = new Application();

async function startServer() {
  try {
    // Initialize application (connects to database, etc.)
    await application.initialize();
    
    // Start the server
    const server = application.start(PORT);
    
    logger.info('🚀 Medi-Hub Backend started successfully');
    logger.info(`🌐 Server running on http://localhost:${PORT}`);
    logger.info(`� Health check: http://localhost:${PORT}/health`);
    
    // Graceful shutdown handlers
    const shutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };
    
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = application;