const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { isOperatingHours } = require('./utils/time');
const messengerRoutes = require('./routes/messenger');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Operating hours middleware
app.use((req, res, next) => {
  if (isOperatingHours() || req.path === '/health') {
    next();
  } else {
    res.status(503).json({
      success: false,
      message: "Service is only available between 6 AM and 10 PM"
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const mongoStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  
  // Check connection status
  const status = {
    server: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: {
      status: mongoStatus[mongoose.connection.readyState],
      connected: mongoose.connection.readyState === 1,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    },
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node: process.version
    }
  };

  // Send different status code if MongoDB is not connected
  if (!status.mongodb.connected) {
    res.status(503).json(status);
  } else {
    res.json(status);
  }
});

// Routes
app.use('/webhook', messengerRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

module.exports = app;
