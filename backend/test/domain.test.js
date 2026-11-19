import test from "node:test";
import assert from "node:assert/strict";
import { dates, money, password, paymentState, hotelDate } from "../domain.js";
test("operational day follows the configured hotel timezone", () => {
  assert.equal(hotelDate(new Date("2027-01-01T20:00:00Z")), "2027-01-02");
});
test("stay dates are strict and checkout is exclusive", () => {
  assert.equal(dates("2027-02-28", "2027-03-02").nights, 2);
  for (const pair of [
    ["2027-02-30", "2027-03-02"],
    ["2027-01-01", "2027-01-01"],
    ["bad", "bad"],
  ])
    assert.throws(() => dates(...pair));
});
test("money and password validation reject unsafe values", () => {
  assert.equal(money(1.239), 1.24);
  for (const amount of [-1, Infinity, "bad"])
    assert.throws(() => money(amount));
  assert.throws(() => password("short"));
  assert.equal(paymentState(100, 50), "partial");
  assert.equal(paymentState(100, 100), "paid");
});
