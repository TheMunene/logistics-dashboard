import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  pickup: {
    location: {
      type: string;
      coordinates: [number, number]; // [longitude, latitude]
    };
    address: string;
    scheduledTime: Date;
    completedTime?: Date;
  };
  delivery: {
    location: {
      type: string;
      coordinates: [number, number]; // [longitude, latitude]
    };
    address: string;
    scheduledTime: Date;
    estimatedTime: Date;
    actualTime?: Date;
  };
  rider?: mongoose.Types.ObjectId;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'exception';
  exception?: {
    type: string;
    description: string;
    reportedAt: Date;
    resolvedAt?: Date;
    resolution?: string;
  };
  items: {
    name: string;
    quantity: number;
    weight?: number;
  }[];
  totalWeight?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy: mongoose.Types.ObjectId;
  feedback?: {
    rating: number;
    comment?: string;
    submittedAt: Date;
  };
  notes?: string;
}

const OrderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    pickup: {
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
        },
      },
      address: {
        type: String,
        required: true,
      },
      scheduledTime: {
        type: Date,
        required: true,
      },
      completedTime: {
        type: Date,
      },
    },
    delivery: {
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
        },
      },
      address: {
        type: String,
        required: true,
      },
      scheduledTime: {
        type: Date,
        required: true,
      },
      estimatedTime: {
        type: Date,
        required: true,
      },
      actualTime: {
        type: Date,
      },
    },
    rider: {
      type: Schema.Types.ObjectId,
      ref: 'Rider',
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'exception'],
      default: 'pending',
    },
    exception: {
      type: {
        type: String,
        enum: ['customer_unavailable', 'address_issue', 'package_damaged', 'rider_delayed', 'other'],
      },
      description: {
        type: String,
      },
      reportedAt: {
        type: Date,
      },
      resolvedAt: {
        type: Date,
      },
      resolution: {
        type: String,
      },
    },
    items: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        weight: {
          type: Number,
        },
      },
    ],
    totalWeight: {
      type: Number,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
      },
      submittedAt: {
        type: Date,
      },
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Create indexes for geospatial queries
OrderSchema.index({ 'pickup.location': '2dsphere' });
OrderSchema.index({ 'delivery.location': '2dsphere' });

// Pre-save hook to generate order number if not provided
OrderSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${(count + 1).toString().padStart(4, '0')}`;
  }
  
  next();
});

export default mongoose.model<IOrder>('Order', OrderSchema);