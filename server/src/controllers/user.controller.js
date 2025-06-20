const { User, Band, Availability, Rehearsal } = require('../models');
const logger = require('../utils/logger');

/**
 * Get all users (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    
    res.json(users);
  } catch (error) {
    logger.error(`Error getting all users: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};

/**
 * Get current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by authenticate middleware
    res.json(req.user);
  } catch (error) {
    logger.error(`Error getting current user: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving user', error: error.message });
  }
};

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only admins can view other users, or users viewing themselves
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Not authorized to view this user' });
    }
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    logger.error(`Error getting user by ID: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving user', error: error.message });
  }
};

/**
 * Update user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, timezone, profileImage } = req.body;
    
    // Only admins can update other users, or users updating themselves
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user fields
    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      email: email || user.email,
      phone: phone !== undefined ? phone : user.phone,
      timezone: timezone || user.timezone,
      profileImage: profileImage !== undefined ? profileImage : user.profileImage
    });
    
    logger.info(`User updated: ${user.email}`);
    
    res.json({
      message: 'User updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

/**
 * Delete user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only admins can delete other users, or users deleting themselves
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Not authorized to delete this user' });
    }
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Instead of hard delete, set isActive to false
    await user.update({ isActive: false });
    
    logger.info(`User deactivated: ${user.email}`);
    
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    logger.error(`Error deactivating user: ${error.message}`);
    res.status(500).json({ message: 'Error deactivating user', error: error.message });
  }
};

/**
 * Get user's bands
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserBands = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only admins can view other users' bands, or users viewing their own bands
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Not authorized to view this user\'s bands' });
    }
    
    const user = await User.findByPk(id, {
      include: [{
        model: Band,
        as: 'bands',
        through: { attributes: [] }
      }]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.bands);
  } catch (error) {
    logger.error(`Error getting user bands: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving user bands', error: error.message });
  }
};

/**
 * Get user's availability
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only admins can view other users' availability, or users viewing their own availability
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Not authorized to view this user\'s availability' });
    }
    
    const availability = await Availability.findAll({
      where: { userId: id }
    });
    
    res.json(availability);
  } catch (error) {
    logger.error(`Error getting user availability: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving user availability', error: error.message });
  }
};

/**
 * Get user's rehearsals
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserRehearsals = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only admins can view other users' rehearsals, or users viewing their own rehearsals
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Not authorized to view this user\'s rehearsals' });
    }
    
    const user = await User.findByPk(id, {
      include: [{
        model: Rehearsal,
        as: 'rehearsals',
        through: { attributes: [] },
        include: [{
          model: Band
        }]
      }]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.rehearsals);
  } catch (error) {
    logger.error(`Error getting user rehearsals: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving user rehearsals', error: error.message });
  }
};