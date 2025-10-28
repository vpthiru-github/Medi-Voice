const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import database connection
const database = require('./config/database');
const logger = require('./config/logger');

// Import route handlers
const authRoutes = require('./routes/auth-test'); // Using test auth without database
const userRoutes = require('./routes/users-test'); // Using test users without database
const doctorRoutes = require('./routes/doctors-test'); // Using test doctors without database
const patientRoutes = require('./routes/patients-test'); // Using test patients without database
const appointmentRoutes = require('./routes/appointments-test');
const medicalRecordRoutes = require('./routes/medicalRecords-test');
const prescriptionRoutes = require('./routes/prescriptions-test');
const adminRoutes = require('./routes/admin-test');
const analyticsRoutes = require('./routes/analytics-test');

class Application {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Trust proxy for accurate client IP
    this.app.set('trust proxy', 1);

    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    const corsOptions = {
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
        
        if (process.env.NODE_ENV === 'development') {
          const devOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:8080'
          ];
          allowedOrigins.push(...devOrigins);
        }
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With']
    };
    this.app.use(cors(corsOptions));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      });
    });
  }

  setupRoutes() {
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/doctors', doctorRoutes);
    this.app.use('/api/patients', patientRoutes);
    this.app.use('/api/appointments', appointmentRoutes);
    this.app.use('/api/medical-records', medicalRecordRoutes);
    this.app.use('/api/prescriptions', prescriptionRoutes);
    this.app.use('/api/admin', adminRoutes);
    this.app.use('/api/analytics', analyticsRoutes);

    // Catch-all for undefined API routes
    this.app.all('/api/*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'API endpoint not found'
      });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    });

    // Global error handler
    this.app.use((err, req, res, next) => {
      logger.error('Error:', err);
      
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    });
  }

  async initialize() {
    try {
      // For now, skip database connection for basic server startup
      // await database.connect();
      logger.info('Application initialized successfully (database connection skipped)');
      return this.app;
    } catch (error) {
      logger.error('Failed to initialize application:', error);
      throw error;
    }
  }

  start(port = process.env.PORT || 5000) {
    this.server = this.app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
    return this.server;
  }

  getApp() {
    return this.app;
  }
}

module.exports = Application;