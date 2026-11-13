
import mongoose from 'mongoose'

const housekeepingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    taskType: {
      type: String,
      enum: ['cleaning', 'maintenance'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    notes: {
      type: String,
      trim: true,
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

export default mongoose.model('Housekeeping', housekeepingSchema)
