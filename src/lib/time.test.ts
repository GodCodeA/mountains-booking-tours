import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  bishkekToday,
  bishkekTomorrow,
  hasDepartureStarted,
  isBookingChangeAllowed,
  isEmergencyCancellationAvailable,
  isPubliclyBookableDate,
} from "./bishkek-time.ts";

test("uses the next calendar day after midnight in Bishkek", () => {
  // 00:30 on 3 November in Bishkek is still 18:30 UTC on 2 November.
  assert.equal(bishkekToday(new Date("2026-11-02T18:30:00Z")), "2026-11-03");
});

test("keeps the local Bishkek date before midnight", () => {
  assert.equal(bishkekToday(new Date("2026-11-02T17:30:00Z")), "2026-11-02");
});

test("allows public bookings from tomorrow, but never later today", () => {
  const now = new Date("2026-11-02T17:30:00Z"); // 23:30 on 2 November in Bishkek
  assert.equal(bishkekTomorrow(now), "2026-11-03");
  assert.equal(isPubliclyBookableDate("2026-11-02", now), false);
  assert.equal(isPubliclyBookableDate("2026-11-03", now), true);
});

test("calculates the next booking date across a month boundary", () => {
  const now = new Date("2026-01-31T16:30:00Z"); // 22:30 on 31 January in Bishkek
  assert.equal(bishkekTomorrow(now), "2026-02-01");
});

test("allows a booking change exactly 48 hours before a Bishkek departure", () => {
  const departureDate = "2026-11-06";
  const departureTime = "08:00:00";
  assert.equal(
    isBookingChangeAllowed(departureDate, departureTime, new Date("2026-11-04T02:00:00Z")),
    true,
  );
  assert.equal(
    isBookingChangeAllowed(departureDate, departureTime, new Date("2026-11-04T02:00:01Z")),
    false,
  );
});

test("offers emergency cancellation only inside the future 48-hour window", () => {
  const date = "2026-11-06";
  const time = "08:00:00";
  assert.equal(
    isEmergencyCancellationAvailable(date, time, new Date("2026-11-04T02:00:01Z")),
    true,
  );
  assert.equal(
    isEmergencyCancellationAvailable(date, time, new Date("2026-11-04T02:00:00Z")),
    false,
  );
  assert.equal(
    isEmergencyCancellationAvailable(date, time, new Date("2026-11-06T02:00:00Z")),
    false,
  );
  assert.equal(hasDepartureStarted(date, time, new Date("2026-11-06T02:00:00Z")), true);
});
