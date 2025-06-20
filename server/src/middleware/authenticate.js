const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'rehearsal-scheduler-secret';

/**
 * Authentication middleware
 * Verifies JWT token and adds user to request object
 * @param {Array} allowedRoles - Array of roles allowed to access the route
 * @returns {Function} Express middleware function
 */
const authenticate = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Find user by ID
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is inactive' });
      }
      
      // Check if user has required role
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        logger.warn(`Unauthorized access attempt by ${user.email} to ${req.originalUrl}`);
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Add user to request object
      req.user = user;
      
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      
      logger.error(`Authentication error: ${error.message}`);
      res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
  };
};

module.exports = authenticate;