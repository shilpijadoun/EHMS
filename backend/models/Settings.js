import mongoose from "mongoose";
export default mongoose.model(
  "Settings",
  new mongoose.Schema({
    _id: { type: String, default: "hotel" },
    name: { type: String, default: "Hotel Palace" },
    email: String,
    phone: String,
    address: String,
    taxPercent: { type: Number, default: 0 },
  }),
);
