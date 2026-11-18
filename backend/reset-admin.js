import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Session from "./models/Session.js";
import { email, password } from "./domain.js";
try {
  const account = email(process.env.ADMIN_EMAIL),
    nextPassword = password(process.env.ADMIN_PASSWORD);
  await connectDB();
  const user = await User.findOne({
    email: account,
    role: "admin",
    isActive: true,
  });
  if (!user) throw new Error("Active administrator not found");
  user.password = await bcrypt.hash(nextPassword, 12);
  await user.save();
  await Session.deleteMany({ user: user._id });
  console.log("Administrator password reset; existing sessions invalidated.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
