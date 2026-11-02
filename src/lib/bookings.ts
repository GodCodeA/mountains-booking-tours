import { supabase } from "@/integrations/supabase/client";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { bookingFormSchema, validateBookingForm } from "./booking-validation";
import { BISHKEK_TIME_ZONE, bishkekToday } from "./bishkek-time";

export { BISHKEK_TIME_ZONE, bishkekToday } from "./bishkek-time";

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
    const today = bishkekToday();
    const { data, error } = await supabase
      .from("departures")
      .select("*")
      .eq("tour_id", tourId!)
      .gte("departure_date", today)
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
});

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
  .inputValidator((data) => bookingInputSchema.parse(data))
  .handler(async ({ data }) => {
    // A field that real guests never see. Reject automated form fills without
    // exposing a useful signal to bots.
    if (data.website) {
      return { status: "invalid" as const, error: "We couldn't save that booking. Please try again." };
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
        error: "Too many booking attempts. Please wait 15 minutes and try again.",
      };
    }

    const { data: departureData, error: departureError } = await db
      .from("departures")
      .select("*")
      .eq("id", data.departureId)
      .maybeSingle();
    const departure = departureData as Departure | null;
    if (departureError || !departure) {
      return { status: "invalid" as const, error: "That date is unavailable." };
    }

    const { data: tourData, error: tourError } = await db
      .from("tours")
      .select("*")
      .eq("id", departure.tour_id)
      .maybeSingle();
    const tour = tourData as Tour | null;
    if (tourError || !tour) {
      return { status: "invalid" as const, error: "That tour is unavailable." };
    }

    const errors = validateBookingForm({ ...data, maxGuests: spotsLeft(departure) });
    if (departure.departure_date < bishkekToday()) {
      errors.departureId = "This date has already passed.";
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
  .inputValidator((data) => z.object({ bookingId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertBookingAdmin(context);
    const db = await databaseAdmin();
    const { error } = await db
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", data.bookingId);
    if (error) throw error;
  });

export const rescheduleBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ bookingId: z.string().uuid(), departureId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertBookingAdmin(context);
    const db = await databaseAdmin();
    const { data: booking, error: bookingError } = await db
      .from("bookings")
      .select("tour_id")
      .eq("id", data.bookingId)
      .maybeSingle();
    const { data: departure, error: departureError } = await db
      .from("departures")
      .select("tour_id")
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
    const { error } = await db
      .from("bookings")
      .update({ departure_id: data.departureId })
      .eq("id", data.bookingId);
    if (error?.message.includes("NOT_ENOUGH_SPOTS")) {
      return { status: "full" as const };
    }
    if (error) throw error;
    return { status: "moved" as const };
  });

export function formatDate(value: string) {
  // Midday UTC always maps to the same calendar day in Bishkek, avoiding the
  // host/browser time zone changing a date-only database value.
  return new Date(`${value}T12:00:00Z`).toLocaleDateString("en-GB", {
    timeZone: BISHKEK_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatBishkekDateTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    timeZone: BISHKEK_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function spotsLeft(departure: Departure) {
  return Math.max(0, departure.total_spots - departure.spots_taken);
}

/** All future departures across every tour (used for availability on the Tours page). */
export const upcomingDeparturesQuery = {
  queryKey: ["departures", "upcoming"],
  queryFn: async (): Promise<Departure[]> => {
    const today = bishkekToday();
    const { data, error } = await supabase
      .from("departures")
      .select("*")
      .gte("departure_date", today)
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
export function availabilityLabel(departure: Departure): string {
  const state = availabilityOf(departure);
  if (state === "full") return "Fully booked";
  if (state === "few") {
    const left = spotsLeft(departure);
    return `Only ${left} ${left === 1 ? "spot" : "spots"} left`;
  }
  return "Available";
}

/** "08:00:00" → "08:00" (Bishkek time). */
export function formatTime(value: string | null | undefined) {
  return value ? value.slice(0, 5) : "08:00";
}
