import express from 'express';
import { check } from 'express-validator';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  assignOrder,
  reportException,
  resolveException,
  getOrderStats
} from '../controllers/order.controller';
import auth from '../middleware/auth';
import authorize from '../middleware/authorize';

const router = express.Router();

// @route   GET /api/orders/stats
// @desc    Get order statistics
// @access  Private
router.get(
  '/stats',
  auth,
  getOrderStats
);

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private
router.get(
  '/',
  auth,
  getOrders
);

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private (Admin, Logistics & Operations Manager)
router.post(
  '/',
  [
    auth,
    authorize(['admin', 'logistics_manager', 'operations_manager']),
    check('customer.name', 'Customer name is required').not().isEmpty(),
    check('customer.phone', 'Customer phone is required').not().isEmpty(),
    check('customer.address', 'Customer address is required').not().isEmpty(),
    check('pickup.location.coordinates', 'Pickup coordinates are required').isArray(),
    check('pickup.address', 'Pickup address is required').not().isEmpty(),
    check('pickup.scheduledTime', 'Pickup scheduled time is required').isISO8601(),
    check('delivery.location.coordinates', 'Delivery coordinates are required').isArray(),
    check('delivery.address', 'Delivery address is required').not().isEmpty(),
    check('delivery.scheduledTime', 'Delivery scheduled time is required').isISO8601(),
    check('delivery.estimatedTime', 'Delivery estimated time is required').isISO8601(),
    check('items', 'Items are required').isArray({ min: 1 }),
    check('items.*.name', 'Item name is required').not().isEmpty(),
    check('items.*.quantity', 'Item quantity is required').isInt({ min: 1 }),
  ],
  createOrder
);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get(
  '/:id',
  auth,
  getOrderById
);

// @route   PUT /api/orders/:id
// @desc    Update order
// @access  Private
router.put(
  '/:id',
  [
    auth,
    check('status', 'Status is required').optional().isIn([
      'pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'exception'
    ]),
  ],
  updateOrder
);

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private (Admin & Logistics Manager only)
router.delete(
  '/:id',
  [
    auth,
    authorize(['admin', 'logistics_manager']),
  ],
  deleteOrder
);

// @route   POST /api/orders/:id/assign
// @desc    Assign order to rider
// @access  Private (Admin, Logistics & Operations Manager)
router.post(
  '/:id/assign',
  [
    auth,
    authorize(['admin', 'logistics_manager', 'operations_manager']),
    check('riderId', 'Rider ID is required').not().isEmpty(),
  ],
  assignOrder
);

// @route   POST /api/orders/:id/exception
// @desc    Report exception for an order
// @access  Private
router.post(
  '/:id/exception',
  [
    auth,
    check('type', 'Exception type is required').isIn([
      'customer_unavailable', 'address_issue', 'package_damaged', 'rider_delayed', 'other'
    ]),
    check('description', 'Exception description is required').not().isEmpty(),
  ],
  reportException
);

// @route   POST /api/orders/:id/resolve-exception
// @desc    Resolve exception for an order
// @access  Private (Admin, Logistics & Operations Manager)
router.post(
  '/:id/resolve-exception',
  [
    auth,
    authorize(['admin', 'logistics_manager', 'operations_manager']),
    check('resolution', 'Resolution is required').not().isEmpty(),
    check('status', 'Status is required').isIn([
      'pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'
    ]),
  ],
  resolveException
);

export default router;