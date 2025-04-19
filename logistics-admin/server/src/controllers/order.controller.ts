import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Order from '../models/Order';
import Rider from '../models/Rider';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newOrder = new Order({
      ...req.body,
      createdBy: req.user?.id
    });

    const order = await newOrder.save();

    res.status(201).json(order);
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req: Request, res: Response) => {
  try {
    const { status, rider, priority, page = 1, limit = 10 } = req.query;
    const queryFilter: any = {};

    if (status) queryFilter.status = status;
    if (rider) queryFilter.rider = rider;
    if (priority) queryFilter.priority = priority;

    // For riders, only show their assigned orders
    if (req.user?.role === 'rider') {
      const rider = await Rider.findOne({ user: req.user.id });
      if (!rider) {
        return res.status(404).json({ message: 'Rider profile not found' });
      }
      queryFilter.rider = rider._id;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const orders = await Order.find(queryFilter)
      .populate('rider', 'user')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(queryFilter);

    res.json({
      orders,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Error in getOrders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('rider', 'user')
      .populate('createdBy', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if rider is accessing another rider's order
    if (req.user?.role === 'rider') {
      const rider = await Rider.findOne({ user: req.user.id });
      if (!rider || (order.rider && order.rider.toString() !== rider._id.toString())) {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
    }

    res.json(order);
  } catch (error) {
    console.error('Error in getOrderById:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
export const updateOrder = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // For riders, only allow status updates
    if (req.user?.role === 'rider') {
      const rider = await Rider.findOne({ user: req.user.id });
      if (!rider || (order.rider && order.rider.toString() !== rider._id.toString())) {
        return res.status(403).json({ message: 'Not authorized to update this order' });
      }
      
      // Only update status and related fields
      const allowedUpdates = ['status'];
      if (req.body.status === 'exception') {
        allowedUpdates.push('exception');
      }
      if (req.body.status === 'picked_up') {
        order.pickup.completedTime = new Date();
      }
      if (req.body.status === 'delivered') {
        order.delivery.actualTime = new Date();
        // Update rider delivery count
        await Rider.findByIdAndUpdate(
          rider._id,
          { $inc: { deliveriesCompleted: 1 } }
        );
      }
      
      // Filter request body to only include allowed updates
      const updates = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});
      
      order = await Order.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true }
      );
    } else {
      // Admins, logistics managers, and operations managers can update everything
      order = await Order.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
    }

    res.json(order);
  } catch (error) {
    console.error('Error in updateOrder:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private (Admin & Logistics Manager only)
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only admin and logistics manager can delete orders
    if (!['admin', 'logistics_manager'].includes(req.user?.role || '')) {
      return res.status(403).json({ message: 'Not authorized to delete orders' });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({ message: 'Order removed' });
  } catch (error) {
    console.error('Error in deleteOrder:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Assign order to rider
// @route   POST /api/orders/:id/assign
// @access  Private (Admin, Logistics & Operations Manager)
export const assignOrder = async (req: Request, res: Response) => {
  const { riderId } = req.body;

  if (!riderId) {
    return res.status(400).json({ message: 'Rider ID is required' });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    // Check if rider is active
    if (rider.status !== 'active') {
      return res.status(400).json({ message: 'Rider is not active' });
    }

    // Update order
    order.rider = rider._id;
    order.status = 'assigned';
    await order.save();

    // Add order to rider's current orders
    await Rider.findByIdAndUpdate(
      riderId,
      { $addToSet: { currentOrders: order._id } }
    );

    res.json(order);
  } catch (error) {
    console.error('Error in assignOrder:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Report exception for an order
// @route   POST /api/orders/:id/exception
// @access  Private
export const reportException = async (req: Request, res: Response) => {
  const { type, description } = req.body;

  if (!type || !description) {
    return res.status(400).json({ message: 'Exception type and description are required' });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is rider assigned to this order
    if (req.user?.role === 'rider') {
      const rider = await Rider.findOne({ user: req.user.id });
      if (!rider || order.rider?.toString() !== rider._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to report exception for this order' });
      }
    }

    // Update order with exception
    order.status = 'exception';
    order.exception = {
      type,
      description,
      reportedAt: new Date()
    };

    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Error in reportException:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Resolve exception for an order
// @route   POST /api/orders/:id/resolve-exception
// @access  Private (Admin, Logistics & Operations Manager)
export const resolveException = async (req: Request, res: Response) => {
  const { resolution, status } = req.body;

  if (!resolution || !status) {
    return res.status(400).json({ message: 'Resolution and status are required' });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'exception') {
      return res.status(400).json({ message: 'Order is not in exception status' });
    }

    // Update order
    order.status = status;
    if (order.exception) {
      order.exception.resolution = resolution;
      order.exception.resolvedAt = new Date();
    }

    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Error in resolveException:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private
export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const totalOrders = await Order.countDocuments();
    const activeOrders = await Order.countDocuments({ 
      status: { 
        $in: ['pending', 'assigned', 'picked_up', 'in_transit'] 
      } 
    });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const exceptionOrders = await Order.countDocuments({ status: 'exception' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = await Order.countDocuments({ 
      createdAt: { $gte: today } 
    });

    const onTimeDeliveries = await Order.countDocuments({
      status: 'delivered',
      'delivery.actualTime': { $lte: '$delivery.estimatedTime' }
    });

    const onTimeRate = deliveredOrders > 0 ? (onTimeDeliveries / deliveredOrders) * 100 : 0;

    // Get orders by status for pie chart
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalOrders,
      activeOrders,
      deliveredOrders,
      exceptionOrders,
      todayOrders,
      onTimeRate,
      ordersByStatus: ordersByStatus.map(item => ({
        status: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Error in getOrderStats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};