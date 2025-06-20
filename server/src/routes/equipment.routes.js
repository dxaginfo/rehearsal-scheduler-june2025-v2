const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

// Placeholder for equipment controller
// This would typically be imported from '../controllers/equipment.controller'
const equipmentController = {
  getAllEquipment: (req, res) => {
    res.status(200).json({ 
      message: 'Get all equipment endpoint - To be implemented',
      bandId: req.query.bandId,
      category: req.query.category
    });
  },
  getEquipmentById: (req, res) => {
    res.status(200).json({ 
      message: 'Get equipment by ID endpoint - To be implemented',
      id: req.params.id
    });
  },
  createEquipment: (req, res) => {
    res.status(201).json({ 
      message: 'Create equipment endpoint - To be implemented',
      data: req.body
    });
  },
  updateEquipment: (req, res) => {
    res.status(200).json({ 
      message: 'Update equipment endpoint - To be implemented',
      id: req.params.id,
      data: req.body
    });
  },
  deleteEquipment: (req, res) => {
    res.status(200).json({ 
      message: 'Delete equipment endpoint - To be implemented',
      id: req.params.id
    });
  },
  getBandEquipment: (req, res) => {
    res.status(200).json({ 
      message: 'Get band equipment endpoint - To be implemented',
      bandId: req.params.bandId
    });
  },
  assignEquipmentToBand: (req, res) => {
    res.status(201).json({ 
      message: 'Assign equipment to band endpoint - To be implemented',
      bandId: req.params.bandId,
      equipmentId: req.params.equipmentId
    });
  },
  removeEquipmentFromBand: (req, res) => {
    res.status(200).json({ 
      message: 'Remove equipment from band endpoint - To be implemented',
      bandId: req.params.bandId,
      equipmentId: req.params.equipmentId
    });
  }
};

// Apply authentication middleware to all equipment routes
router.use(authenticate);

/**
 * @route GET /api/equipment
 * @desc Get all equipment
 * @access Private
 */
router.get(
  '/',
  [
    query('bandId').optional().isUUID().withMessage('Invalid band ID format'),
    query('category').optional().isString()
  ],
  validate,
  equipmentController.getAllEquipment
);

/**
 * @route GET /api/equipment/:id
 * @desc Get equipment by ID
 * @access Private
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid equipment ID format')
  ],
  validate,
  equipmentController.getEquipmentById
);

/**
 * @route POST /api/equipment
 * @desc Create new equipment
 * @access Private
 */
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required')
      .isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),
    body('description').optional().isString(),
    body('category').optional().isString(),
    body('brand').optional().isString(),
    body('model').optional().isString(),
    body('serialNumber').optional().isString(),
    body('purchaseDate').optional().isISO8601().withMessage('Purchase date must be a valid ISO 8601 date'),
    body('purchasePrice').optional().isFloat({ min: 0 }).withMessage('Purchase price must be a positive number'),
    body('currentValue').optional().isFloat({ min: 0 }).withMessage('Current value must be a positive number'),
    body('condition').optional().isIn(['excellent', 'good', 'fair', 'poor'])
      .withMessage('Condition must be one of: excellent, good, fair, poor'),
    body('location').optional().isString(),
    body('notes').optional().isString(),
    body('isAvailable').optional().isBoolean(),
    body('ownerId').optional().isUUID().withMessage('Owner ID must be a valid UUID'),
    body('bandId').optional().isUUID().withMessage('Band ID must be a valid UUID'),
    body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL')
  ],
  validate,
  equipmentController.createEquipment
);

/**
 * @route PUT /api/equipment/:id
 * @desc Update equipment
 * @access Private
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid equipment ID format'),
    body('name').optional().isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),
    body('description').optional().isString(),
    body('category').optional().isString(),
    body('brand').optional().isString(),
    body('model').optional().isString(),
    body('serialNumber').optional().isString(),
    body('purchaseDate').optional().isISO8601().withMessage('Purchase date must be a valid ISO 8601 date'),
    body('purchasePrice').optional().isFloat({ min: 0 }).withMessage('Purchase price must be a positive number'),
    body('currentValue').optional().isFloat({ min: 0 }).withMessage('Current value must be a positive number'),
    body('condition').optional().isIn(['excellent', 'good', 'fair', 'poor'])
      .withMessage('Condition must be one of: excellent, good, fair, poor'),
    body('location').optional().isString(),
    body('notes').optional().isString(),
    body('isAvailable').optional().isBoolean(),
    body('ownerId').optional().isUUID().withMessage('Owner ID must be a valid UUID'),
    body('bandId').optional().isUUID().withMessage('Band ID must be a valid UUID'),
    body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL')
  ],
  validate,
  equipmentController.updateEquipment
);

/**
 * @route DELETE /api/equipment/:id
 * @desc Delete equipment
 * @access Private
 */
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid equipment ID format')
  ],
  validate,
  equipmentController.deleteEquipment
);

/**
 * @route GET /api/equipment/band/:bandId
 * @desc Get band equipment
 * @access Private
 */
router.get(
  '/band/:bandId',
  [
    param('bandId').isUUID().withMessage('Invalid band ID format')
  ],
  validate,
  equipmentController.getBandEquipment
);

/**
 * @route POST /api/equipment/:id/band/:bandId
 * @desc Assign equipment to band
 * @access Private
 */
router.post(
  '/:id/band/:bandId',
  [
    param('id').isUUID().withMessage('Invalid equipment ID format'),
    param('bandId').isUUID().withMessage('Invalid band ID format'),
    body('notes').optional().isString()
  ],
  validate,
  equipmentController.assignEquipmentToBand
);

/**
 * @route DELETE /api/equipment/:id/band/:bandId
 * @desc Remove equipment from band
 * @access Private
 */
router.delete(
  '/:id/band/:bandId',
  [
    param('id').isUUID().withMessage('Invalid equipment ID format'),
    param('bandId').isUUID().withMessage('Invalid band ID format')
  ],
  validate,
  equipmentController.removeEquipmentFromBand
);

module.exports = router;