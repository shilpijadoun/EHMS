import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { createHmac } from "node:crypto";
import { createServer } from "node:http";
import app from "../app.js";
import User from "../models/User.js";
import Room from "../models/Room.js";
import Reservation from "../models/Reservation.js";
import Guest from "../models/Guest.js";
import Housekeeping from "../models/Housekeeping.js";
import Payment from "../models/Payment.js";
import { hotelDate } from "../domain.js";
let db, server, base, cookie, room;
async function request(path, method = "GET", body, session = cookie) {
  const response = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Cookie: session } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return {
    status: response.status,
    data: await response.json(),
    cookie: response.headers.get("set-cookie")?.split(";")[0],
  };
}
before(async () => {
  db = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
    binary: { version: "7.0.14" },
  });
  await mongoose.connect(db.getUri());
  await Promise.all(
    Object.values(mongoose.models).map((model) => model.init()),
  );
  await User.create({
    name: "Test admin",
    email: "admin@example.com",
    password: await bcrypt.hash("TestPassword123!", 4),
    role: "admin",
  });
  room = await Room.create({
    roomNumber: "101",
    roomType: "Standard",
    floor: 1,
    capacity: 2,
    pricePerNight: 1000,
  });
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
  const login = await request(
    "/auth/login",
    "POST",
    { email: "admin@example.com", password: "TestPassword123!" },
    null,
  );
  assert.equal(login.status, 200);
  cookie = login.cookie;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  if (db) await db.stop();
});
test("access control, booking concurrency, payment and housekeeping lifecycle", async () => {
  assert.equal((await request("/users", "GET", null, null)).status, 401);
  assert.equal(
    (await request("/users", "POST", { role: "admin" }, null)).status,
    401,
  );
  const start = new Date();
  start.setUTCDate(start.getUTCDate() + 1);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 2);
  const body = {
    roomId: String(room._id),
    checkIn: start.toISOString().slice(0, 10),
    checkOut: end.toISOString().slice(0, 10),
    adults: 2,
    firstName: "Test",
    lastName: "Guest",
    email: "guest@example.com",
    phone: "1234567890",
  };
  const responses = await Promise.all([
    request("/bookings", "POST", body, null),
    request("/bookings", "POST", body, null),
  ]);
  assert.deepEqual(responses.map((r) => r.status).sort(), [201, 409]);
  assert.equal(await Reservation.countDocuments(), 1);
  assert.equal(await Guest.countDocuments(), 1);
  const booking = await Reservation.findOne();
  const path = `/bookings/${booking._id}`;
  assert.equal(
    (await request(path + "/check-in", "POST", { idVerified: true })).status,
    400,
  );
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  await Reservation.updateOne(
    { _id: booking._id },
    { $set: { checkInDate: yesterday } },
  );
  assert.equal(
    (await request(path + "/check-in", "POST", { idVerified: false })).status,
    400,
  );
  assert.equal(
    (await request(path + "/check-in", "POST", { idVerified: true })).status,
    200,
  );
  assert.equal((await Room.findById(room._id)).status, "Occupied");
  assert.equal((await request(path + "/check-out", "POST", {})).status, 400);
  assert.equal(
    (await request(path + "/payment", "POST", { amount: 2001, method: "cash" }))
      .status,
    400,
  );
  assert.equal(
    (await request(path + "/payment", "POST", { amount: 2000, method: "cash" }))
      .status,
    200,
  );
  assert.equal(
    (await request(path + "/payment", "POST", { amount: 1, method: "cash" }))
      .status,
    400,
  );
  assert.equal(await Payment.countDocuments(), 1);
  assert.equal((await request(path + "/check-out", "POST", {})).status, 200);
  assert.equal((await Room.findById(room._id)).status, "Cleaning");
  const task = await Housekeeping.findOne();
  assert.ok(task);
  assert.equal(
    (await request(`/housekeeping/${task._id}`, "PUT", { status: "completed" }))
      .status,
    200,
  );
  assert.equal((await Room.findById(room._id)).status, "Available");
  const staff = await request("/users", "POST", {
    name: "Staff",
    email: "staff@example.com",
    password: "StaffPassword123!",
    phone: "12345",
    role: "staff",
  });
  assert.equal(staff.status, 201);
  const staffLogin = await request(
    "/auth/login",
    "POST",
    { email: "staff@example.com", password: "StaffPassword123!" },
    null,
  );
  assert.equal(
    (await request("/users", "POST", { name: "Hack" }, staffLogin.cookie))
      .status,
    403,
  );
  assert.equal(
    (await request("/settings", "PUT", {}, staffLogin.cookie)).status,
    403,
  );
  assert.equal(
    (
      await request("/auth/password", "PUT", {
        current: "TestPassword123!",
        password: "NewPassword123!",
      })
    ).status,
    200,
  );
  assert.equal((await request("/auth/me")).status, 401);
});

