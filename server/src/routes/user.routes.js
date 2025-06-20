const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

// Get all users (admin only)
router.get('/', authenticate(['admin']), userController.getAllUsers);

// Get current user
router.get('/me', authenticate(), userController.getCurrentUser);

// Get user by ID
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid user ID format')
  ],
  validate,
  authenticate(),
  userController.getUserById
);

// Update user
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid user ID format'),
    body('firstName').optional().isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName').optional().isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    body('email').optional().isEmail().withMessage('Email must be valid'),
    body('phone').optional(),
    body('timezone').optional(),
    body('profileImage').optional().isURL().withMessage('Profile image must be a valid URL')
  ],
  validate,
  authenticate(),
  userController.updateUser
);

// Delete user
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid user ID format')
  ],
  validate,
  authenticate(),
  userController.deleteUser
);

// Get user's bands
router.get(
  '/:id/bands',
  [
    param('id').isUUID().withMessage('Invalid user ID format')
  ],
  validate,
  authenticate(),
  userController.getUserBands
);

// Get user's availability
router.get(
  '/:id/availability',
  [
    param('id').isUUID().withMessage('Invalid user ID format')
  ],
  validate,
  authenticate(),
  userController.getUserAvailability
);

// Get user's rehearsals
router.get(
  '/:id/rehearsals',
  [
    param('id').isUUID().withMessage('Invalid user ID format')
  ],
  validate,
  authenticate(),
  userController.getUserRehearsals
);

module.exports = router;