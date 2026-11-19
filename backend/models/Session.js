import mongoose from "mongoose";
export default mongoose.model(
  "Session",
  new mongoose.Schema({
    tokenHash: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    expiresAt: { type: Date, expires: 0 },
  }),
);
