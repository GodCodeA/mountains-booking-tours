import { strict as assert } from "node:assert";
import { test } from "node:test";

import { validateBookingForm, validateField } from "./booking-validation";

const validValues = {
  name: "Aida Osmonova",
  email: "aida@example.com",
  phone: "+996 555 123 456",
  whatsapp: "",
  notes: "Vegetarian meals, please.",
  guests: 2,
  departureId: "915818f8-8c56-49dd-b0c9-2d0133a986c9",
  maxGuests: 4,
};

test("accepts a complete valid booking form", () => {
  assert.deepEqual(validateBookingForm(validValues), {});
});

test("rejects invalid customer contact fields", () => {
  assert.match(validateField("email", "not-an-email") ?? "", /valid email/i);
  assert.match(validateField("phone", "abc") ?? "", /valid phone/i);
  assert.match(validateField("name", "A") ?? "", /at least 2/i);
});

test("does not allow a party to exceed remaining capacity", () => {
  const errors = validateBookingForm({ ...validValues, guests: 3, maxGuests: 2 });
  assert.equal(errors.guests, "Only 2 spots left on this date.");
});

test("requires a selected departure", () => {
  const errors = validateBookingForm({ ...validValues, departureId: undefined });
  assert.match(errors.departureId ?? "", /pick a date/i);
});
