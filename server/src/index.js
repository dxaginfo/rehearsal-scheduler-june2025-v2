require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');
const logger = require('./utils/logger');
const db = require('./models');
const routes = require('./routes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach Socket.io to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);
  
  // Join a band room
  socket.on('join-band', (bandId) => {
    socket.join(`band-${bandId}`);
    logger.info(`Socket ${socket.id} joined band-${bandId}`);
  });
  
  // Leave a band room
  socket.on('leave-band', (bandId) => {
    socket.leave(`band-${bandId}`);
    logger.info(`Socket ${socket.id} left band-${bandId}`);
  });
  
  // Disconnect event
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Database connection and server startup
const PORT = process.env.PORT || 5000;

db.sequelize.authenticate()
  .then(() => {
    logger.info('Database connected successfully');
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    logger.error('Unable to connect to the database:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    db.sequelize.close()
      .then(() => {
        logger.info('Database connection closed');
        process.exit(0);
      })
      .catch(err => {
        logger.error('Error closing database connection:', err);
        process.exit(1);
      });
  });
});

module.exports = { app, server, io };