test("room administration, tax snapshots, adjacent stays, refunds and account deactivation", async () => {
  const login = await request(
    "/auth/login",
    "POST",
    { email: "admin@example.com", password: "NewPassword123!" },
    null,
  );
  assert.equal(login.status, 200);
  cookie = login.cookie;
  const roomBody = {
    roomNumber: "202",
    roomType: "Deluxe",
    floor: 2,
    capacity: 2,
    pricePerNight: 1000,
    description: "Test room",
  };
  assert.equal(
    (await request("/rooms", "POST", { ...roomBody, capacity: 1.5 })).status,
    400,
  );
  const created = await request("/rooms", "POST", roomBody);
  assert.equal(created.status, 201);
  assert.equal((await request("/rooms", "POST", roomBody)).status, 409);
  assert.equal(
    (
      await request("/settings", "PUT", {
        name: "Test hotel",
        email: "hotel@example.com",
        phone: "12345678",
        address: "Test address",
        taxPercent: 10,
      })
    ).status,
    200,
  );
  const day = (offset) => hotelDate(new Date(Date.now() + offset * 86400000));
  const body = {
    roomId: created.data._id,
    checkIn: day(5),
    checkOut: day(7),
    adults: 2,
    firstName: "Test",
    lastName: "Refund",
    email: "refund@example.com",
    phone: "12345678",
  };
  assert.equal(
    (await request("/bookings", "POST", { ...body, adults: 3 }, null)).status,
    409,
  );
  const booking = await request("/bookings", "POST", body, null);
  assert.equal(booking.status, 201);
  assert.equal(booking.data.totalAmount, 2200);
  const adjacent = await request(
    "/bookings",
    "POST",
    { ...body, checkIn: day(7), checkOut: day(9) },
    null,
  );
  assert.equal(adjacent.status, 201);
  const availability = await request(
    `/rooms?checkIn=${day(5)}&checkOut=${day(7)}`,
  );
  assert.ok(!availability.data.some((r) => r._id === created.data._id));
  assert.equal(
    (await request(`/rooms/${created.data._id}`, "PUT", roomBody)).status,
    409,
  );
  const record = await Reservation.findOne({
      bookingNumber: booking.data.bookingNumber,
    }),
    path = `/bookings/${record._id}`;
  assert.equal(
    (await request(path + "/payment", "POST", { amount: 500, method: "cash" }))
      .status,
    200,
  );
  assert.equal(
    (await request(path + "/cancel", "POST", { reason: "Guest request" }))
      .status,
    400,
  );
  const staffLogin = await request(
    "/auth/login",
    "POST",
    { email: "staff@example.com", password: "StaffPassword123!" },
    null,
  );
  assert.equal(
    (await request("/team", "GET", null, staffLogin.cookie)).status,
    200,
  );
  assert.equal(
    (
      await request(
        path + "/refund",
        "POST",
        { amount: 500, method: "cash" },
        staffLogin.cookie,
      )
    ).status,
    403,
  );
  assert.equal(
    (await request(path + "/refund", "POST", { amount: 500, method: "cash" }))
      .status,
    200,
  );
  assert.equal(
    (await request(path + "/cancel", "POST", { reason: "Guest request" }))
      .status,
    200,
  );
  const history = await request(path + "/payments");
  assert.equal(history.data.length, 2);
  assert.equal(
    (await request(`/rooms/${created.data._id}`, "DELETE")).status,
    409,
  );
  const nextRecord = await Reservation.findOne({
    bookingNumber: adjacent.data.bookingNumber,
  });
  assert.equal(
    (
      await request(`/bookings/${nextRecord._id}/cancel`, "POST", {
        reason: "Guest request",
      })
    ).status,
    200,
  );
  assert.equal(
    (await request(`/rooms/${created.data._id}`, "DELETE")).status,
    200,
  );
  assert.equal((await request(`/rooms/${created.data._id}`)).status, 404);
  const staff = await User.findOne({ email: "staff@example.com" });
  assert.equal(
    (
      await request(`/users/${staff._id}`, "PUT", {
        name: "Staff",
        role: "staff",
        isActive: false,
      })
    ).status,
    200,
  );
  assert.equal(
    (await request("/auth/me", "GET", null, staffLogin.cookie)).status,
    401,
  );
  const csrf = await fetch(base + "/auth/logout", {
    method: "POST",
    headers: { Origin: "https://untrusted.example", Cookie: cookie },
  });
  assert.equal(csrf.status, 403);
});

