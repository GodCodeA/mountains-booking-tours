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
  return `${value.year}-${value.month}-${value.day}`;
}
