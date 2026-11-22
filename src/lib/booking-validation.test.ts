import { strict as assert } from "node:assert";
import { test } from "node:test";

import { validateBookingForm, validateField } from "./booking-validation.ts";

const validValues = {
  name: "Aida Osmonova",
  email: "aida@example.com",
  phone: "+996555123456",
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

test("enforces the selected country's phone number rules", () => {
  assert.match(
    validateField("phone", "+99655512") ?? "",
    /valid phone number for the selected country/i,
  );
  assert.match(
    validateField("phone", "+996555123456789") ?? "",
    /valid phone number for the selected country/i,
  );
  assert.equal(validateField("phone", "+996555123456"), null);
});

test("does not allow a party to exceed remaining capacity", () => {
  const errors = validateBookingForm({ ...validValues, guests: 3, maxGuests: 2 });
  assert.equal(errors.guests, "Only 2 spots left on this date.");
});

test("requires a selected departure", () => {
  const errors = validateBookingForm({ ...validValues, departureId: undefined });
  assert.match(errors.departureId ?? "", /pick a date/i);
});
