import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { formatDate, spotsLeft, type Departure, type Tour } from "@/lib/bookings";
import { tourImage } from "@/lib/tour-images";
import { localizeTour } from "@/lib/tour-localization";
import { dayLabel, maxGroupSizeLabel, useI18n } from "@/lib/i18n";

export function TourCard({
  tour,
  nextDeparture,
  showAvailability = false,
  deferImage = false,
}: {
  tour: Tour;
  nextDeparture?: Departure | null;
  showAvailability?: boolean;
  deferImage?: boolean;
}) {
  const { language, t } = useI18n();
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageReady, setImageReady] = useState(!deferImage);

  useEffect(() => {
    if (!deferImage) {
      setImageReady(true);
      return;
    }

    const image = imageRef.current;
    if (!image) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setImageReady(true);
        observer.disconnect();
      },
      { rootMargin: "0px 320px" },
    );
    observer.observe(image);
    return () => observer.disconnect();
  }, [deferImage]);

  tour = localizeTour(tour, language);
  const left = nextDeparture ? spotsLeft(nextDeparture) : 0;
  return (
    <Link
      to="/tours/$slug"
      params={{ slug: tour.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card motion-safe:transition-[transform,border-color,box-shadow] motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-1.5 hover:border-primary/70 hover:shadow-[var(--shadow-ridge)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          ref={imageRef}
          src={imageReady ? tourImage(tour.image_key) : undefined}
          alt={tour.name}
          loading="lazy"
          decoding="async"
          width={1280}
          height={864}
          className={`h-full w-full object-cover motion-safe:transition-[transform,opacity] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035] ${imageReady ? "opacity-100" : "opacity-0"}`}
        />
        <div className="absolute inset-0 image-veil" />
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent">
          {tour.difficulty}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-2xl">{tour.name}</h3>
        <p className="flex-1 text-sm text-muted-foreground">{tour.summary}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> {tour.region}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {tour.duration_days} {dayLabel(tour.duration_days, language)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> {maxGroupSizeLabel(tour.max_group_size, language)}
          </span>
        </div>
        {showAvailability ? (
          <div className="flex items-center gap-1.5 text-xs">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            {nextDeparture ? (
              <span className="text-foreground">
                {t("next")}:{" "}
                <span className="font-semibold">
                  {formatDate(nextDeparture.departure_date, language)}
                </span>
                {left <= 3 ? (
                  <span className="ml-2 font-semibold text-accent">
                    {left} {left === 1 ? t("spot") : t("spots")} {t("left")}
                  </span>
                ) : null}
              </span>
            ) : (
              <span className="text-muted-foreground">{t("noOpenDates")}</span>
            )}
          </div>
        ) : null}
        <div className="flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">
            {t("from")}{" "}
            <span className="text-lg font-bold text-foreground">${tour.price_per_person}</span> /{" "}
            {t("perPerson")}
          </span>
          <span className="text-sm font-bold text-primary motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover:translate-x-1">
            {t("viewTrip")} →
          </span>
        </div>
      </div>
    </Link>
  );
}
