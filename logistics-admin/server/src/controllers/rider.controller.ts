import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Rider from '../models/Rider';
import User from '../models/User';
import Order from '../models/Order';

// @desc    Create rider profile
// @route   POST /api/riders
// @access  Private (Admin & Logistics Manager)
export const createRider = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, phone, capacity } = req.body;

  try {
    // Check if user exists and is a rider
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'rider') {
      return res.status(400).json({ message: 'User must have rider role' });
    }

    // Check if rider profile already exists
    let rider = await Rider.findOne({ user: userId });
    if (rider) {
      return res.status(400).json({ message: 'Rider profile already exists for this user' });
    }

    // Create rider profile
    rider = new Rider({
      user: userId,
      phone,
      capacity: capacity || 5
    });

    await rider.save();

    res.status(201).json(rider);
  } catch (error) {
    console.error('Error in createRider:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all riders
// @route   GET /api/riders
// @access  Private
export const getRiders = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const queryFilter: any = {};

    if (status) queryFilter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    
    const riders = await Rider.find(queryFilter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Rider.countDocuments(queryFilter);

    res.json({
      riders,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Error in getRiders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get rider by ID
// @route   GET /api/riders/:id
// @access  Private
export const getRiderById = async (req: Request, res: Response) => {
  try {
    const rider = await Rider.findById(req.params.id)
      .populate('user', 'name email')
      .populate('currentOrders');

    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    // If rider is accessing their own profile, allow it
    if (req.user?.role === 'rider') {
      const riderUser = await Rider.findOne({ user: req.user.id });
      if (!riderUser || riderUser._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Not authorized to view this rider' });
      }
    }

    res.json(rider);
  } catch (error) {
    console.error('Error in getRiderById:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update rider profile
// @route   PUT /api/riders/:id
// @access  Private
export const updateRider = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let rider = await Rider.findById(req.params.id);

    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    // If rider is updating their own profile, only allow certain fields
    if (req.user?.role === 'rider') {
      const riderUser = await Rider.findOne({ user: req.user.id });
      if (!riderUser || riderUser._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Not authorized to update this rider' });
      }
      
      // Only allow status and location updates for riders
      const allowedUpdates = ['status', 'location'];
      const updates = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});
      
      rider = await Rider.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true }
      );
    } else {
      // Admins and managers can update everything
      rider = await Rider.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
    }

    res.json(rider);
  } catch (error) {
    console.error('Error in updateRider:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete rider
// @route   DELETE /api/riders/:id
// @access  Private (Admin & Logistics Manager)
export const deleteRider = async (req: Request, res: Response) => {
  try {
    const rider = await Rider.findById(req.params.id);

    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    // Check for active orders
    const activeOrders = await Order.countDocuments({ 
      rider: rider._id,
      status: { $in: ['assigned', 'picked_up', 'in_transit'] }
    });

    if (activeOrders > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete rider with active orders. Reassign or complete orders first.'
      });
    }

    await Rider.findByIdAndDelete(req.params.id);

    res.json({ message: 'Rider profile removed' });
  } catch (error) {
    console.error('Error in deleteRider:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update rider location
// @route   POST /api/riders/:id/location
// @access  Private
export const updateRiderLocation = async (req: Request, res: Response) => {
  const { longitude, latitude } = req.body;

  if (!longitude || !latitude) {
    return res.status(400).json({ message: 'Longitude and latitude are required' });
  }

  try {
    const rider = await Rider.findById(req.params.id);

    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    // Only allow rider to update their own location or admins/managers
    if (req.user?.role === 'rider') {
      const riderUser = await Rider.findOne({ user: req.user.id });
      if (!riderUser || riderUser._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Not authorized to update this rider location' });
      }
    }

    rider.location.coordinates = [Number(longitude), Number(latitude)];
    await rider.save();

    res.json(rider);
  } catch (error) {
    console.error('Error in updateRiderLocation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get rider's orders
// @route   GET /api/riders/:id/orders
// @access  Private
export const getRiderOrders = async (req: Request, res: Response) => {
  try {
    const rider = await Rider.findById(req.params.id);

    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    // Only allow rider to view their own orders or admins/managers
    if (req.user?.role === 'rider') {
      const riderUser = await Rider.findOne({ user: req.user.id });
      if (!riderUser || riderUser._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Not authorized to view this rider orders' });
      }
    }

    const { status, page = 1, limit = 10 } = req.query;
    const queryFilter: any = { rider: rider._id };

    if (status) queryFilter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    
    const orders = await Order.find(queryFilter)
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
    console.error('Error in getRiderOrders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update rider status
// @route   POST /api/riders/:id/status
// @access  Private
export const updateRiderStatus = async (req: Request, res: Response) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  if (!['active', 'inactive', 'on_break', 'offline'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const rider = await Rider.findById(req.params.id);

    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    // Only allow rider to update their own status or admins/managers
    if (req.user?.role === 'rider') {
      const riderUser = await Rider.findOne({ user: req.user.id });
      if (!riderUser || riderUser._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Not authorized to update this rider status' });
      }
    }

    rider.status = status;
    await rider.save();

    res.json(rider);
  } catch (error) {
    console.error('Error in updateRiderStatus:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get rider statistics
// @route   GET /api/riders/stats
// @access  Private (Admin & Managers)
export const getRiderStats = async (req: Request, res: Response) => {
  try {
    const totalRiders = await Rider.countDocuments();
    const activeRiders = await Rider.countDocuments({ status: 'active' });
    const onBreakRiders = await Rider.countDocuments({ status: 'on_break' });
    const inactiveRiders = await Rider.countDocuments({ status: 'inactive' });
    
    // Get top riders by deliveries completed
    const topRiders = await Rider.find()
      .sort({ deliveriesCompleted: -1 })
      .limit(5)
      .populate('user', 'name');
    
    // Get riders by status for pie chart
    const ridersByStatus = await Rider.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalRiders,
      activeRiders,
      onBreakRiders,
      inactiveRiders,
      topRiders: topRiders.map(rider => ({
        id: rider._id,
        name: (rider.user as any).name,
        deliveriesCompleted: rider.deliveriesCompleted
      })),
      ridersByStatus: ridersByStatus.map(item => ({
        status: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Error in getRiderStats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get nearby riders for assignment
// @route   GET /api/riders/nearby
// @access  Private (Admin & Managers)
export const getNearbyRiders = async (req: Request, res: Response) => {
  const { longitude, latitude, maxDistance = 5000 } = req.query; // distance in meters

  if (!longitude || !latitude) {
    return res.status(400).json({ message: 'Longitude and latitude are required' });
  }

  try {
    const riders = await Rider.find({
      status: 'active',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
          },
          $maxDistance: Number(maxDistance)
        }
      }
    })
    .populate('user', 'name')
    .limit(10);

    res.json(riders);
  } catch (error) {
    console.error('Error in getNearbyRiders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update rider availability
// @route   POST /api/riders/:id/availability
// @access  Private
export const updateRiderAvailability = async (req: Request, res: Response) => {
  const { availability } = req.body;

  if (!availability || !Array.isArray(availability)) {
    return res.status(400).json({ message: 'Valid availability data is required' });
  }

  try {
    const rider = await Rider.findById(req.params.id);

    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    // Only allow rider to update their own availability or admins/managers
    if (req.user?.role === 'rider') {
      const riderUser = await Rider.findOne({ user: req.user.id });
      if (!riderUser || riderUser._id.toString() !== req.params.id) {
        return res.status(403).json({ message: 'Not authorized to update this rider availability' });
      }
    }

    rider.availability = availability;
    await rider.save();

    res.json(rider);
  } catch (error) {
    console.error('Error in updateRiderAvailability:', error);
    res.status(500).json({ message: 'Server error' });
  }
};