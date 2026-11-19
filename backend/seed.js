import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Room from "./models/Room.js";
import Settings from "./models/Settings.js";
try {
  const hasAdminCredentials = Boolean(
    process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD,
  );
  await connectDB();
  if (hasAdminCredentials && !(await User.exists({ role: "admin" })))
    await User.create({
      name: "Hotel Administrator",
      email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
      role: "admin",
    });
  for (const [number, type, rate, capacity] of [
    ["101", "Standard", 1999, 2],
    ["102", "Deluxe", 2999, 2],
    ["201", "Suite", 4999, 4],
  ]) {
    await Room.updateOne(
      { roomNumber: number },
      {
        $setOnInsert: {
          roomNumber: number,
          roomType: type,
          floor: Number(number[0]),
          capacity,
          pricePerNight: rate,
          description: `Comfortable ${type.toLowerCase()} room at Hotel Palace.`,
          amenities: ["Wi-Fi", "Air conditioning", "TV"],
        },
      },
      { upsert: true },
    );
  }
  await Settings.updateOne(
    { _id: "hotel" },
    {
      $setOnInsert: {
        name: "Hotel Palace",
        email: process.env.ADMIN_EMAIL?.trim().toLowerCase() || undefined,
        taxPercent: 0,
      },
    },
    { upsert: true },
  );
  console.log(
    hasAdminCredentials
      ? "Initial setup complete. Existing records were preserved."
      : "Rooms and settings seeded. Set ADMIN_EMAIL and ADMIN_PASSWORD, then run npm run seed again to create the first administrator.",
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
