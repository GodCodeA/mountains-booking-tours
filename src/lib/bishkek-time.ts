export const BISHKEK_TIME_ZONE = "Asia/Bishkek";

/** Current calendar date at the tour operator's location, as YYYY-MM-DD. */
export function bishkekToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BISHKEK_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value["year"]}-${value["month"]}-${value["day"]}`;
}

/**
 * First calendar date that public guests can book. We use the operator's
 * calendar date rather than a rolling 24-hour period: a departure tomorrow is
 * bookable, while a departure later today is not.
 */
export function bishkekTomorrow(now = new Date()): string {
  const [year, month, day] = bishkekToday(now).split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, day! + 1)).toISOString().slice(0, 10);
}

/** Public booking closes for the current Bishkek calendar day. */
export function isPubliclyBookableDate(date: string, now = new Date()): boolean {
  return date >= bishkekTomorrow(now);
}

const CHANGE_CUTOFF_HOURS = 48;

/**
 * Departure dates are stored separately from their Bishkek-local start times.
 * Kyrgyzstan has a fixed +06:00 offset, so this produces the exact instant
 * used for the guest cancellation and reschedule deadline.
 */
export function bishkekDepartureInstant(date: string, time: string): Date {
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${normalizedTime}+06:00`);
}

/** A guest may cancel or reschedule only at least 48 hours before departure. */
export function isBookingChangeAllowed(date: string, time: string, now = new Date()): boolean {
  return (
    bishkekDepartureInstant(date, time).getTime() - now.getTime() >=
    CHANGE_CUTOFF_HOURS * 60 * 60 * 1000
  );
}
