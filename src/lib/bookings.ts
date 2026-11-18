import { supabase } from "@/integrations/supabase/client";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { bookingFormSchema, validateBookingForm } from "./booking-validation";
import {
  BISHKEK_TIME_ZONE,
  bishkekToday,
  bishkekTomorrow,
  isBookingChangeAllowed,
  isPubliclyBookableDate,
} from "./bishkek-time";
import { localText, type Language } from "./i18n";

export {
  BISHKEK_TIME_ZONE,
  bishkekToday,
  bishkekTomorrow,
  isBookingChangeAllowed,
  isPubliclyBookableDate,
} from "./bishkek-time";

export type Tour = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  region: string;
  difficulty: string;
  duration_days: number;
  price_per_person: number;
  max_group_size: number;
  highlights: string[];
  included: string[];
  not_included: string[];
  meeting_point: string;
  image_key: string;
  sort_order: number;
};

export type Departure = {
  id: string;
  tour_id: string;
  departure_date: string;
  total_spots: number;
  spots_taken: number;
  departure_time: string;
};

export type Booking = {
  id: string;
  reference: string;
  tour_id: string;
  departure_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_whatsapp: string | null;
  guests: number;
  total_price: number;
  notes: string | null;
  status: string;
  reminder_sent_at: string | null;
  reminder_status: "pending" | "sending" | "sent" | "failed";
  reminder_error: string | null;
  created_at: string;
};

export type BookingConfirmation = {
  reference: string;
  guests: number;
  total_price: number;
  tour_name: string;
  meeting_point: string;
  image_key: string;
  departure_date: string;
};

export type DashboardBooking = Booking & { tours: Tour; departures: Departure };

export const toursQuery = {
  queryKey: ["tours"],
  queryFn: async (): Promise<Tour[]> => {
    const { data, error } = await supabase
      .from("tours")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Tour[];
  },
};

export const tourQuery = (slug: string) => ({
  queryKey: ["tour", slug],
  queryFn: async (): Promise<Tour | null> => {
    const { data, error } = await supabase.from("tours").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return (data as Tour) ?? null;
  },
});

export const departuresQuery = (tourId: string | undefined) => ({
  queryKey: ["departures", tourId],
  enabled: Boolean(tourId),
  queryFn: async (): Promise<Departure[]> => {
    const firstBookableDate = bishkekTomorrow();
    const { data, error } = await supabase
      .from("departures")
      .select("*")
      .eq("tour_id", tourId!)
      .gte("departure_date", firstBookableDate)
      .order("departure_date", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Departure[];
  },
});

export const bookingQuery = (reference: string) => ({
  queryKey: ["booking", reference],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("get_booking_confirmation", {
      _reference: reference,
    });
    if (error) throw error;
    return (data?.[0] as BookingConfirmation | undefined) ?? null;
  },
});

/** The dashboard uses this only to decide whether to render its owner UI. */
export const adminMembershipQuery = (userId: string | undefined) => ({
  queryKey: ["admin-membership", userId],
  enabled: Boolean(userId),
  queryFn: async () => {
    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId!)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
});

const bookingInputSchema = bookingFormSchema.extend({
  departureId: z.string().uuid("Please pick a valid date."),
  website: z.string().max(0).optional(),
  language: z.enum(["en", "ru", "ky"]).optional(),
  // The token is intentionally verified inside the server handler; validating
  // only in the browser would let an automated client bypass Turnstile.
  turnstileToken: z.string().max(2048).optional(),
});

type TurnstileVerification = { success?: boolean };

async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    if (!response.ok) return false;
    const result = (await response.json()) as TurnstileVerification;
    return result.success === true;
  } catch {
    return false;
  }
}

async function databaseAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertBookingAdmin(context: { supabase: typeof supabase; userId: string }) {
  const { data: membership, error } = await context.supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", context.userId)
    .maybeSingle();
  if (error || !membership) throw new Error("Forbidden");
}

