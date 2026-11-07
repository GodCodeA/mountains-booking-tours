import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, CheckCircle2, Copy, CalendarDays, MapPin, Users } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { bookingQuery, displayBookingReference, formatDate } from "@/lib/bookings";
import { tourImage } from "@/lib/tour-images";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/booking/$reference")({
  head: () => ({
    meta: [
      { title: "Booking confirmed — Ala-Too Adventures" },
      {
        name: "description",
        content: "Your Ala-Too Adventures trip is confirmed. Keep your booking reference handy.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Booking confirmed — Ala-Too Adventures" },
      { property: "og:description", content: "Your Kyrgyz mountain trip is booked." },
    ],
  }),
  component: Confirmation,
});

function Confirmation() {
  const { reference } = Route.useParams();
  const { data: booking, isLoading, isError } = useQuery(bookingQuery(reference));
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  async function copyConfirmationLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be disabled by the browser; the URL remains available in its address bar.
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-16 sm:px-6">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-5xl">Booking not found</h1>
        <p className="mt-3 text-muted-foreground">
          We couldn&apos;t find that booking. Please check your confirmation link.
        </p>
        <Link
          to="/tours"
          className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          Browse tours
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-9 w-9 text-success" />
        <div>
          <p className="text-eyebrow">You&apos;re booked</p>
          <h1 className="font-display text-5xl">See you in the mountains</h1>
        </div>
      </div>

      <p className="mt-4 text-muted-foreground">
        {t("bookingConfirmed")} {t("saveLink")}
      </p>

      <div className="surface-panel mt-8 overflow-hidden">
        <img
          src={tourImage(booking.image_key)}
          alt={booking.tour_name}
          loading="lazy"
          width={1280}
          height={864}
          className="h-44 w-full object-cover"
        />
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl">{booking.tour_name}</h2>
            <span className="rounded-md bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
              {t("reference")} {displayBookingReference(booking.reference)}
            </span>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              {formatDate(booking.departure_date)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> {booking.guests}{" "}
              {booking.guests === 1 ? t("guest") : t("guests")}
            </span>
            <span className="inline-flex items-center gap-2 sm:col-span-2">
              <MapPin className="h-4 w-4 text-primary" /> {booking.meeting_point}
            </span>
          </div>
          <div className="flex items-baseline justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">{t("totalPayable")}</span>
            <span className="font-display text-4xl">${booking.total_price}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copyConfirmationLink}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? t("linkCopied") : t("copyLink")}
        </button>
        <Link
          to="/tours"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold"
        >
          {t("browseTrips")}
        </Link>
      </div>
    </div>
  );
}
