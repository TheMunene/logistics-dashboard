import mongoose, { Document, Schema } from 'mongoose';

export interface IRider extends Document {
  user: mongoose.Types.ObjectId;
  phone: string;
  status: 'active' | 'inactive' | 'on_break' | 'offline';
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  currentOrders: mongoose.Types.ObjectId[];
  deliveriesCompleted: number;
  ratings: {
    average: number;
    count: number;
  };
  capacity: number;
  availability: {
    date: Date;
    slots: {
      startTime: Date;
      endTime: Date;
      booked: boolean;
    }[];
  }[];
}

const RiderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_break', 'offline'],
      default: 'offline',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    currentOrders: [{
      type: Schema.Types.ObjectId,
      ref: 'Order',
    }],
    deliveriesCompleted: {
      type: Number,
      default: 0,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    capacity: {
      type: Number,
      default: 5, // Default capacity of orders a rider can handle
    },
    availability: [{
      date: {
        type: Date,
        required: true,
      },
      slots: [{
        startTime: {
          type: Date,
          required: true,
        },
        endTime: {
          type: Date,
          required: true,
        },
        booked: {
          type: Boolean,
          default: false,
        }
      }]
    }]
  },
  { timestamps: true }
);

// Create index for geospatial queries
RiderSchema.index({ location: '2dsphere' });

export default mongoose.model<IRider>('Rider', RiderSchema);