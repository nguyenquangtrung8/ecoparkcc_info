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
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Routes
app.use('/webhook', messengerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