/** Creates a booking from server-fetched tour and departure data only. */
export const createBooking = createServerFn({ method: "POST" })
  .validator((data) => bookingInputSchema.parse(data))
  .handler(async ({ data }) => {
    const language: Language = data.language ?? "en";
    const message = (english: string, russian: string, kyrgyz: string) =>
      localText(language, english, russian, kyrgyz);

    // A field that real guests never see. Reject automated form fills without
    // exposing a useful signal to bots.
    if (data.website) {
      return {
        status: "invalid" as const,
        error: message(
          "We couldn't save that booking. Please try again.",
          "Не удалось сохранить бронирование. Попробуйте ещё раз.",
          "Брондоону сактоо мүмкүн болбоду. Кайра аракет кылыңыз.",
        ),
      };
    }

    const turnstileSecret = process.env["TURNSTILE_SECRET_KEY"];
    if (!turnstileSecret) {
      console.error("[Turnstile] Missing TURNSTILE_SECRET_KEY runtime secret.");
      return {
        status: "invalid" as const,
        error: message(
          "Booking verification is temporarily unavailable. Please try again later.",
          "Проверка бронирования временно недоступна. Попробуйте позже.",
          "Брондоону текшерүү убактылуу жеткиликсиз. Кийинчерээк кайра аракет кылыңыз.",
        ),
      };
    }

    const turnstileToken = data.turnstileToken?.trim();
    if (!turnstileToken || !(await verifyTurnstile(turnstileToken, turnstileSecret))) {
      return {
        status: "invalid" as const,
        error: message(
          "Please complete the security check and try again.",
          "Пройдите проверку безопасности и попробуйте ещё раз.",
          "Коопсуздук текшерүүсүнөн өтүп, кайра аракет кылыңыз.",
        ),
      };
    }

    const db = await databaseAdmin();
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count: recentBookings, error: rateLimitError } = await db
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("customer_email", data.email.trim())
      .gte("created_at", fifteenMinutesAgo);
    if (rateLimitError) throw rateLimitError;
    if ((recentBookings ?? 0) >= 3) {
      return {
        status: "invalid" as const,
        error: message(
          "Too many booking attempts. Please wait 15 minutes and try again.",
          "Слишком много попыток бронирования. Подождите 15 минут и попробуйте снова.",
          "Брондоо аракеттери өтө көп болду. 15 мүнөт күтүп, кайра аракет кылыңыз.",
        ),
      };
    }

    const { data: departureData, error: departureError } = await db
      .from("departures")
      .select("*")
      .eq("id", data.departureId)
      .maybeSingle();
    const departure = departureData as Departure | null;
    if (departureError || !departure) {
      return {
        status: "invalid" as const,
        error: message(
          "That date is unavailable.",
          "Эта дата недоступна.",
          "Бул дата жеткиликсиз.",
        ),
      };
    }

    const { data: tourData, error: tourError } = await db
      .from("tours")
      .select("*")
      .eq("id", departure.tour_id)
      .maybeSingle();
    const tour = tourData as Tour | null;
    if (tourError || !tour) {
      return {
        status: "invalid" as const,
        error: message("That tour is unavailable.", "Этот тур недоступен.", "Бул тур жеткиликсиз."),
      };
    }

    const errors = validateBookingForm({ ...data, maxGuests: spotsLeft(departure), language });
    if (!isPubliclyBookableDate(departure.departure_date)) {
      errors.departureId = message(
        "Bookings close on the day of departure. Please choose tomorrow or later.",
        "Бронирование закрывается в день выезда. Выберите дату на завтра или позже.",
        "Брондоо сапар болгон күнү жабылат. Эртеңки же андан кийинки күндү тандаңыз.",
      );
    }
    const firstError = Object.values(errors)[0];
    if (firstError) return { status: "invalid" as const, error: firstError };

    const { data: booking, error } = await db
      .from("bookings")
      .insert({
        tour_id: tour.id,
        departure_id: departure.id,
        customer_name: data.name.trim(),
        customer_email: data.email.trim(),
        customer_phone: data.phone.trim(),
        customer_whatsapp: data.whatsapp.trim() || null,
        guests: data.guests,
        total_price: data.guests * tour.price_per_person,
        notes: data.notes.trim() || null,
        status: "confirmed",
      })
      .select("reference")
      .single();
    if (error?.message.includes("NOT_ENOUGH_SPOTS")) {
      return { status: "full" as const };
    }
    if (error || !booking) throw error ?? new Error("Booking could not be created");
    return { status: "created" as const, reference: booking.reference };
  });

export const listDashboardBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertBookingAdmin(context);
    const db = await databaseAdmin();
    const { data, error } = await db
      .from("bookings")
      .select("*, tours(*), departures(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as DashboardBooking[];
  });

export const cancelBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ bookingId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertBookingAdmin(context);
    const db = await databaseAdmin();
    const { data: booking, error: bookingError } = await db
      .from("bookings")
      .select("id, status, departure_id")
      .eq("id", data.bookingId)
      .maybeSingle();
    if (bookingError || !booking) throw new Error("Booking not found");
    if (booking.status === "cancelled") return { status: "cancelled" as const };

    const { data: departure, error: departureError } = await db
      .from("departures")
      .select("departure_date, departure_time")
      .eq("id", booking.departure_id)
      .maybeSingle();
    if (departureError || !departure) throw new Error("Departure not found");
    if (!isBookingChangeAllowed(departure.departure_date, departure.departure_time)) {
      return { status: "closed" as const };
    }

    const { error } = await db
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", data.bookingId);
    if (error?.message.includes("BOOKING_CHANGE_CLOSED")) return { status: "closed" as const };
    if (error) throw error;
    return { status: "cancelled" as const };
  });

