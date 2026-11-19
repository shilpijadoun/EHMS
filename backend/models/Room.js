
import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema(
  {
    image: { type: String, default: '/img/homestay-hotel.jpg' },
    bookingVersion: { type: Number, default: 0 },
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    roomType: {
      type: String,
      required: true,
      enum: ['Standard', 'Deluxe', 'Suite'],
    },
    floor: {
      type: Number,
      required: true,
      min: 0,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    amenities: [{
      type: String,
      trim: true,
    }],
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Cleaning', 'Maintenance'],
      default: 'Available',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Room', roomSchema)
