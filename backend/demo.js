// Isolated demonstration database; never connects to the configured production database.
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import User from "./models/User.js";
import Room from "./models/Room.js";
import Settings from "./models/Settings.js";

process.env.MONGOMS_DOWNLOAD_DIR ||= resolve("../.mongodb-binaries");
const db = await MongoMemoryReplSet.create({
  replSet: { count: 1 },
  binary: { version: "7.0.14" },
});
await mongoose.connect(db.getUri());
const { default: app } = await import("./app.js");
await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
const password = randomBytes(12).toString("base64url");
await User.create({
  name: "Demo Administrator",
  email: "admin@demo.local",
  password: await bcrypt.hash(password, 12),
  role: "admin",
});
await Room.create([
  {
    roomNumber: "101",
    roomType: "Standard",
    floor: 1,
    capacity: 2,
    pricePerNight: 1999,
    description:
      "A welcoming room with comfortable bedding and everything you need for a restful stay.",
    amenities: ["Wi-Fi", "Air conditioning", "TV"],
    image: "/img/homestay-hotel.jpg",
  },
  {
    roomNumber: "102",
    roomType: "Deluxe",
    floor: 1,
    capacity: 2,
    pricePerNight: 2999,
    description:
      "Generous space, soft furnishings and a peaceful setting for your next getaway.",
    amenities: ["Wi-Fi", "Air conditioning", "TV"],
    image: "/img/images.jpeg",
  },
  {
    roomNumber: "201",
    roomType: "Suite",
    floor: 2,
    capacity: 4,
    pricePerNight: 4999,
    description:
      "Room for the whole family with a spacious layout and a relaxing atmosphere.",
    amenities: ["Wi-Fi", "Air conditioning", "TV"],
    image:
      "/img/Jeffrey-Beers-International-Park-Hyatts-Manhattan-Sky-Suite-1.jpg",
  },
]);
await Settings.create({
  name: "Hotel Palace",
  email: "reception@demo.local",
  address: "Demo hotel",
  phone: "0000000000",
  taxPercent: 0,
});
const port = Number(process.env.PORT || 5000);
const server = app.listen(port, "127.0.0.1", () => {
  console.log(
    `Demo API: http://127.0.0.1:${port}\nLogin: admin@demo.local\nPassword: ${password}\nTemporary demo database: records are removed when stopped. Start the client with npm run dev.`,
  );
});
server.on("error", async (error) => {
  console.error(`Could not start demo API: ${error.message}`);
  await close();
});
async function close() {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  await db.stop();
  process.exit(0);
}
process.on("SIGINT", close);
process.on("SIGTERM", close);
