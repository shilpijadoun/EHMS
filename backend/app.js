import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import User from "./models/User.js";
import Room from "./models/Room.js";
import Guest from "./models/Guest.js";
import Reservation from "./models/Reservation.js";
import Payment from "./models/Payment.js";
import Housekeeping from "./models/Housekeeping.js";
import Settings from "./models/Settings.js";
import Session from "./models/Session.js";
import RazorpayWebhookEvent from "./models/RazorpayWebhookEvent.js";
import { auth, roles, hash } from "./middleware/authMiddleware.js";
import {
  fail,
  dates,
  money,
  paymentState,
  text,
  email,
  password,
  hotelDate,
} from "./domain.js";

const app = express();
const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const razorpayBaseUrl = () =>
  process.env.RAZORPAY_API_BASE_URL || "https://api.razorpay.com/v1";
const razorpayReady = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
const equal = (left, right) => {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
};
const paymentTokenHash = (value) =>
  createHash("sha256").update(String(value)).digest("hex");
const paise = (value) => Math.round(money(value) * 100);
async function razorpayRequest(path, method, payload) {
  if (!razorpayReady()) fail("Online payments are not configured", 503);
  const credentials = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
  ).toString("base64");
  const response = await fetch(`${razorpayBaseUrl()}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("Razorpay API error", response.status, data?.error?.code);
    fail("Payment provider could not process the request", 502);
  }
  return data;
}
async function settleRazorpayPayment({
  razorpayOrderId,
  razorpayPaymentId,
  amount,
  currency,
}) {
  let result;
  await transaction(async (session) => {
    const payment = await Payment.findOne({ razorpayOrderId }).session(session);
    if (!payment) fail("Payment order not found", 404);
    if (payment.status === "successful") {
      if (payment.razorpayPaymentId !== razorpayPaymentId)
        fail("Payment order was already settled", 409);
      result = payment;
      return;
    }
    if (payment.status !== "pending") fail("Payment cannot be settled", 409);
    if (currency !== "INR" || amount !== paise(payment.amount))
      fail("Payment amount does not match the reservation", 400);
    const booking = await Reservation.findById(payment.reservation).session(
      session,
    );
    if (
      !booking ||
      ["cancelled", "checked-out"].includes(booking.bookingStatus)
    )
      fail("Booking is closed", 409);
    if (payment.amount > money(booking.totalAmount - booking.paidAmount))
      fail("Payment exceeds the outstanding balance", 409);
    payment.status = "successful";
    payment.method = "online";
    payment.transactionId = razorpayPaymentId;
    payment.razorpayPaymentId = razorpayPaymentId;
    booking.paidAmount = money(booking.paidAmount + payment.amount);
    booking.paymentStatus = paymentState(
      booking.totalAmount,
      booking.paidAmount,
    );
    await payment.save({ session });
    await booking.save({ session });
    result = payment;
  });
  return result;
}
app.disable("x-powered-by");
app.use(cors({ origin, credentials: true }));
app.post(
  "/api/webhooks/razorpay",
  express.raw({ type: "application/json", limit: "100kb" }),
  async (req, res, next) => {
    try {
      if (!process.env.RAZORPAY_WEBHOOK_SECRET)
        return res.status(503).json({ message: "Webhook is not configured" });
      const signature = req.get("x-razorpay-signature");
      const expected = createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(req.body)
        .digest("hex");
      if (!signature || !equal(expected, signature))
        return res.status(400).json({ message: "Invalid webhook signature" });
      const payload = JSON.parse(req.body.toString("utf8"));
      const eventId =
        req.get("x-razorpay-event-id") ||
        createHash("sha256").update(req.body).digest("hex");
      try {
        await RazorpayWebhookEvent.create({
          eventId,
          event: String(payload.event || "unknown"),
        });
      } catch (error) {
        if (error.code === 11000)
          return res.status(200).json({ received: true, duplicate: true });
        throw error;
      }
      const payment = payload?.payload?.payment?.entity;
      if (
        payload.event === "payment.captured" &&
        payment?.order_id &&
        payment?.id
      ) {
        try {
          await settleRazorpayPayment({
            razorpayOrderId: payment.order_id,
            razorpayPaymentId: payment.id,
            amount: payment.amount,
            currency: payment.currency,
          });
        } catch (error) {
          if (error.status !== 404) throw error;
        }
      }
      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  },
);
app.use(express.json({ limit: "100kb" }));
app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Cache-Control", "no-store");
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.headers.origin &&
    req.headers.origin !== origin
  )
    return res.status(403).json({ message: "Origin not allowed" });
  next();
});
const safe = (user) => {
  const value = user.toObject();
  delete value.password;
  return value;
};
const cookie = {
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
const attempts = new Map();
function limit(req, res, next) {
  const now = Date.now(),
    key = req.ip;
  for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
  const value = attempts.get(key) || { count: 0, until: now + 900000 };
  value.count++;
  attempts.set(key, value);
  if (value.count > 30)
    return res
      .status(429)
      .json({ message: "Too many attempts. Try again in 15 minutes." });
  next();
}
const management = roles("admin", "manager");
const transaction = (work) => mongoose.connection.transaction(work);
const overlap = (room, start, end) => ({
  "rooms.room": room,
  bookingStatus: { $in: ["pending", "confirmed", "checked-in"] },
  checkInDate: { $lt: end },
  checkOutDate: { $gt: start },
});
app.get("/api/health", (req, res) => res.json({ success: true }));
app.post("/api/auth/login", limit, async (req, res) => {
  const user = await User.findOne({
    email: email(req.body.email),
    isActive: true,
  }).select("+password");
  if (
    !user ||
    typeof req.body.password !== "string" ||
    !(await bcrypt.compare(req.body.password, user.password))
  )
    fail("Invalid email or password", 401);
  const token = randomBytes(32).toString("hex");
  await Session.create({
    user: user._id,
    tokenHash: hash(token),
    expiresAt: new Date(Date.now() + 28800000),
  });
  res.cookie("ehms", token, { ...cookie, maxAge: 28800000 }).json(safe(user));
});
app.get("/api/auth/me", auth, (req, res) => res.json(safe(req.user)));
app.post("/api/auth/logout", auth, async (req, res) => {
  await req.session.deleteOne();
  res.clearCookie("ehms", cookie).json({ success: true });
});
app.put("/api/auth/profile", auth, async (req, res) => {
  req.user.name = text(req.body.name, "Name");
  req.user.phone = text(req.body.phone, "Phone", 30);
  await req.user.save();
  res.json(safe(req.user));
});
app.put("/api/auth/password", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  if (
    typeof req.body.current !== "string" ||
    !(await bcrypt.compare(req.body.current, user.password))
  )
    fail("Current password is incorrect");
  user.password = await bcrypt.hash(password(req.body.password), 12);
  await user.save();
  await Session.deleteMany({ user: user._id });
  res.clearCookie("ehms", cookie).json({ success: true });
});
app.get("/api/settings", async (req, res) =>
  res.json(
    (await Settings.findById("hotel")) || {
      name: "Hotel Palace",
      taxPercent: 0,
    },
  ),
);
app.put("/api/settings", auth, management, async (req, res) => {
  const taxPercent = money(req.body.taxPercent);
  if (taxPercent > 100) fail("Tax must be between 0 and 100");
  res.json(
    await Settings.findByIdAndUpdate(
      "hotel",
      {
        name: text(req.body.name, "Hotel name"),
        email: email(req.body.email),
        phone: text(req.body.phone, "Phone", 30),
        address: text(req.body.address, "Address", 500),
        taxPercent,
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    ),
  );
});
app.get("/api/rooms", async (req, res) => {
  const query = { isActive: true };
  if (req.query.checkIn || req.query.checkOut) {
    const { start, end } = dates(req.query.checkIn, req.query.checkOut);
    const busy = await Reservation.find({
      bookingStatus: { $in: ["pending", "confirmed", "checked-in"] },
      checkInDate: { $lt: end },
      checkOutDate: { $gt: start },
    }).distinct("rooms.room");
    query._id = { $nin: busy };
    query.status = { $nin: ["Maintenance", "Cleaning"] };
  }
  if (req.query.guests) {
    const n = Number(req.query.guests);
    if (!Number.isInteger(n) || n < 1) fail("Invalid guest count");
    query.capacity = { $gte: n };
  }
  res.json(
    await Room.find(query).sort({ roomNumber: 1 }).select("-bookingVersion"),
  );
});
app.get("/api/rooms/:id", async (req, res) => {
  const room = await Room.findOne({
    _id: req.params.id,
    isActive: true,
  }).select("-bookingVersion");
  if (!room) fail("Room not found", 404);
  res.json(room);
});
function roomFields(body) {
  if (
    !Number.isInteger(Number(body.floor)) ||
    !Number.isInteger(Number(body.capacity))
  )
    fail("Floor and capacity must be whole numbers");
  const image = body.image || "/img/homestay-hotel.jpg";
  if (!/^\/img\/[\w .()-]+$/.test(image) && !/^https:\/\//.test(image))
    fail("Use a local image path or HTTPS URL");
  return {
    roomNumber: text(body.roomNumber, "Room number", 20),
    roomType: body.roomType,
    floor: Number(body.floor),
    capacity: Number(body.capacity),
    pricePerNight: money(body.pricePerNight),
    description: text(body.description, "Description", 2000),
    image,
    amenities: Array.isArray(body.amenities)
      ? body.amenities.map((x) => text(x, "Amenity", 80)).slice(0, 20)
      : [],
  };
}
app.post("/api/rooms", auth, management, async (req, res) =>
  res.status(201).json(await Room.create(roomFields(req.body))),
);
app.put("/api/rooms/:id", auth, management, async (req, res) => {
  let result;
  await transaction(async (session) => {
    const room = await Room.findById(req.params.id).session(session);
    if (!room) fail("Room not found", 404);
    if (
      await Reservation.exists({
        "rooms.room": room._id,
        bookingStatus: { $in: ["confirmed", "pending", "checked-in"] },
      }).session(session)
    )
      fail("Edit rooms only after active bookings are completed", 409);
    Object.assign(room, roomFields(req.body));
    room.bookingVersion++;
    await room.save({ session });
    result = room;
  });
  res.json(result);
});
app.delete("/api/rooms/:id", auth, management, async (req, res) => {
  await transaction(async (session) => {
    const room = await Room.findById(req.params.id).session(session);
    if (!room) fail("Room not found", 404);
    if (
      await Reservation.exists({
        "rooms.room": room._id,
        bookingStatus: { $in: ["confirmed", "pending", "checked-in"] },
      }).session(session)
    )
      fail("Room has active bookings", 409);
    room.isActive = false;
    room.bookingVersion++;
    await room.save({ session });
  });
  res.json({ success: true });
});
app.get("/api/users", auth, management, async (req, res) =>
  res.json(await User.find().sort({ name: 1 })),
);
app.get("/api/team", auth, async (req, res) =>
  res.json(
    await User.find({ isActive: true })
      .select("name role isActive")
      .sort({ name: 1 }),
  ),
);
app.post("/api/users", auth, roles("admin"), async (req, res) =>
  res.status(201).json(
    safe(
      await User.create({
        name: text(req.body.name, "Name"),
        email: email(req.body.email),
        password: await bcrypt.hash(password(req.body.password), 12),
        phone: text(req.body.phone, "Phone", 30),
        role: req.body.role || "staff",
      }),
    ),
  ),
);
app.put("/api/users/:id", auth, roles("admin"), async (req, res) => {
  if (req.params.id === String(req.user._id))
    fail("Use your profile to edit your own account");
  const user = await User.findById(req.params.id);
  if (!user) fail("User not found", 404);
  user.name = text(req.body.name, "Name");
  user.role = req.body.role;
  user.isActive = req.body.isActive === true;
  if (req.body.password)
    user.password = await bcrypt.hash(password(req.body.password), 12);
  await user.save();
  await Session.deleteMany({ user: user._id });
  res.json(safe(user));
});
app.get("/api/guests", auth, async (req, res) =>
  res.json(await Guest.find().sort({ createdAt: -1 }).limit(1000)),
);
app.post("/api/bookings", limit, async (req, res) => {
  const { start, end, nights } = dates(req.body.checkIn, req.body.checkOut);
  if (req.body.checkIn < hotelDate()) fail("Arrival cannot be in the past");
  const adults = Number(req.body.adults);
  if (!Number.isInteger(adults) || adults < 1) fail("Invalid guest count");
  const paymentToken = randomBytes(32).toString("hex");
  let result;
  await transaction(async (session) => {
    const room = await Room.findOneAndUpdate(
      {
        _id: req.body.roomId,
        isActive: true,
        status: { $nin: ["Maintenance", "Cleaning"] },
      },
      { $inc: { bookingVersion: 1 } },
      { returnDocument: "after", session },
    );
    if (!room || adults > room.capacity)
      fail("Room unavailable or guest count exceeds capacity", 409);
    if (
      await Reservation.exists(overlap(room._id, start, end)).session(session)
    )
      fail("Room is already booked for these dates", 409);
    const [guest] = await Guest.create(
      [
        {
          firstName: text(req.body.firstName, "First name"),
          lastName: text(req.body.lastName, "Last name"),
          email: email(req.body.email),
          phone: text(req.body.phone, "Phone", 30),
        },
      ],
      { session },
    );
    const settings = await Settings.findById("hotel").session(session);
    const roomAmount = money(nights * room.pricePerNight),
      taxAmount = money((roomAmount * (settings?.taxPercent || 0)) / 100);
    const [booking] = await Reservation.create(
      [
        {
          bookingNumber: `HP-${randomBytes(6).toString("hex").toUpperCase()}`,
          guest: guest._id,
          bookingSource: "online",
          rooms: [{ room: room._id, ratePerNight: room.pricePerNight, adults }],
          checkInDate: start,
          checkOutDate: end,
          roomAmount,
          taxAmount,
          totalAmount: money(roomAmount + taxAmount),
          paymentAccessHash: paymentTokenHash(paymentToken),
          specialRequests: String(req.body.specialRequests || "").slice(
            0,
            1000,
          ),
        },
      ],
      { session },
    );
    result = {
      bookingNumber: booking.bookingNumber,
      totalAmount: booking.totalAmount,
      paymentToken,
      checkInDate: start,
      checkOutDate: end,
    };
  });
  res.status(201).json(result);
});
app.post(
  "/api/public/bookings/:bookingNumber/razorpay/order",
  limit,
  async (req, res) => {
    if (!razorpayReady()) fail("Online payments are not configured", 503);
    const booking = await Reservation.findOne({
      bookingNumber: req.params.bookingNumber,
    }).select("+paymentAccessHash");
    if (
      !booking ||
      !req.body.paymentToken ||
      !equal(booking.paymentAccessHash, paymentTokenHash(req.body.paymentToken))
    )
      fail("Payment link is invalid or expired", 404);
    if (["cancelled", "checked-out"].includes(booking.bookingStatus))
      fail("Booking is closed", 409);
    const amount = money(booking.totalAmount - booking.paidAmount);
    if (amount <= 0) fail("This booking is already paid", 409);
    let payment = await Payment.findOne({
      reservation: booking._id,
      gateway: "razorpay",
      status: "pending",
      amount,
    }).sort({ createdAt: -1 });
    if (!payment) {
      const order = await razorpayRequest("/orders", "POST", {
        amount: paise(amount),
        currency: "INR",
        receipt: `${booking.bookingNumber}-${randomBytes(3).toString("hex")}`,
        notes: { booking_number: booking.bookingNumber },
      });
      try {
        payment = await Payment.create({
          reservation: booking._id,
          amount,
          method: "online",
          gateway: "razorpay",
          razorpayOrderId: order.id,
          status: "pending",
        });
      } catch (error) {
        if (error.code !== 11000) throw error;
        payment = await Payment.findOne({ razorpayOrderId: order.id });
      }
    }
    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: payment.razorpayOrderId,
      amount: paise(payment.amount),
      currency: "INR",
      bookingNumber: booking.bookingNumber,
    });
  },
);
app.post(
  "/api/public/bookings/:bookingNumber/razorpay/verify",
  limit,
  async (req, res) => {
    const booking = await Reservation.findOne({
      bookingNumber: req.params.bookingNumber,
    }).select("+paymentAccessHash");
    if (
      !booking ||
      !req.body.paymentToken ||
      !equal(booking.paymentAccessHash, paymentTokenHash(req.body.paymentToken))
    )
      fail("Payment link is invalid or expired", 404);
    const order = await Payment.findOne({
      reservation: booking._id,
      gateway: "razorpay",
      razorpayOrderId: req.body.razorpay_order_id,
    });
    if (!order) fail("Payment order not found", 404);
    const signature = createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET || "",
    )
      .update(`${order.razorpayOrderId}|${req.body.razorpay_payment_id || ""}`)
      .digest("hex");
    if (
      !req.body.razorpay_signature ||
      !equal(signature, req.body.razorpay_signature)
    )
      fail("Payment signature could not be verified", 400);
    const providerPayment = await razorpayRequest(
      `/payments/${encodeURIComponent(req.body.razorpay_payment_id)}`,
      "GET",
    );
    if (providerPayment.status !== "captured")
      fail("Payment is not captured yet. Please wait for confirmation.", 409);
    const payment = await settleRazorpayPayment({
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: providerPayment.id,
      amount: providerPayment.amount,
      currency: providerPayment.currency,
    });
    res.json({
      success: true,
      paymentId: payment.razorpayPaymentId,
      paymentStatus: "paid",
    });
  },
);
app.get("/api/bookings", auth, async (req, res) =>
  res.json(
    await Reservation.find()
      .populate("guest rooms.room")
      .sort({ createdAt: -1 })
      .limit(1000),
  ),
);
app.get("/api/bookings/:id/payments", auth, async (req, res) =>
  res.json(
    await Payment.find({ reservation: req.params.id }).sort({ paidAt: -1 }),
  ),
);
app.post("/api/bookings/:id/:action", auth, async (req, res) => {
  const action = req.params.action;
  let result;
  await transaction(async (session) => {
    const booking = await Reservation.findById(req.params.id).session(session);
    if (!booking) fail("Booking not found", 404);
    const roomId = booking.rooms[0].room;
    const room = await Room.findOneAndUpdate(
      { _id: roomId },
      { $inc: { bookingVersion: 1 } },
      { session, returnDocument: "after" },
    );
    if (action === "check-in") {
      if (booking.bookingStatus !== "confirmed")
        fail("Only confirmed bookings can check in");
      if (
        hotelDate() < booking.checkInDate.toISOString().slice(0, 10) ||
        hotelDate() >= booking.checkOutDate.toISOString().slice(0, 10)
      )
        fail("Check-in is allowed only during the booked stay");
      if (room.status !== "Available")
        fail("Room must be available and cleaned", 409);
      if (req.body.idVerified !== true) fail("Verify guest ID before check-in");
      await Guest.findByIdAndUpdate(
        booking.guest,
        { idVerified: true },
        { session },
      );
      booking.bookingStatus = "checked-in";
      booking.checkedInAt = new Date();
      room.status = "Occupied";
    } else if (action === "check-out") {
      if (booking.bookingStatus !== "checked-in")
        fail("Guest is not checked in");
      if (booking.paidAmount < booking.totalAmount)
        fail("Collect outstanding balance before checkout");
      booking.bookingStatus = "checked-out";
      booking.checkedOutAt = new Date();
      room.status = "Cleaning";
      await Housekeeping.create(
        [{ room: roomId, taskType: "cleaning", createdBy: req.user._id }],
        { session },
      );
    } else if (action === "cancel") {
      if (!["pending", "confirmed"].includes(booking.bookingStatus))
        fail("Only upcoming bookings can be cancelled");
      if (booking.paidAmount > 0) fail("Refund payments before cancellation");
      booking.bookingStatus = "cancelled";
      booking.cancellationReason = text(
        req.body.reason,
        "Cancellation reason",
        500,
      );
    } else if (action === "charges") {
      if (!["confirmed", "checked-in"].includes(booking.bookingStatus))
        fail("Booking is closed");
      booking.extraCharges = money(req.body.amount);
      booking.chargeNotes = text(req.body.notes, "Charge description", 500);
      booking.totalAmount = money(
        booking.roomAmount + booking.taxAmount + booking.extraCharges,
      );
      if (booking.totalAmount < booking.paidAmount)
        fail("Refund excess payment first");
      booking.paymentStatus = paymentState(
        booking.totalAmount,
        booking.paidAmount,
      );
    } else if (action === "payment" || action === "refund") {
      if (["cancelled", "checked-out"].includes(booking.bookingStatus))
        fail("Booking is closed");
      const amount = money(req.body.amount);
      if (amount <= 0) fail("Amount must be positive");
      if (action === "refund" && !["admin", "manager"].includes(req.user.role))
        fail("Manager permission required", 403);
      if (
        action === "refund" &&
        (await Payment.exists({
          reservation: booking._id,
          gateway: "razorpay",
          status: "successful",
        }).session(session))
      )
        fail(
          "Razorpay payments must be refunded through Razorpay before recording the refund here",
          409,
        );
      if (
        action === "refund"
          ? amount > booking.paidAmount
          : amount > money(booking.totalAmount - booking.paidAmount)
      )
        fail("Amount exceeds available balance");
      await Payment.create(
        [
          {
            reservation: booking._id,
            amount,
            method: req.body.method,
            transactionId: String(req.body.transactionId || "").slice(0, 150),
            status: action === "refund" ? "refunded" : "successful",
            receivedBy: req.user._id,
          },
        ],
        { session },
      );
      booking.paidAmount = money(
        booking.paidAmount + (action === "refund" ? -amount : amount),
      );
      booking.paymentStatus = paymentState(
        booking.totalAmount,
        booking.paidAmount,
      );
    } else fail("Unknown action", 404);
    await room.save({ session });
    await booking.save({ session });
    result = booking;
  });
  res.json(result);
});
app.get("/api/housekeeping", auth, async (req, res) =>
  res.json(
    await Housekeeping.find()
      .populate("room assignedTo", "-password")
      .sort({ createdAt: -1 })
      .limit(500),
  ),
);
app.post("/api/housekeeping", auth, async (req, res) => {
  let result;
  await transaction(async (session) => {
    const room = await Room.findById(req.body.room).session(session);
    if (!room || !room.isActive) fail("Room not found", 404);
    if (room.status === "Occupied") fail("Cannot block an occupied room");
    if (
      req.body.assignedTo &&
      !(await User.exists({ _id: req.body.assignedTo, isActive: true }).session(
        session,
      ))
    )
      fail("Invalid assignee");
    room.status =
      req.body.taskType === "maintenance" ? "Maintenance" : "Cleaning";
    room.bookingVersion++;
    await room.save({ session });
    [result] = await Housekeeping.create(
      [
        {
          room: room._id,
          taskType: req.body.taskType,
          assignedTo: req.body.assignedTo || undefined,
          notes: String(req.body.notes || "").slice(0, 1000),
          createdBy: req.user._id,
        },
      ],
      { session },
    );
  });
  res.status(201).json(result);
});
app.put("/api/housekeeping/:id", auth, async (req, res) => {
  let result;
  await transaction(async (session) => {
    const task = await Housekeeping.findById(req.params.id).session(session);
    if (!task) fail("Task not found", 404);
    if (task.status === "completed") fail("Task already completed");
    if (!["in-progress", "completed"].includes(req.body.status))
      fail("Invalid task status");
    task.status = req.body.status;
    if (task.status === "completed") task.completedAt = new Date();
    await task.save({ session });
    const room = await Room.findById(task.room).session(session);
    room.bookingVersion++;
    if (
      task.status === "completed" &&
      !(await Housekeeping.exists({
        room: task.room,
        status: { $ne: "completed" },
      }).session(session)) &&
      room.status !== "Occupied"
    )
      room.status = "Available";
    await room.save({ session });
    result = task;
  });
  res.json(result);
});
app.get("/api/dashboard", auth, async (req, res) => {
  const [rooms, bookings, payments, tasks] = await Promise.all([
    Room.find({ isActive: true }),
    Reservation.find(),
    Payment.find(),
    Housekeeping.countDocuments({ status: { $ne: "completed" } }),
  ]);
  const today = hotelDate();
  res.json({
    totalRooms: rooms.length,
    available: rooms.filter((r) => r.status === "Available").length,
    occupied: rooms.filter((r) => r.status === "Occupied").length,
    arrivals: bookings.filter(
      (b) =>
        b.checkInDate.toISOString().slice(0, 10) === today &&
        b.bookingStatus === "confirmed",
    ).length,
    pendingTasks: tasks,
    revenue: money(
      Math.max(
        0,
        payments.reduce(
          (sum, p) =>
            sum +
            (p.status === "successful"
              ? p.amount
              : p.status === "refunded"
                ? -p.amount
                : 0),
          0,
        ),
      ),
    ),
    outstanding: money(
      bookings
        .filter((b) => b.bookingStatus !== "cancelled")
        .reduce((sum, b) => sum + b.totalAmount - b.paidAmount, 0),
    ),
  });
});
app.use("/api", (req, res) =>
  res.status(404).json({ message: "Endpoint not found" }),
);
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status =
    error.status ||
    (error.code === 11000
      ? 409
      : ["ValidationError", "CastError"].includes(error.name)
        ? 400
        : 500);
  if (status === 500) console.error(error.message);
  res.status(status).json({
    message:
      error.code === 11000
        ? "Record already exists"
        : status === 500
          ? "Server could not complete the request. Check database configuration."
          : error.message,
  });
});
export default app;
