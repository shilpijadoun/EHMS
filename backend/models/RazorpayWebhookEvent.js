import mongoose from "mongoose";

const razorpayWebhookEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true, trim: true },
    event: { type: String, required: true, trim: true },
    receivedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model(
  "RazorpayWebhookEvent",
  razorpayWebhookEventSchema,
);
