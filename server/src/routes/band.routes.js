const express = require('express');
const { body, param, query } = require('express-validator');
const bandController = require('../controllers/band.controller');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

const router = express.Router();

// Apply authentication middleware to all band routes
router.use(authenticate);

/**
 * @route GET /api/bands
 * @desc Get all bands user has access to
 * @access Private
 */
router.get('/', bandController.getAllBands);

/**
 * @route GET /api/bands/:id
 * @desc Get band by ID
 * @access Private
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid band ID format')
  ],
  validate,
  bandController.getBandById
);

/**
 * @route POST /api/bands
 * @desc Create a new band
 * @access Private
 */
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Band name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Band name must be between 2 and 100 characters'),
    body('description').optional().isString(),
    body('genre').optional().isString(),
    body('location').optional().isString(),
    body('contactEmail').optional().isEmail().withMessage('Invalid email format'),
    body('contactPhone').optional().isString(),
    body('logoUrl').optional().isURL().withMessage('Logo URL must be a valid URL')
  ],
  validate,
  bandController.createBand
);

/**
 * @route PUT /api/bands/:id
 * @desc Update band
 * @access Private (Band Admin or App Admin)
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid band ID format'),
    body('name').optional().isLength({ min: 2, max: 100 }).withMessage('Band name must be between 2 and 100 characters'),
    body('description').optional().isString(),
    body('genre').optional().isString(),
    body('location').optional().isString(),
    body('contactEmail').optional().isEmail().withMessage('Invalid email format'),
    body('contactPhone').optional().isString(),
    body('logoUrl').optional().isURL().withMessage('Logo URL must be a valid URL')
  ],
  validate,
  bandController.updateBand
);

/**
 * @route DELETE /api/bands/:id
 * @desc Delete (deactivate) band
 * @access Private (Band Admin or App Admin)
 */
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid band ID format')
  ],
  validate,
  bandController.deleteBand
);

/**
 * @route POST /api/bands/:id/members
 * @desc Add member to band
 * @access Private (Band Admin or App Admin)
 */
router.post(
  '/:id/members',
  [
    param('id').isUUID().withMessage('Invalid band ID format'),
    body('userId').isUUID().withMessage('Invalid user ID format'),
    body('role').optional().isIn(['admin', 'member']).withMessage('Role must be either "admin" or "member"')
  ],
  validate,
  bandController.addMember
);

/**
 * @route DELETE /api/bands/:id/members/:userId
 * @desc Remove member from band
 * @access Private (Band Admin, App Admin, or Self-removal)
 */
router.delete(
  '/:id/members/:userId',
  [
    param('id').isUUID().withMessage('Invalid band ID format'),
    param('userId').isUUID().withMessage('Invalid user ID format')
  ],
  validate,
  bandController.removeMember
);

/**
 * @route PUT /api/bands/:id/members/:userId
 * @desc Update member role in band
 * @access Private (Band Admin or App Admin)
 */
router.put(
  '/:id/members/:userId',
  [
    param('id').isUUID().withMessage('Invalid band ID format'),
    param('userId').isUUID().withMessage('Invalid user ID format'),
    body('role').isIn(['admin', 'member']).withMessage('Role must be either "admin" or "member"')
  ],
  validate,
  bandController.updateMemberRole
);

/**
 * @route GET /api/bands/:id/rehearsals
 * @desc Get band rehearsals
 * @access Private (Band Members)
 */
router.get(
  '/:id/rehearsals',
  [
    param('id').isUUID().withMessage('Invalid band ID format'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
    query('status').optional().isIn(['scheduled', 'cancelled', 'completed']).withMessage('Invalid status')
  ],
  validate,
  bandController.getBandRehearsals
);

/**
 * @route GET /api/bands/:id/availability
 * @desc Get band members with availability
 * @access Private (Band Members)
 */
router.get(
  '/:id/availability',
  [
    param('id').isUUID().withMessage('Invalid band ID format'),
    query('startDate').isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate').isISO8601().withMessage('End date must be a valid ISO 8601 date')
  ],
  validate,
  bandController.getBandMembersAvailability
);

/**
 * @route POST /api/bands/:id/optimal-times
 * @desc Find optimal rehearsal times
 * @access Private (Band Members)
 */
router.post(
  '/:id/optimal-times',
  [
    param('id').isUUID().withMessage('Invalid band ID format'),
    body('startDate').isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    body('endDate').isISO8601().withMessage('End date must be a valid ISO 8601 date'),
    body('duration').isInt({ min: 30, max: 480 }).withMessage('Duration must be between 30 and 480 minutes'),
    body('minimumMembers').optional().isInt({ min: 1 }).withMessage('Minimum members must be at least 1')
  ],
  validate,
  bandController.findOptimalRehearsalTimes
);

module.exports = router;