export const rescheduleBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) =>
    z.object({ bookingId: z.string().uuid(), departureId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertBookingAdmin(context);
    const db = await databaseAdmin();
    const { data: booking, error: bookingError } = await db
      .from("bookings")
      .select("tour_id, status, departure_id")
      .eq("id", data.bookingId)
      .maybeSingle();
    const { data: departure, error: departureError } = await db
      .from("departures")
      .select("tour_id, departure_date, departure_time")
      .eq("id", data.departureId)
      .maybeSingle();
    if (
      bookingError ||
      departureError ||
      !booking ||
      !departure ||
      booking.tour_id !== departure.tour_id
    ) {
      throw new Error("Invalid reschedule request");
    }
    if (booking.status === "cancelled") throw new Error("Cancelled bookings cannot be rescheduled");
    if (!isPubliclyBookableDate(departure.departure_date)) {
      throw new Error("The new date is no longer available for booking");
    }

    const { data: currentDeparture, error: currentDepartureError } = await db
      .from("departures")
      .select("departure_date, departure_time")
      .eq("id", booking.departure_id)
      .maybeSingle();
    if (currentDepartureError || !currentDeparture) throw new Error("Current departure not found");
    if (!isBookingChangeAllowed(currentDeparture.departure_date, currentDeparture.departure_time)) {
      return { status: "closed" as const };
    }

    const { error } = await db
      .from("bookings")
      .update({ departure_id: data.departureId })
      .eq("id", data.bookingId);
    if (error?.message.includes("BOOKING_CHANGE_CLOSED")) return { status: "closed" as const };
    if (error?.message.includes("NOT_ENOUGH_SPOTS")) {
      return { status: "full" as const };
    }
    if (error) throw error;
    return { status: "moved" as const };
  });

export function formatDate(value: string, language: "en" | "ru" | "ky" = "en") {
  // Midday UTC always maps to the same calendar day in Bishkek, avoiding the
  // host/browser time zone changing a date-only database value.
  const date = new Date(`${value}T12:00:00Z`);

  // Some browsers fall back to English when their ICU data does not include
  // Kyrgyz. Keep the date visibly Kyrgyz instead of rendering “Thu, Nov”.
  if (language === "ky") {
    const weekdays = ["жек.", "дүй.", "шейш.", "шарш.", "бейш.", "жума", "ишм."];
    const months = [
      "янв",
      "фев",
      "мар",
      "апр",
      "май",
      "июн",
      "июл",
      "авг",
      "сен",
      "окт",
      "ноя",
      "дек",
    ];
    return `${date.getUTCFullYear()}-ж. ${date.getUTCDate()}-${months[date.getUTCMonth()]}. ${weekdays[date.getUTCDay()]}`;
  }

  return date.toLocaleDateString(language === "ru" ? "ru-RU" : "en-GB", {
    timeZone: BISHKEK_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Keep bearer-token references readable without weakening their stored entropy. */
export function displayBookingReference(reference: string) {
  if (reference.length <= 14) return reference;
  return `${reference.slice(0, 8)}…${reference.slice(-4)}`;
}

export function formatBishkekDateTime(value: string, language: "en" | "ru" | "ky" = "en") {
  return new Date(value).toLocaleString(
    language === "ru" ? "ru-RU" : language === "ky" ? "ky-KG" : "en-GB",
    {
      timeZone: BISHKEK_TIME_ZONE,
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

export function spotsLeft(departure: Departure) {
  return Math.max(0, departure.total_spots - departure.spots_taken);
}

/** All future departures across every tour (used for availability on the Tours page). */
export const upcomingDeparturesQuery = {
  queryKey: ["departures", "upcoming"],
  queryFn: async (): Promise<Departure[]> => {
    const firstBookableDate = bishkekTomorrow();
    const { data, error } = await supabase
      .from("departures")
      .select("*")
      .gte("departure_date", firstBookableDate)
      .order("departure_date", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Departure[];
  },
};

export const FEW_SPOTS_THRESHOLD = 3;
export type AvailabilityState = "available" | "few" | "full";

export function availabilityOf(departure: Departure): AvailabilityState {
  const left = spotsLeft(departure);
  if (left <= 0) return "full";
  if (left <= FEW_SPOTS_THRESHOLD) return "few";
  return "available";
}

/** "Few spots left" shows the exact count; otherwise only the state is shown. */
export function availabilityLabel(
  departure: Departure,
  language: "en" | "ru" | "ky" = "en",
): string {
  const state = availabilityOf(departure);
  if (state === "full")
    return language === "ru" ? "Мест нет" : language === "ky" ? "Орун жок" : "Fully booked";
  if (state === "few") {
    const left = spotsLeft(departure);
    if (language === "ru")
      return `Осталось ${left} ${left === 1 ? "место" : left < 5 ? "места" : "мест"}`;
    if (language === "ky") return `${left} ${left === 1 ? "орун" : "орун"} калды`;
    return `Only ${left} ${left === 1 ? "spot" : "spots"} left`;
  }
  return language === "ru" ? "Есть места" : language === "ky" ? "Бош орун бар" : "Available";
}

/** "08:00:00" → "08:00" (Bishkek time). */
export function formatTime(value: string | null | undefined) {
  return value ? value.slice(0, 5) : "08:00";
}
