import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from './config/db';
import User from './models/User';
import Rider from './models/Rider';
import Order from './models/Order';

// Load env vars
dotenv.config();

//connect to database
connectDB();

// Sample data with raw passwords
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
  },
  {
    name: 'Logistics Manager',
    email: 'logistics@example.com',
    password: 'password123',
    role: 'logistics_manager',
  },
  {
    name: 'Operations Manager',
    email: 'operations@example.com',
    password: 'password123',
    role: 'operations_manager',
  },
  {
    name: 'Alex Martinez',
    email: 'alex@example.com',
    password: 'password123',
    role: 'rider',
  },
  {
    name: 'Maria Rodriguez',
    email: 'maria@example.com',
    password: 'password123',
    role: 'rider',
  },
  {
    name: 'James Thompson',
    email: 'james@example.com',
    password: 'password123',
    role: 'rider',
  },
  {
    name: 'Lisa Kim',
    email: 'lisa@example.com',
    password: 'password123',
    role: 'rider',
  },
  {
    name: 'Tom Baker',
    email: 'tom@example.com',
    password: 'password123',
    role: 'rider',
  },
];

// Import data into database
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Rider.deleteMany({});
    await Order.deleteMany({});

    // Hash passwords for all users
    const hashedUsers = await Promise.all(users.map(async (user) => {
      // Generate salt
      const salt = await bcrypt.genSalt(10);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      console.log(`Hashing password for ${user.email}:`, {
        originalPasswordLength: user.password.length,
        hashedPasswordLength: hashedPassword.length
      });
      
      return {
        ...user,
        password: hashedPassword
      };
    }));

    // Insert users with hashed passwords
    const createdUsers = await User.insertMany(hashedUsers);
    
    // Get admin user for order creation
    const adminUser = createdUsers[0]._id;
    
    // Get rider users
    const alexUser = createdUsers[3];
    const mariaUser = createdUsers[4];
    const jamesUser = createdUsers[5];
    const lisaUser = createdUsers[6];
    const tomUser = createdUsers[7];

    // Create rider profiles (rest of the original seeder code remains the same)
    const alexRider = await Rider.create({
      user: alexUser._id,
      phone: '+1234567890',
      status: 'active',
      location: {
        type: 'Point',
        coordinates: [-84.388, 33.749] // Atlanta coordinates
      },
      deliveriesCompleted: 3,
      ratings: {
        average: 4.7,
        count: 15
      },
      capacity: 5
    });

    const mariaRider = await Rider.create({
      user: mariaUser._id,
      phone: '+1234567891',
      status: 'active',
      location: {
        type: 'Point',
        coordinates: [-84.390, 33.751] // Nearby Atlanta
      },
      deliveriesCompleted: 2,
      ratings: {
        average: 4.5,
        count: 10
      },
      capacity: 4
    });

    const jamesRider = await Rider.create({
      user: jamesUser._id,
      phone: '+1234567892',
      status: 'on_break',
      location: {
        type: 'Point',
        coordinates: [-84.385, 33.745] // Nearby Atlanta
      },
      deliveriesCompleted: 1,
      ratings: {
        average: 4.2,
        count: 5
      },
      capacity: 6
    });

    const lisaRider = await Rider.create({
      user: lisaUser._id,
      phone: '+1234567893',
      status: 'active',
      location: {
        type: 'Point',
        coordinates: [-84.392, 33.747] // Nearby Atlanta
      },
      deliveriesCompleted: 4,
      ratings: {
        average: 4.8,
        count: 20
      },
      capacity: 5
    });

    const tomRider = await Rider.create({
      user: tomUser._id,
      phone: '+1234567894',
      status: 'active',
      location: {
        type: 'Point',
        coordinates: [-84.395, 33.752] // Nearby Atlanta
      },
      deliveriesCompleted: 2,
      ratings: {
        average: 4.6,
        count: 12
      },
      capacity: 4
    });

    // Create order seed data
    const orders = [
      {
        orderNumber: 'ORD-1234',
        customer: {
          name: 'John Smith',
          phone: '+1234567895',
          address: '123 Main St, Atlanta, GA'
        },
        pickup: {
          location: {
            type: 'Point',
            coordinates: [-84.380, 33.740]
          },
          address: '456 Pickup St, Atlanta, GA',
          scheduledTime: new Date(Date.now() + 3600000) // 1 hour from now
        },
        delivery: {
          location: {
            type: 'Point',
            coordinates: [-84.375, 33.735]
          },
          address: '123 Main St, Atlanta, GA',
          scheduledTime: new Date(Date.now() + 7200000), // 2 hours from now
          estimatedTime: new Date(Date.now() + 7200000) // 2 hours from now
        },
        rider: alexRider._id,
        status: 'in_transit',
        items: [
          {
            name: 'Medicine Package',
            quantity: 1,
            weight: 0.5
          }
        ],
        priority: 'high',
        createdBy: adminUser
      },
      {
        orderNumber: 'ORD-1235',
        customer: {
          name: 'Sarah Johnson',
          phone: '+1234567896',
          address: '456 Oak Ave, Atlanta, GA'
        },
        pickup: {
          location: {
            type: 'Point',
            coordinates: [-84.382, 33.742]
          },
          address: '789 Warehouse St, Atlanta, GA',
          scheduledTime: new Date(Date.now() + 1800000) // 30 minutes from now
        },
        delivery: {
          location: {
            type: 'Point',
            coordinates: [-84.379, 33.738]
          },
          address: '456 Oak Ave, Atlanta, GA',
          scheduledTime: new Date(Date.now() + 5400000), // 1.5 hours from now
          estimatedTime: new Date(Date.now() + 5400000) // 1.5 hours from now
        },
        rider: mariaRider._id,
        status: 'picked_up',
        items: [
          {
            name: 'Grocery Package',
            quantity: 3,
            weight: 4.5
          }
        ],
        priority: 'medium',
        createdBy: adminUser
      },
      {
        orderNumber: 'ORD-1236',
        customer: {
          name: 'David Lee',
          phone: '+1234567897',
          address: '789 Pine St, Atlanta, GA'
        },
        pickup: {
          location: {
            type: 'Point',
            coordinates: [-84.384, 33.744]
          },
          address: '321 Store St, Atlanta, GA',
          scheduledTime: new Date(Date.now() - 1800000) // 30 minutes ago
        },
        delivery: {
          location: {
            type: 'Point',
            coordinates: [-84.377, 33.737]
          },
          address: '789 Pine St, Atlanta, GA',
          scheduledTime: new Date(Date.now() + 1800000), // 30 minutes from now
          estimatedTime: new Date(Date.now() + 1800000) // 30 minutes from now
        },
        status: 'exception',
        exception: {
          type: 'customer_unavailable',
          description: 'Customer not at delivery location',
          reportedAt: new Date()
        },
        items: [
          {
            name: 'Electronics',
            quantity: 1,
            weight: 2.0
          }
        ],
        priority: 'medium',
        createdBy: adminUser
      },
      {
        orderNumber: 'ORD-1237',
        customer: {
          name: 'Emily Chen',
          phone: '+1234567898',
          address: '101 Cedar Rd, Atlanta, GA'
        },
        pickup: {
          location: {
            type: 'Point',
            coordinates: [-84.386, 33.746]
          },
          address: '654 Warehouse St, Atlanta, GA',
          scheduledTime: new Date(Date.now() + 5400000) // 1.5 hours from now
        },
        delivery: {
          location: {
            type: 'Point',
            coordinates: [-84.381, 33.741]
          },
          address: '101 Cedar Rd, Atlanta, GA',
          scheduledTime: new Date(Date.now() + 9000000), // 2.5 hours from now
          estimatedTime: new Date(Date.now() + 9000000) // 2.5 hours from now
        },
        rider: jamesRider._id,
        status: 'assigned',
        items: [
          {
            name: 'Office Supplies',
            quantity: 2,
            weight: 3.0
          }
        ],
        priority: 'low',
        createdBy: adminUser
      },
      {
        orderNumber: 'ORD-1238',
        customer: {
          name: 'Michael Brown',
          phone: '+1234567899',
          address: '202 Elm St, Atlanta, GA'
        },
        pickup: {
          location: {
            type: 'Point',
            coordinates: [-84.388, 33.748]
          },
          address: '987 Store St, Atlanta, GA',
          scheduledTime: new Date(Date.now() + 3600000) // 1 hour from now
        },
        delivery: {
          location: {
            type: 'Point',
            coordinates: [-84.383, 33.743]
          },
          address: '202 Elm St, Atlanta, GA',
          scheduledTime: new Date(Date.now() + 7200000), // 2 hours from now
          estimatedTime: new Date(Date.now() + 7200000) // 2 hours from now
        },
        rider: lisaRider._id,
        status: 'pending',
        items: [
          {
            name: 'Clothing',
            quantity: 1,
            weight: 1.0
          }
        ],
        priority: 'medium',
        createdBy: adminUser
      },
      {
        orderNumber: 'ORD-1239',
        customer: {
          name: 'Jessica Wilson',
          phone: '+1234567800',
          address: '303 Maple Ave, Atlanta, GA'
        },
        pickup: {
          location: {
            type: 'Point',
            coordinates: [-84.390, 33.750]
          },
          address: '123 Store Blvd, Atlanta, GA',
          scheduledTime: new Date(Date.now() + 1800000) // 30 minutes from now
        },
        delivery: {
          location: {
            type: 'Point',
            coordinates: [-84.385, 33.745]
          },
          address: '303 Maple Ave, Atlanta, GA',
          scheduledTime: new Date(Date.now() + 5400000), // 1.5 hours from now
          estimatedTime: new Date(Date.now() + 5400000) // 1.5 hours from now
        },
        rider: tomRider._id,
        status: 'in_transit',
        items: [
          {
            name: 'Food Delivery',
            quantity: 2,
            weight: 1.5
          }
        ],
        priority: 'high',
        createdBy: adminUser
      },
      {
        orderNumber: 'ORD-1240',
        customer: {
          name: 'Robert Chen',
          phone: '+1234567801',
          address: '555 Birch Lane, Atlanta, GA'
        },
        pickup: {
          location: {
            type: 'Point',
            coordinates: [-84.392, 33.752]
          },
          address: '444 Pickup Pl, Atlanta, GA',
          scheduledTime: new Date(Date.now() - 3600000) // 1 hour ago
        },
        delivery: {
          location: {
            type: 'Point',
            coordinates: [-84.387, 33.747]
          },
          address: '555 Birch Lane, Atlanta, GA',
          scheduledTime: new Date(Date.now() + 0), // Now
          estimatedTime: new Date(Date.now() + 0) // Now
        },
        status: 'exception',
        exception: {
          type: 'address_issue',
          description: 'Address does not exist',
          reportedAt: new Date(Date.now() - 1800000) // 30 minutes ago
        },
        items: [
          {
            name: 'Documents',
            quantity: 1,
            weight: 0.2
          }
        ],
        priority: 'urgent',
        createdBy: adminUser
      }
    ];
    await Order.insertMany(orders);

    console.log('Data Imported Successfully!');
    console.log('Created Users:', createdUsers.map(user => user.email));
    process.exit();
  } catch (error) {
    console.error(`Seeding Error: ${error}`);
    process.exit(1);
  }
};

// Destroy data function
const destroyData = async () => {
  try {
    await User.deleteMany({});
    await Rider.deleteMany({});
    await Order.deleteMany({});

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

// Run script based on command argument
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}