const mongoose = require('mongoose');

// Mongoose configuration options
const mongooseOptions = {
  // Connection options
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  
  // Buffering options
  bufferCommands: false, // Disable mongoose buffering
  
  // Index options
  autoIndex: process.env.NODE_ENV !== 'production', // Build indexes in development
  autoCreate: process.env.NODE_ENV !== 'production', // Create collections automatically
};

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetryAttempts = 5;
    this.retryDelay = 5000; // 5 seconds
  }

  async connect() {
    try {
      // Set mongoose options
      mongoose.set('strictQuery', false);
      
      // Disable deprecation warnings
      mongoose.set('strictPopulate', false);
      
      // Connection events
      this.setupConnectionEvents();
      
      // Connect to MongoDB
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is required');
      }

      console.log('🔄 Connecting to MongoDB...');
      console.log(`📍 URI: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

      await mongoose.connect(mongoUri, mongooseOptions);

      this.isConnected = true;
      this.connectionAttempts = 0;

      // Log successful connection
      const { host, port, name } = mongoose.connection;
      console.log(`✅ MongoDB Connected: ${host}`);
      console.log(`📊 Database: ${name}`);

      return mongoose.connection;

    } catch (error) {
      this.isConnected = false;
      this.connectionAttempts++;

      console.error(`❌ MongoDB Connection Failed (Attempt ${this.connectionAttempts}/${this.maxRetryAttempts})`);
      console.error(`🔥 Error: ${error.message}`);

      // Retry connection
      if (this.connectionAttempts < this.maxRetryAttempts) {
        console.log(`🔄 Retrying connection in ${this.retryDelay / 1000} seconds...`);
        setTimeout(() => {
          this.connect();
        }, this.retryDelay);
      } else {
        console.error('💀 Maximum retry attempts reached. Exiting...');
        process.exit(1);
      }

      throw error;
    }
  }

  setupConnectionEvents() {
    // Connection successful
    mongoose.connection.on('connected', () => {
      console.log('🟢 Mongoose connected to MongoDB');
    });

    // Connection error
    mongoose.connection.on('error', (error) => {
      console.error('🔴 Mongoose connection error:', error.message);
      this.isConnected = false;
    });

    // Connection disconnected
    mongoose.connection.on('disconnected', () => {
      console.log('� Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    // Connection reconnected
    mongoose.connection.on('reconnected', () => {
      console.log('� Mongoose reconnected to MongoDB');
      this.isConnected = true;
    });

    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', async () => {
      console.log('🛑 SIGINT received. Closing MongoDB connection...');
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('🛑 SIGTERM received. Closing MongoDB connection...');
      await this.disconnect();
      process.exit(0);
    });
  }

  async disconnect() {
    try {
      if (this.isConnected) {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed successfully');
      }
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error.message);
    }
  }

  async dropDatabase() {
    try {
      if (process.env.NODE_ENV !== 'test') {
        throw new Error('Database can only be dropped in test environment');
      }
      
      await mongoose.connection.dropDatabase();
      console.log('🗑️ Test database dropped successfully');
    } catch (error) {
      console.error('❌ Error dropping database:', error.message);
      throw error;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      models: Object.keys(mongoose.connection.models),
      collections: Object.keys(mongoose.connection.collections)
    };
  }

  async healthCheck() {
    try {
      const admin = mongoose.connection.db.admin();
      const result = await admin.ping();
      
      return {
        status: 'healthy',
        connected: this.isConnected,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        database: mongoose.connection.name,
        ping: result.ok === 1 ? 'success' : 'failed'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const dbConnection = new DatabaseConnection();

// Export methods
module.exports = {
  connect: () => dbConnection.connect(),
  disconnect: () => dbConnection.disconnect(),
  dropDatabase: () => dbConnection.dropDatabase(),
  getConnectionStatus: () => dbConnection.getConnectionStatus(),
  healthCheck: () => dbConnection.healthCheck(),
  connection: mongoose.connection,
  mongoose
};