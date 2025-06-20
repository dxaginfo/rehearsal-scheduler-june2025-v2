const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

// Placeholder for rehearsal controller
// This would typically be imported from '../controllers/rehearsal.controller'
const rehearsalController = {
  getAllRehearsals: (req, res) => {
    res.status(200).json({ message: 'Get all rehearsals endpoint - To be implemented' });
  },
  getRehearsalById: (req, res) => {
    res.status(200).json({ message: 'Get rehearsal by ID endpoint - To be implemented', id: req.params.id });
  },
  createRehearsal: (req, res) => {
    res.status(201).json({ message: 'Create rehearsal endpoint - To be implemented', data: req.body });
  },
  updateRehearsal: (req, res) => {
    res.status(200).json({ message: 'Update rehearsal endpoint - To be implemented', id: req.params.id, data: req.body });
  },
  deleteRehearsal: (req, res) => {
    res.status(200).json({ message: 'Delete rehearsal endpoint - To be implemented', id: req.params.id });
  },
  getRehearsalAttendees: (req, res) => {
    res.status(200).json({ message: 'Get rehearsal attendees endpoint - To be implemented', id: req.params.id });
  },
  updateAttendeeStatus: (req, res) => {
    res.status(200).json({ 
      message: 'Update attendee status endpoint - To be implemented', 
      rehearsalId: req.params.id, 
      userId: req.params.userId, 
      status: req.body.status 
    });
  },
  addEquipmentToRehearsal: (req, res) => {
    res.status(201).json({ 
      message: 'Add equipment to rehearsal endpoint - To be implemented', 
      rehearsalId: req.params.id, 
      equipmentId: req.body.equipmentId 
    });
  },
  removeEquipmentFromRehearsal: (req, res) => {
    res.status(200).json({ 
      message: 'Remove equipment from rehearsal endpoint - To be implemented', 
      rehearsalId: req.params.id, 
      equipmentId: req.params.equipmentId 
    });
  }
};

// Apply authentication middleware to all rehearsal routes
router.use(authenticate);

/**
 * @route GET /api/rehearsals
 * @desc Get all rehearsals user has access to
 * @access Private
 */
router.get(
  '/',
  [
    query('bandId').optional().isUUID().withMessage('Invalid band ID format'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
    query('status').optional().isIn(['scheduled', 'cancelled', 'completed']).withMessage('Invalid status')
  ],
  validate,
  rehearsalController.getAllRehearsals
);

/**
 * @route GET /api/rehearsals/:id
 * @desc Get rehearsal by ID
 * @access Private
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid rehearsal ID format')
  ],
  validate,
  rehearsalController.getRehearsalById
);

/**
 * @route POST /api/rehearsals
 * @desc Create a new rehearsal
 * @access Private
 */
router.post(
  '/',
  [
    body('bandId').isUUID().withMessage('Band ID is required and must be a valid UUID'),
    body('title').notEmpty().withMessage('Title is required')
      .isLength({ max: 100 }).withMessage('Title must be at most 100 characters'),
    body('description').optional().isString(),
    body('location').optional().isString(),
    body('startTime').isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
    body('endTime').isISO8601().withMessage('End time must be a valid ISO 8601 date')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startTime)) {
          throw new Error('End time must be after start time');
        }
        return true;
      }),
    body('isRecurring').optional().isBoolean(),
    body('recurringPattern').optional().isObject(),
    body('sendReminders').optional().isBoolean(),
    body('reminderHours').optional().isInt({ min: 1, max: 72 })
      .withMessage('Reminder hours must be between 1 and 72')
  ],
  validate,
  rehearsalController.createRehearsal
);

/**
 * @route PUT /api/rehearsals/:id
 * @desc Update rehearsal
 * @access Private (Band Admin or App Admin)
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid rehearsal ID format'),
    body('title').optional().isLength({ max: 100 }).withMessage('Title must be at most 100 characters'),
    body('description').optional().isString(),
    body('location').optional().isString(),
    body('startTime').optional().isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
    body('endTime').optional().isISO8601().withMessage('End time must be a valid ISO 8601 date')
      .custom((value, { req }) => {
        if (req.body.startTime && new Date(value) <= new Date(req.body.startTime)) {
          throw new Error('End time must be after start time');
        }
        return true;
      }),
    body('status').optional().isIn(['scheduled', 'cancelled', 'completed']).withMessage('Invalid status'),
    body('isRecurring').optional().isBoolean(),
    body('recurringPattern').optional().isObject(),
    body('sendReminders').optional().isBoolean(),
    body('reminderHours').optional().isInt({ min: 1, max: 72 })
      .withMessage('Reminder hours must be between 1 and 72')
  ],
  validate,
  rehearsalController.updateRehearsal
);

/**
 * @route DELETE /api/rehearsals/:id
 * @desc Delete rehearsal
 * @access Private (Band Admin or App Admin)
 */
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid rehearsal ID format')
  ],
  validate,
  rehearsalController.deleteRehearsal
);

/**
 * @route GET /api/rehearsals/:id/attendees
 * @desc Get rehearsal attendees
 * @access Private
 */
router.get(
  '/:id/attendees',
  [
    param('id').isUUID().withMessage('Invalid rehearsal ID format')
  ],
  validate,
  rehearsalController.getRehearsalAttendees
);

/**
 * @route PUT /api/rehearsals/:id/attendees/:userId
 * @desc Update attendee status (attending, maybe, not attending)
 * @access Private
 */
router.put(
  '/:id/attendees/:userId',
  [
    param('id').isUUID().withMessage('Invalid rehearsal ID format'),
    param('userId').isUUID().withMessage('Invalid user ID format'),
    body('status').isIn(['attending', 'maybe', 'not_attending'])
      .withMessage('Status must be one of: attending, maybe, not_attending'),
    body('note').optional().isString().isLength({ max: 255 })
      .withMessage('Note must be at most 255 characters')
  ],
  validate,
  rehearsalController.updateAttendeeStatus
);

/**
 * @route POST /api/rehearsals/:id/equipment
 * @desc Add equipment to rehearsal
 * @access Private (Band Admin)
 */
router.post(
  '/:id/equipment',
  [
    param('id').isUUID().withMessage('Invalid rehearsal ID format'),
    body('equipmentId').isUUID().withMessage('Equipment ID is required and must be a valid UUID'),
    body('note').optional().isString().isLength({ max: 255 })
      .withMessage('Note must be at most 255 characters')
  ],
  validate,
  rehearsalController.addEquipmentToRehearsal
);

/**
 * @route DELETE /api/rehearsals/:id/equipment/:equipmentId
 * @desc Remove equipment from rehearsal
 * @access Private (Band Admin)
 */
router.delete(
  '/:id/equipment/:equipmentId',
  [
    param('id').isUUID().withMessage('Invalid rehearsal ID format'),
    param('equipmentId').isUUID().withMessage('Invalid equipment ID format')
  ],
  validate,
  rehearsalController.removeEquipmentFromRehearsal
);

module.exports = router;