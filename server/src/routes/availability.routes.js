const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

// Placeholder for availability controller
// This would typically be imported from '../controllers/availability.controller'
const availabilityController = {
  getUserAvailability: (req, res) => {
    res.status(200).json({ 
      message: 'Get user availability endpoint - To be implemented', 
      userId: req.params.userId || req.user.id,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    });
  },
  createAvailability: (req, res) => {
    res.status(201).json({ 
      message: 'Create availability endpoint - To be implemented', 
      data: req.body 
    });
  },
  getAvailabilityById: (req, res) => {
    res.status(200).json({ 
      message: 'Get availability by ID endpoint - To be implemented', 
      id: req.params.id 
    });
  },
  updateAvailability: (req, res) => {
    res.status(200).json({ 
      message: 'Update availability endpoint - To be implemented', 
      id: req.params.id, 
      data: req.body 
    });
  },
  deleteAvailability: (req, res) => {
    res.status(200).json({ 
      message: 'Delete availability endpoint - To be implemented', 
      id: req.params.id 
    });
  }
};

// Apply authentication middleware to all availability routes
router.use(authenticate);

/**
 * @route GET /api/availability
 * @desc Get current user's availability
 * @access Private
 */
router.get(
  '/',
  [
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
    query('type').optional().isIn(['one-time', 'recurring']).withMessage('Type must be either "one-time" or "recurring"')
  ],
  validate,
  availabilityController.getUserAvailability
);

/**
 * @route GET /api/availability/user/:userId
 * @desc Get specific user's availability (admin or band admin only)
 * @access Private
 */
router.get(
  '/user/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID format'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
    query('type').optional().isIn(['one-time', 'recurring']).withMessage('Type must be either "one-time" or "recurring"')
  ],
  validate,
  availabilityController.getUserAvailability
);

/**
 * @route POST /api/availability
 * @desc Create new availability
 * @access Private
 */
router.post(
  '/',
  [
    body('type').isIn(['one-time', 'recurring']).withMessage('Type must be either "one-time" or "recurring"'),
    
    // For one-time availability
    body('startTime').if(body('type').equals('one-time'))
      .isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
    body('endTime').if(body('type').equals('one-time'))
      .isISO8601().withMessage('End time must be a valid ISO 8601 date')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startTime)) {
          throw new Error('End time must be after start time');
        }
        return true;
      }),
    
    // For recurring availability
    body('dayOfWeek').if(body('type').equals('recurring'))
      .isInt({ min: 0, max: 6 }).withMessage('Day of week must be between 0 (Sunday) and 6 (Saturday)'),
    body('startHour').if(body('type').equals('recurring'))
      .isInt({ min: 0, max: 23 }).withMessage('Start hour must be between 0 and 23'),
    body('startMinute').if(body('type').equals('recurring'))
      .isInt({ min: 0, max: 59 }).withMessage('Start minute must be between 0 and 59'),
    body('endHour').if(body('type').equals('recurring'))
      .isInt({ min: 0, max: 23 }).withMessage('End hour must be between 0 and 23'),
    body('endMinute').if(body('type').equals('recurring'))
      .isInt({ min: 0, max: 59 }).withMessage('End minute must be between 0 and 59'),
    body('effectiveDate').if(body('type').equals('recurring'))
      .isISO8601().withMessage('Effective date must be a valid ISO 8601 date'),
    body('expiryDate').if(body('type').equals('recurring'))
      .optional()
      .isISO8601().withMessage('Expiry date must be a valid ISO 8601 date')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.effectiveDate)) {
          throw new Error('Expiry date must be after effective date');
        }
        return true;
      }),
    
    // Common fields
    body('note').optional().isString().isLength({ max: 255 })
      .withMessage('Note must be at most 255 characters')
  ],
  validate,
  availabilityController.createAvailability
);

/**
 * @route GET /api/availability/:id
 * @desc Get availability by ID
 * @access Private
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid availability ID format')
  ],
  validate,
  availabilityController.getAvailabilityById
);

/**
 * @route PUT /api/availability/:id
 * @desc Update availability
 * @access Private
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid availability ID format'),
    
    // One-time availability fields
    body('startTime').optional().isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
    body('endTime').optional().isISO8601().withMessage('End time must be a valid ISO 8601 date')
      .custom((value, { req }) => {
        if (req.body.startTime && new Date(value) <= new Date(req.body.startTime)) {
          throw new Error('End time must be after start time');
        }
        return true;
      }),
    
    // Recurring availability fields
    body('dayOfWeek').optional().isInt({ min: 0, max: 6 })
      .withMessage('Day of week must be between 0 (Sunday) and 6 (Saturday)'),
    body('startHour').optional().isInt({ min: 0, max: 23 })
      .withMessage('Start hour must be between 0 and 23'),
    body('startMinute').optional().isInt({ min: 0, max: 59 })
      .withMessage('Start minute must be between 0 and 59'),
    body('endHour').optional().isInt({ min: 0, max: 23 })
      .withMessage('End hour must be between 0 and 23'),
    body('endMinute').optional().isInt({ min: 0, max: 59 })
      .withMessage('End minute must be between 0 and 59'),
    body('effectiveDate').optional().isISO8601()
      .withMessage('Effective date must be a valid ISO 8601 date'),
    body('expiryDate').optional().isISO8601()
      .withMessage('Expiry date must be a valid ISO 8601 date')
      .custom((value, { req }) => {
        if (req.body.effectiveDate && new Date(value) <= new Date(req.body.effectiveDate)) {
          throw new Error('Expiry date must be after effective date');
        }
        return true;
      }),
    
    // Common fields
    body('note').optional().isString().isLength({ max: 255 })
      .withMessage('Note must be at most 255 characters')
  ],
  validate,
  availabilityController.updateAvailability
);

/**
 * @route DELETE /api/availability/:id
 * @desc Delete availability
 * @access Private
 */
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid availability ID format')
  ],
  validate,
  availabilityController.deleteAvailability
);

module.exports = router;