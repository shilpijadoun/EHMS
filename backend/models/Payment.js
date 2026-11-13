
import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'online', 'bank_transfer'],
      required: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'successful', 'failed', 'refunded'],
      default: 'successful',
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Payment', paymentSchema)
