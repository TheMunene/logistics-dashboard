import express from 'express';
import { check } from 'express-validator';
import {
  createRider,
  getRiders,
  getRiderById,
  updateRider,
  deleteRider,
  updateRiderLocation,
  getRiderOrders,
  updateRiderStatus,
  getRiderStats,
  getNearbyRiders,
  updateRiderAvailability
} from '../controllers/rider.controller';
import auth from '../middleware/auth';
import authorize from '../middleware/authorize';

const router = express.Router();

// @route   GET /api/riders/stats
// @desc    Get rider statistics
// @access  Private (Admin & Managers)
router.get(
  '/stats',
  [
    auth,
    authorize(['admin', 'logistics_manager', 'operations_manager']),
  ],
  getRiderStats
);

// @route   GET /api/riders/nearby
// @desc    Get nearby riders for assignment
// @access  Private (Admin & Managers)
router.get(
  '/nearby',
  [
    auth,
    authorize(['admin', 'logistics_manager', 'operations_manager']),
  ],
  getNearbyRiders
);

// @route   GET /api/riders
// @desc    Get all riders
// @access  Private
router.get(
  '/',
  [
    auth,
    authorize(['admin', 'logistics_manager', 'operations_manager']),
  ],
  getRiders
);

// @route   POST /api/riders
// @desc    Create rider profile
// @access  Private (Admin & Logistics Manager)
router.post(
  '/',
  [
    auth,
    authorize(['admin', 'logistics_manager']),
    check('userId', 'User ID is required').not().isEmpty(),
    check('phone', 'Phone number is required').not().isEmpty(),
    check('capacity', 'Capacity must be a positive number').optional().isInt({ min: 1 }),
  ],
  createRider
);

// @route   GET /api/riders/:id
// @desc    Get rider by ID
// @access  Private
router.get(
  '/:id',
  auth,
  getRiderById
);

// @route   PUT /api/riders/:id
// @desc    Update rider profile
// @access  Private
router.put(
  '/:id',
  [
    auth,
    check('status', 'Invalid status').optional().isIn(['active', 'inactive', 'on_break', 'offline']),
    check('capacity', 'Capacity must be a positive number').optional().isInt({ min: 1 }),
  ],
  updateRider
);

// @route   DELETE /api/riders/:id
// @desc    Delete rider
// @access  Private (Admin & Logistics Manager)
router.delete(
  '/:id',
  [
    auth,
    authorize(['admin', 'logistics_manager']),
  ],
  deleteRider
);

// @route   POST /api/riders/:id/location
// @desc    Update rider location
// @access  Private
router.post(
  '/:id/location',
  [
    auth,
    check('longitude', 'Longitude is required').isNumeric(),
    check('latitude', 'Latitude is required').isNumeric(),
  ],
  updateRiderLocation
);

// @route   GET /api/riders/:id/orders
// @desc    Get rider's orders
// @access  Private
router.get(
  '/:id/orders',
  auth,
  getRiderOrders
);

// @route   POST /api/riders/:id/status
// @desc    Update rider status
// @access  Private
router.post(
  '/:id/status',
  [
    auth,
    check('status', 'Status is required').isIn(['active', 'inactive', 'on_break', 'offline']),
  ],
  updateRiderStatus
);

// @route   POST /api/riders/:id/availability
// @desc    Update rider availability
// @access  Private
router.post(
  '/:id/availability',
  [
    auth,
    check('availability', 'Availability is required').isArray(),
    check('availability.*.date', 'Date is required for each availability').isISO8601(),
    check('availability.*.slots', 'Slots are required for each availability').isArray(),
    check('availability.*.slots.*.startTime', 'Start time is required for each slot').isISO8601(),
    check('availability.*.slots.*.endTime', 'End time is required for each slot').isISO8601(),
  ],
  updateRiderAvailability
);

export default router;