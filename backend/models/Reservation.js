import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    roomAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    extraCharges: { type: Number, default: 0 },
    chargeNotes: String,
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
    },
    bookingSource: {
      type: String,
      enum: ["online", "reception"],
      default: "reception",
    },
    rooms: [
      {
        room: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Room",
          required: true,
        },
        ratePerNight: {
          type: Number,
          required: true,
          min: 0,
        },
        adults: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        children: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "checked-in", "checked-out", "cancelled"],
      default: "confirmed",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid", "refunded"],
      default: "unpaid",
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentAccessHash: {
      type: String,
      select: false,
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    checkedInAt: Date,
    checkedOutAt: Date,
    cancellationReason: String,
  },
  { timestamps: true },
);

reservationSchema.pre("validate", function () {
  if (
    this.checkInDate &&
    this.checkOutDate &&
    this.checkOutDate <= this.checkInDate
  ) {
    this.invalidate(
      "checkOutDate",
      "Check-out date must be after check-in date",
    );
  }

  if (!this.rooms || this.rooms.length === 0) {
    this.invalidate("rooms", "At least one room is required");
  }
});

export default mongoose.model("Reservation", reservationSchema);
