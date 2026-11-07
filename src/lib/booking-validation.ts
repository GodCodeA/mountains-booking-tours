import { z } from "zod";

// Accepts international and local formats: +996 555 000 000, 0555 000 000, etc.
const phoneRegex = /^\+?[0-9][0-9\s\-().]{5,19}$/;

export const bookingFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name (at least 2 characters).")
    .max(100, "Name must be under 100 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address.")
    .max(255, "Email must be under 255 characters."),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required.")
    .regex(phoneRegex, "Please enter a valid phone number, e.g. +996 555 000 000."),
  whatsapp: z
    .string()
    .trim()
    .max(20, "WhatsApp number must be under 20 characters.")
    .refine((v) => v === "" || phoneRegex.test(v), {
      message: "Please enter a valid WhatsApp number, or leave it empty.",
    }),
  notes: z.string().trim().max(500, "Please keep your note under 500 characters."),
  guests: z.number().int("Guests must be a whole number.").min(1, "At least 1 guest is required."),
  departureId: z.string().min(1, "Please pick a date."),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export type BookingField = "name" | "email" | "phone" | "whatsapp" | "notes";

const russianErrors: Record<BookingField | "guests" | "departureId", string> = {
  name: "Укажите полное имя (минимум 2 символа).",
  email: "Укажите корректный email.",
  phone: "Укажите корректный номер телефона, например +996 555 000 000.",
  whatsapp: "Укажите корректный номер WhatsApp или оставьте поле пустым.",
  notes: "Примечание должно содержать не более 500 символов.",
  guests: "Укажите корректное количество гостей.",
  departureId: "Выберите дату.",
};

function localizedError(
  field: BookingField | "guests" | "departureId",
  message: string,
  language: "en" | "ru",
) {
  return language === "ru" ? russianErrors[field] : message;
}

/** Validate a single contact field; returns an error message or null. */
export function validateField(
  field: BookingField,
  value: string,
  language: "en" | "ru" = "en",
): string | null {
  const result = bookingFormSchema.shape[field].safeParse(value);
  return result.success
    ? null
    : localizedError(field, result.error.issues[0]?.message ?? "Invalid value.", language);
}

/** Validate the whole form, including capacity rules. Returns a map of field → message. */
export function validateBookingForm(values: {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  notes: string;
  guests: number;
  departureId: string | undefined;
  maxGuests: number;
  language?: "en" | "ru";
}): Partial<Record<BookingField | "guests" | "departureId", string>> {
  const errors: Partial<Record<BookingField | "guests" | "departureId", string>> = {};
  const parsed = bookingFormSchema.safeParse({
    name: values.name,
    email: values.email,
    phone: values.phone,
    whatsapp: values.whatsapp,
    notes: values.notes,
    guests: values.guests,
    departureId: values.departureId ?? "",
  });
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as BookingField | "guests" | "departureId";
      if (!errors[key]) errors[key] = localizedError(key, issue.message, values.language ?? "en");
    }
  }
  if (!errors.guests && values.guests > values.maxGuests) {
    errors.guests =
      values.language === "ru"
        ? `На эту дату осталось только ${values.maxGuests} ${values.maxGuests === 1 ? "место" : "места"}.`
        : `Only ${values.maxGuests} spot${values.maxGuests === 1 ? "" : "s"} left on this date.`;
  }
  return errors;
}
