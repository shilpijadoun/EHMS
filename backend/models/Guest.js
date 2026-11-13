
import mongoose from 'mongoose'

const guestSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    idProofType: {
      type: String,
      enum: ['Passport', 'Driving License', 'National ID', 'Other'],
    },
    idVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Guest', guestSchema)
