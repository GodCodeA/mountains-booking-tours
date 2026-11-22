import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  availabilityLabel,
  availabilityOf,
  formatDate,
  formatTime,
  spotsLeft,
  toursQuery,
  upcomingDeparturesQuery,
} from "@/lib/bookings";
import { localText, useI18n } from "@/lib/i18n";
import { localizeTour } from "@/lib/tour-localization";
import { tourImage } from "@/lib/tour-images";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Departure calendar — Ala-Too Adventures" },
      {
        name: "description",
        content: "Browse upcoming Kyrgyz mountain tour dates, available places and departure times.",
      },
    ],
  }),
  component: DepartureCalendar,
});

function dateFromIso(value: string) {
  // React Day Picker works with local calendar dates. Keep the database date
  // as a local date too, otherwise UTC formatting can move it to the prior
  // month in Bishkek (for example, 1 November → 31 October UTC).
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
}

function isoFromDate(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
    value.getDate(),
  ).padStart(2, "0")}`;
}

const KYRGYZ_MONTHS = [
  "январь",
  "февраль",
  "март",
  "апрель",
  "май",
  "июнь",
  "июль",
  "август",
  "сентябрь",
  "октябрь",
  "ноябрь",
  "декабрь",
];
const KYRGYZ_WEEKDAYS = ["жк.", "дш.", "шш.", "шр.", "бш.", "жм.", "иш."];

function DepartureCalendar() {
  const { language } = useI18n();
  const text = (english: string, russian: string, kyrgyz: string) =>
    localText(language, english, russian, kyrgyz);
  const toursQ = useQuery(toursQuery);
  const departuresQ = useQuery(upcomingDeparturesQuery);
  const [selectedDate, setSelectedDate] = useState<Date>();

  const departures = departuresQ.data ?? [];
  const toursById = useMemo(() => new Map((toursQ.data ?? []).map((tour) => [tour.id, tour])), [toursQ.data]);
  const dateKeys = useMemo(() => [...new Set(departures.map((departure) => departure.departure_date))], [departures]);

  useEffect(() => {
    if (!selectedDate && dateKeys[0]) setSelectedDate(dateFromIso(dateKeys[0]));
  }, [dateKeys, selectedDate]);

  const selectedKey = selectedDate ? isoFromDate(selectedDate) : undefined;
  const selectedDepartures = departures.filter((departure) => departure.departure_date === selectedKey);
  const selectedLabel = selectedKey ? formatDate(selectedKey, language) : "";
  const availableDates = dateKeys.map(dateFromIso);
  const calendarFormatters = {
    formatCaption: (month: Date) => {
      if (language === "ky") return `${KYRGYZ_MONTHS[month.getMonth()]} ${month.getFullYear()} ж.`;
      return month.toLocaleDateString(language === "ru" ? "ru-RU" : "en-GB", {
        month: "long",
        year: "numeric",
      });
    },
    formatWeekdayName: (day: Date) => {
      if (language === "ky") return KYRGYZ_WEEKDAYS[day.getDay()]!;
      return day.toLocaleDateString(language === "ru" ? "ru-RU" : "en-GB", {
        weekday: "short",
      });
    },
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-eyebrow">{text("Plan by date", "Планируйте по датам", "Дата боюнча пландаңыз")}</p>
      <h1 className="mt-3 font-display text-6xl sm:text-7xl">
        {text("Departure calendar", "Календарь выездов", "Чыгуу жылнаамасы")}
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        {text(
          "Choose a highlighted date to see the tours running that day and the remaining places.",
          "Выберите выделенную дату, чтобы увидеть туры на этот день и оставшиеся места.",
          "Белгиленген күндү тандап, ошол күнкү турларды жана калган орундарды көрүңүз.",
        )}
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <section className="surface-panel overflow-hidden p-2 sm:p-4" aria-label={text("Calendar", "Календарь", "Жылнаама")}>
          {departuresQ.isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : selectedDate ? (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              defaultMonth={selectedDate}
              modifiers={{ departure: availableDates }}
              modifiersClassNames={{
                departure:
                  "[&>button]:font-bold [&>button]:text-primary [&>button]:ring-1 [&>button]:ring-primary/40 hover:[&>button]:bg-primary/15",
              }}
              disabled={(date) => !dateKeys.includes(isoFromDate(date))}
              formatters={calendarFormatters}
              className="mx-auto w-full [&_.rdp-month]:gap-5 [&_.rdp-weekday]:text-center"
            />
          ) : (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{ departure: availableDates }}
              modifiersClassNames={{
                departure:
                  "[&>button]:font-bold [&>button]:text-primary [&>button]:ring-1 [&>button]:ring-primary/40 hover:[&>button]:bg-primary/15",
              }}
              disabled={(date) => !dateKeys.includes(isoFromDate(date))}
              formatters={calendarFormatters}
              className="mx-auto w-full [&_.rdp-month]:gap-5 [&_.rdp-weekday]:text-center"
            />
          )}
          <p className="px-3 pb-3 text-xs text-muted-foreground">
            {text(
              "Highlighted dates have departures. Bookings close on the day of departure.",
              "На выделенные даты есть выезды. Бронирование закрывается в день выезда.",
              "Белгиленген күндөрдө чыгуу бар. Брондоо сапар күнү жабылат.",
            )}
          </p>
        </section>

        <section aria-live="polite">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary" />
            <div>
              <p className="text-eyebrow">{text("Selected date", "Выбранная дата", "Тандалган күн")}</p>
              <h2 className="mt-1 font-display text-4xl">{selectedLabel || text("Choose a date", "Выберите дату", "Күндү тандаңыз")}</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {departuresQ.isLoading || toursQ.isLoading
              ? Array.from({ length: 2 }).map((_, index) => <Skeleton key={index} className="h-44 w-full" />)
              : selectedDepartures.map((departure) => {
                  const tour = toursById.get(departure.tour_id);
                  if (!tour) return null;
                  const localized = localizeTour(tour, language);
                  const state = availabilityOf(departure);
                  const left = spotsLeft(departure);
                  const isFull = state === "full";

                  return (
                    <article key={departure.id} className="surface-panel overflow-hidden sm:flex">
                      <img
                        src={tourImage(tour.image_key)}
                        alt=""
                        className="h-40 w-full object-cover sm:h-auto sm:w-40"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="flex min-w-0 flex-1 flex-col p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-display text-3xl leading-none">{localized.name}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">{localized.region}</p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              isFull
                                ? "bg-secondary text-muted-foreground"
                                : state === "few"
                                  ? "bg-primary/15 text-primary"
                                  : "bg-emerald-500/15 text-emerald-500"
                            }`}
                          >
                            {availabilityLabel(departure, language)}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-primary" />
                            {text("Starts", "Начало", "Башталышы")} {formatTime(departure.departure_time)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-primary" />
                            {isFull
                              ? text("Fully booked", "Мест нет", "Орун жок")
                              : text(`${left} places left`, `Осталось мест: ${left}`, `${left} орун калды`)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-primary" />
                            {localized.region}
                          </span>
                        </div>
                        <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
                          <span className="font-display text-3xl">${tour.price_per_person}</span>
                          {isFull ? (
                            <Link
                              to="/tours/$slug"
                              params={{ slug: tour.slug }}
                              className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
                            >
                              {text("View trip", "Смотреть тур", "Турду көрүү")}
                            </Link>
                          ) : (
                            <Link
                              to="/book/$slug"
                              params={{ slug: tour.slug }}
                              search={{ departure: departure.id }}
                              className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
                            >
                              {text("Book this date", "Выбрать дату", "Бул күндү тандоо")}
                            </Link>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
            {!departuresQ.isLoading && selectedDate && selectedDepartures.length === 0 ? (
              <div className="surface-panel p-8 text-center text-muted-foreground">
                {text("There are no departures on this date.", "На эту дату выездов нет.", "Бул күнү чыгуу жок.")}
              </div>
            ) : null}
            {!departuresQ.isLoading && departures.length === 0 ? (
              <div className="surface-panel p-8 text-center text-muted-foreground">
                {text(
                  "No upcoming departures have been added yet.",
                  "Ближайшие выезды пока не добавлены.",
                  "Жакынкы чыгуулар азырынча кошула элек.",
                )}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
