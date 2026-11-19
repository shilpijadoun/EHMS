export function hotelDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.HOTEL_TIMEZONE || "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  throw error;
}
export function dates(checkIn, checkOut) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(checkIn || "") ||
    !/^\d{4}-\d{2}-\d{2}$/.test(checkOut || "")
  )
    fail("Choose valid arrival and departure dates");
  const start = new Date(checkIn),
    end = new Date(checkOut);
  if (
    !Number.isFinite(+start) ||
    !Number.isFinite(+end) ||
    start.toISOString().slice(0, 10) !== checkIn ||
    end.toISOString().slice(0, 10) !== checkOut ||
    end <= start
  )
    fail("Departure must be after arrival");
  const nights = (end - start) / 86400000;
  if (nights > 365) fail("Maximum stay is 365 nights");
  return { start, end, nights };
}
export function money(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0 || amount > 10000000)
    fail("Invalid amount");
  return Math.round(amount * 100) / 100;
}
export function paymentState(total, paid) {
  return paid === 0 ? "unpaid" : paid >= total ? "paid" : "partial";
}
export function text(value, label, max = 200) {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    fail(`${label} is required (maximum ${max} characters)`);
  return value.trim();
}
export function email(value) {
  const result = text(value, "Email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) fail("Invalid email");
  return result;
}
export function password(value) {
  if (
    typeof value !== "string" ||
    value.length < 10 ||
    Buffer.byteLength(value) > 72
  )
    fail("Password must be 10–72 bytes");
  return value;
}