test("Razorpay order, signature verification and webhook settlement are idempotent", async () => {
  const orders = new Map();
  let nextOrder = 1;
  const provider = createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      res.setHeader("Content-Type", "application/json");
      if (req.method === "POST" && req.url === "/v1/orders") {
        const body = JSON.parse(raw);
        const id = `order_test_${nextOrder++}`;
        orders.set(id, body);
        return res.end(JSON.stringify({ id, ...body }));
      }
      if (req.method === "GET" && req.url === "/v1/payments/pay_test_1") {
        const [orderId, order] = orders.entries().next().value;
        return res.end(
          JSON.stringify({
            id: "pay_test_1",
            order_id: orderId,
            amount: order.amount,
            currency: "INR",
            status: "captured",
          }),
        );
      }
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "not found" }));
    });
  });
  await new Promise((resolve) => provider.listen(0, "127.0.0.1", resolve));
  const providerBase = `http://127.0.0.1:${provider.address().port}/v1`;
  const prior = {
    key: process.env.RAZORPAY_KEY_ID,
    secret: process.env.RAZORPAY_KEY_SECRET,
    webhook: process.env.RAZORPAY_WEBHOOK_SECRET,
    base: process.env.RAZORPAY_API_BASE_URL,
  };
  process.env.RAZORPAY_KEY_ID = "rzp_test_fake";
  process.env.RAZORPAY_KEY_SECRET = "fake_secret";
  process.env.RAZORPAY_WEBHOOK_SECRET = "webhook_secret";
  process.env.RAZORPAY_API_BASE_URL = providerBase;
  try {
    const bookingBody = {
      roomId: String(room._id),
      checkIn: hotelDate(new Date(Date.now() + 30 * 86400000)),
      checkOut: hotelDate(new Date(Date.now() + 32 * 86400000)),
      adults: 1,
      firstName: "Razor",
      lastName: "Pay",
      email: "razor@example.com",
      phone: "1234567890",
    };
    const created = await request("/bookings", "POST", bookingBody, null);
    assert.equal(created.status, 201);
    const order = await request(
      `/public/bookings/${created.data.bookingNumber}/razorpay/order`,
      "POST",
      { paymentToken: created.data.paymentToken },
      null,
    );
    assert.equal(order.status, 200);
    assert.equal(order.data.amount, created.data.totalAmount * 100);
    const signature = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.data.orderId}|pay_test_1`)
      .digest("hex");
    const verify = await request(
      `/public/bookings/${created.data.bookingNumber}/razorpay/verify`,
      "POST",
      {
        paymentToken: created.data.paymentToken,
        razorpay_order_id: order.data.orderId,
        razorpay_payment_id: "pay_test_1",
        razorpay_signature: signature,
      },
      null,
    );
    assert.equal(verify.status, 200);
    const booking = await Reservation.findOne({
      bookingNumber: created.data.bookingNumber,
    });
    assert.equal(booking.paymentStatus, "paid");
    assert.equal(booking.paidAmount, booking.totalAmount);
    const raw = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_test_1",
            order_id: order.data.orderId,
            amount: order.data.amount,
            currency: "INR",
          },
        },
      },
    });
    const webhookSignature = createHmac(
      "sha256",
      process.env.RAZORPAY_WEBHOOK_SECRET,
    )
      .update(raw)
      .digest("hex");
    const webhook = () =>
      fetch(base + "/webhooks/razorpay", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-razorpay-signature": webhookSignature,
          "x-razorpay-event-id": "event_test_1",
        },
        body: raw,
      });
    assert.equal((await webhook()).status, 200);
    const duplicate = await webhook();
    assert.equal(duplicate.status, 200);
    assert.equal((await duplicate.json()).duplicate, true);
    assert.equal(
      await Payment.countDocuments({
        razorpayOrderId: order.data.orderId,
        status: "successful",
      }),
      1,
    );
  } finally {
    await new Promise((resolve) => provider.close(resolve));
    process.env.RAZORPAY_KEY_ID = prior.key;
    process.env.RAZORPAY_KEY_SECRET = prior.secret;
    process.env.RAZORPAY_WEBHOOK_SECRET = prior.webhook;
    process.env.RAZORPAY_API_BASE_URL = prior.base;
  }
});
