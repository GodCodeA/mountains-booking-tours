import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Backpack,
  CalendarDays,
  Check,
  Circle,
  CircleCheck,
  Clock,
  ExternalLink,
  MapPin,
  Mountain,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CANCELLATION_POLICY,
  CANCELLATION_POLICY_KY,
  CANCELLATION_POLICY_RU,
  tourExtras,
} from "@/lib/tour-content";
import { reviewTimestamp, siteContent, tourRating } from "@/lib/site-content";
import { TourRating } from "@/components/tour-rating";

import { Skeleton } from "@/components/ui/skeleton";
import {
  availabilityLabel,
  availabilityOf,
  departuresQuery,
  formatDate,
  formatTime,
  tourQuery,
  type AvailabilityState,
} from "@/lib/bookings";
import { tourGallery } from "@/lib/tour-images";
import { dayLabel, localText, maxGroupSizeLabel, useI18n } from "@/lib/i18n";
import { googleMapsEmbedUrl, googleMapsUrl, tourMapPoint } from "@/lib/tour-map";
import { localizeTour } from "@/lib/tour-localization";
import { readinessItems } from "@/lib/tour-readiness";

export const Route = createFileRoute("/tours/$slug")({
  head: ({ params }) => {
    const name = params.slug
      .split("-")
      .map((w) => w[0]!.toUpperCase() + w.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${name} — Ala-Too Adventures` },
        {
          name: "description",
          content: `Dates, price, inclusions and availability for the ${name} trip with Ala-Too Adventures in Kyrgyzstan.`,
        },
        { property: "og:title", content: `${name} — Ala-Too Adventures` },
        {
          property: "og:description",
          content: `Check open departure dates and book the ${name} trip online.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: TourDetail,
});

function TourDetail() {
  const { language } = useI18n();
  const text = (english: string, russian: string, kyrgyz: string) =>
    localText(language, english, russian, kyrgyz);
  const { slug } = Route.useParams();
  const { data: tour, isLoading, isError } = useQuery(tourQuery(slug));
  const { data: departures, isLoading: loadingDates } = useQuery(departuresQuery(tour?.id));

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-12 sm:px-6">
        <Skeleton className="h-[320px] w-full rounded-xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !tour) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-5xl">
          {text("Trip not found", "Тур не найден", "Тур табылган жок")}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {text(
            "That tour doesn't exist or is no longer offered.",
            "Этого тура нет или он больше не проводится.",
            "Бул тур жок же мындан ары сунушталбайт.",
          )}
        </p>
        <Link
          to="/tours"
          className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          {text("See all tours", "Все туры", "Бардык турларды көрүү")}
        </Link>
      </div>
    );
  }

  return <TourBody tour={tour} departures={departures} loadingDates={loadingDates} />;
}

const SECTIONS = [
  ["overview", "Overview"],
  ["itinerary", "Itinerary"],
  ["included", "Included"],
  ["bring", "What to bring"],
  ["readiness", "Readiness"],
  ["meeting", "Meeting point"],
  ["map", "Map"],
  ["availability", "Dates"],
  ["reviews", "Reviews"],
  ["faq", "FAQ"],
] as const;

const stateStyles: Record<AvailabilityState, string> = {
  available: "bg-success/15 text-success",
  few: "bg-accent/15 text-accent",
  full: "bg-muted text-muted-foreground",
};

function TourBody({
  tour,
  departures,
  loadingDates,
}: {
  tour: NonNullable<Awaited<ReturnType<ReturnType<typeof tourQuery>["queryFn"]>>>;
  departures: Awaited<ReturnType<ReturnType<typeof departuresQuery>["queryFn"]>> | undefined;
  loadingDates: boolean;
}) {
  const { language } = useI18n();
  const ru = language === "ru";
  const text = (english: string, russian: string, kyrgyz: string) =>
    localText(language, english, russian, kyrgyz);
  const content = siteContent(language);
  tour = localizeTour(tour, language);
  const extras = tourExtras(tour.slug, language);
  const rating = tourRating(tour.slug);
  const mapPoint = tourMapPoint(tour.slug, language);
  const photos = tourGallery(tour.image_key);
  const [active, setActive] = useState(0);
  const [checkedReadiness, setCheckedReadiness] = useState<string[]>([]);
  const list = departures ?? [];
  const openCount = list.filter((d) => availabilityOf(d) !== "full").length;
  const next = list.find((d) => availabilityOf(d) !== "full");
  const readiness = readinessItems(language, tour.difficulty, tour.duration_days);
  const completedReadiness = readiness.filter((item) => checkedReadiness.includes(item.id)).length;
  const isReady = completedReadiness === readiness.length;

  useEffect(() => {
    setCheckedReadiness([]);
  }, [tour.slug]);

  const facts: [React.ReactNode, string, string][] = [
    [
      <Clock key="c" className="h-4 w-4 text-primary" />,
      text("Duration", "Длительность", "Узактыгы"),
      `${tour.duration_days} ${dayLabel(tour.duration_days, language)}`,
    ],
    [
      <Mountain key="m" className="h-4 w-4 text-primary" />,
      text("Difficulty", "Сложность", "Татаалдык"),
      tour.difficulty,
    ],
    [
      <Users key="u" className="h-4 w-4 text-primary" />,
      text("Group size", "Размер группы", "Топтун көлөмү"),
      maxGroupSizeLabel(tour.max_group_size, language),
    ],
    [
      <MapPin key="p" className="h-4 w-4 text-primary" />,
      text("Meeting point", "Точка встречи", "Жолугушуу жери"),
      tour.meeting_point,
    ],
    [
      <CalendarDays key="d" className="h-4 w-4 text-primary" />,
      text("Next date", "Ближайшая дата", "Жакынкы дата"),
      loadingDates
        ? text("Loading…", "Загрузка…", "Жүктөлүүдө…")
        : next
          ? `${formatDate(next.departure_date, language)}, ${formatTime(next.departure_time)}`
          : text("No open dates", "Нет свободных дат", "Бош даталар жок"),
    ],
  ];

  return (
    <div>
      {/* Hero */}
      <div className="relative isolate min-h-[60vh]">
        <img
          src={photos[0]}
          alt={tour.name}
          width={1280}
          height={864}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 image-veil" />
        <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-24 sm:px-6 sm:pb-16">
          <p className="text-eyebrow">
            {tour.region} · {tour.difficulty}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[0.96] sm:text-8xl sm:leading-none">
            {tour.name}
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">{tour.summary}</p>
          <p className="mt-5 text-sm">
            {text("From", "От", "Баштап")}{" "}
            <span className="font-display text-3xl">${tour.price_per_person}</span>{" "}
            <span className="text-muted-foreground">
              {text("per person", "за человека", "адамга")}
            </span>
          </p>
        </div>
      </div>

      {/* Section nav */}
      <nav className="sticky top-16 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-4 py-3 text-sm font-semibold sm:px-6">
          {SECTIONS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="whitespace-nowrap text-muted-foreground hover:text-foreground"
            >
              {language === "en"
                ? label
                : language === "ru"
                  ? ({
                      overview: "Обзор",
                      itinerary: "Программа",
                      included: "Включено",
                      bring: "Что взять",
                      readiness: "Готовность",
                      meeting: "Встреча",
                      map: "Карта",
                      availability: "Даты",
                      reviews: "Отзывы",
                      faq: "Частые вопросы",
                    }[id] ?? label)
                  : ({
                      overview: "Сереп",
                      itinerary: "Программа",
                      included: "Камтылган",
                      bring: "Эмне алуу керек",
                      readiness: "Даярдык",
                      meeting: "Жолугушуу",
                      map: "Карта",
                      availability: "Даталар",
                      reviews: "Пикирлер",
                      faq: "Көп берилүүчү суроолор",
                    }[id] ?? label)}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-12">
          {/* Quick facts */}
          <dl className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-3">
            {facts.map(([icon, label, value]) => (
              <div key={label}>
                <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                  {icon} {label}
                </dt>
                <dd className="mt-1 text-sm font-semibold">{value}</dd>
              </div>
            ))}
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                {text("Price", "Цена", "Баа")}
              </dt>
              <dd className="mt-1 text-sm font-semibold">
                ${tour.price_per_person} / {text("person", "чел.", "адам")}
              </dd>
            </div>
          </dl>

          {/* Gallery */}
          <section aria-label={text("Photo gallery", "Галерея", "Сүрөттөр")}>
            <div className="overflow-hidden rounded-xl">
              <img
                src={photos[active]}
                alt={`${tour.name} — ${text("photo", "фото", "сүрөт")} ${active + 1}`}
                loading="lazy"
                width={1280}
                height={864}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
            {photos.length > 1 ? (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {photos.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={text(
                      `Show photo ${i + 1}`,
                      `Показать фото ${i + 1}`,
                      `${i + 1}-сүрөттү көрсөтүү`,
                    )}
                    className={
                      i === active
                        ? "overflow-hidden rounded-lg ring-2 ring-primary"
                        : "overflow-hidden rounded-lg opacity-70 transition-opacity hover:opacity-100"
                    }
                  >
                    <img
                      src={src}
                      alt=""
                      loading="lazy"
                      width={1280}
                      height={864}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section id="overview" className="scroll-mt-32">
            <h2 className="font-display text-4xl">{text("Overview", "Обзор", "Сереп")}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{tour.description}</p>
            <h3 className="mt-8 font-display text-3xl">
              {text("Highlights", "Главное", "Негизгиси")}
            </h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {tour.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {h}
                </li>
              ))}
            </ul>
          </section>

          {extras.itinerary.length > 0 ? (
            <section id="itinerary" className="scroll-mt-32">
              <h2 className="font-display text-4xl">
                {text("Itinerary", "Программа", "Программа")}
              </h2>
              <ol className="mt-4 space-y-4 border-l border-border pl-5">
                {extras.itinerary.map((step) => (
                  <li key={step.time + step.title}>
                    <p className="text-eyebrow">{step.time}</p>
                    <p className="font-semibold">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.body}</p>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <section id="included" className="grid scroll-mt-32 gap-8 sm:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl">{text("Included", "Включено", "Камтылган")}</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {tour.included.map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-3xl">
                {text("Not included", "Не включено", "Камтылган эмес")}
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {tour.not_included.map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="bring" className="scroll-mt-32">
            <h2 className="font-display text-3xl">
              {text("What to bring", "Что взять с собой", "Эмне алуу керек")}
            </h2>
            <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {extras.whatToBring.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <Backpack className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {i}
                </li>
              ))}
            </ul>
          </section>

          <section
            id="readiness"
            className="scroll-mt-32 rounded-xl border border-border bg-surface p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-eyebrow">
                  {text("Before you book", "Перед бронированием", "Брондоодон мурун")}
                </p>
                <h2 className="mt-1 font-display text-4xl">
                  {text(
                    "Ready for this route?",
                    "Готовы к этому маршруту?",
                    "Бул маршрутка даярсызбы?",
                  )}
                </h2>
              </div>
              <p className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-bold">
                {text(
                  `${completedReadiness} of ${readiness.length} checked`,
                  `Отмечено: ${completedReadiness} из ${readiness.length}`,
                  `${completedReadiness}/${readiness.length} белгиленди`,
                )}
              </p>
            </div>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              {text(
                "A quick personal check, not a medical assessment. The guide makes the final safety decision on the day.",
                "Короткая самопроверка, а не медицинская оценка. Окончательное решение по безопасности в день поездки принимает гид.",
                "Бул кыска өзүн-өзү текшерүү, медициналык баалоо эмес. Коопсуздук боюнча акыркы чечимди сапар күнү гид кабыл алат.",
              )}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {readiness.map((item) => {
                const checked = checkedReadiness.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() =>
                      setCheckedReadiness((current) =>
                        checked ? current.filter((id) => id !== item.id) : [...current, item.id],
                      )
                    }
                    className={
                      checked
                        ? "flex items-start gap-3 rounded-lg border border-success/50 bg-success/10 p-4 text-left"
                        : "flex items-start gap-3 rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-primary/60"
                    }
                  >
                    {checked ? (
                      <CircleCheck
                        className="mt-0.5 h-5 w-5 shrink-0 text-success"
                        aria-hidden="true"
                      />
                    ) : (
                      <Circle
                        className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    <span>
                      <span className="block text-sm font-bold">{item.label}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        {item.detail}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p
              aria-live="polite"
              className={
                isReady
                  ? "mt-5 rounded-lg bg-success/15 px-4 py-3 text-sm font-semibold text-success"
                  : "mt-5 rounded-lg bg-background px-4 py-3 text-sm text-muted-foreground"
              }
            >
              {isReady
                ? text(
                    "You look ready to choose a date.",
                    "Похоже, вы готовы выбрать дату.",
                    "Датаны тандоого даяр окшойсуз.",
                  )
                : text(
                    "Check the remaining items before choosing a date.",
                    "Проверьте оставшиеся пункты перед выбором даты.",
                    "Датаны тандоодон мурун калган пункттарды текшериңиз.",
                  )}
            </p>
          </section>

          <section id="meeting" className="grid scroll-mt-32 gap-8 sm:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl">
                {text("Meeting point", "Точка встречи", "Жолугушуу жери")}
              </h2>
              <p className="mt-3 flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {tour.meeting_point}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {text(
                  "Please arrive 15 minutes before the start time shown on your date.",
                  "Пожалуйста, приходите за 15 минут до времени старта, указанного для вашей даты.",
                  "Сиздин датаңызда көрсөтүлгөн башталыш убактысынан 15 мүнөт мурун келиңиз.",
                )}
              </p>
            </div>
            <div>
              <h2 className="font-display text-3xl">
                {text("Cancellation policy", "Условия отмены", "Жокко чыгаруу шарттары")}
              </h2>
              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {language === "ru"
                  ? CANCELLATION_POLICY_RU
                  : language === "ky"
                    ? CANCELLATION_POLICY_KY
                    : CANCELLATION_POLICY}
              </p>
            </div>
          </section>

          {mapPoint ? (
            <section id="map" className="scroll-mt-32">
              <h2 className="font-display text-4xl">
                {text("Map of the area", "Карта района", "Аймактын картасы")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {text(
                  "This marker shows the approximate destination area for the demo tour. It is not a route, a GPS track or a meeting point.",
                  "Метка показывает примерный район демо-тура. Это не маршрут, GPS-трек или точка встречи.",
                  "Белги демо-тур өтүүчү болжолдуу аймакты көрсөтөт. Бул маршрут, GPS-трек же жолугушуу жери эмес.",
                )}
              </p>
              <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
                <iframe
                  title={text(
                    `Map of ${mapPoint.label}`,
                    `Карта: ${mapPoint.label}`,
                    `${mapPoint.label} картасы`,
                  )}
                  src={googleMapsEmbedUrl(mapPoint)}
                  className="h-80 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <p className="text-sm font-semibold">{mapPoint.label}</p>
                  <a
                    href={googleMapsUrl(mapPoint)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary"
                  >
                    {text("Open in Google Maps", "Открыть в Google Maps", "Google Maps'тен ачуу")}
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </section>
          ) : null}

          <section id="availability" className="scroll-mt-32">
            <h2 className="font-display text-4xl">
              {text("Availability", "Доступность", "Жеткиликтүүлүк")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {text(
                "Demo availability — dates are sample data. Start times are Bishkek time.",
                "Демо-доступность: даты являются тестовыми данными. Время указано по Бишкеку.",
                "Демо-жеткиликтүүлүк: даталар тесттик маалыматтар. Убакыт Бишкек убактысы менен көрсөтүлгөн.",
              )}
            </p>
            <div className="mt-4 space-y-2">
              {loadingDates
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))
                : null}
              {!loadingDates && openCount === 0 ? (
                <p className="rounded-lg border border-border p-5 text-sm text-muted-foreground">
                  {text(
                    "No open dates right now. Please check back later.",
                    "Сейчас нет свободных дат. Загляните позже.",
                    "Азыр бош даталар жок. Кийинчерээк кайра кириңиз.",
                  )}
                </p>
              ) : null}
              {list.map((d) => {
                const state = availabilityOf(d);
                return (
                  <div
                    key={d.id}
                    className={
                      state === "full"
                        ? "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4 opacity-60"
                        : "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
                    }
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">{formatDate(d.departure_date, language)}</p>
                        <p className="text-xs text-muted-foreground">
                          {text("Starts", "Начало", "Башталышы")} {formatTime(d.departure_time)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${stateStyles[state]}`}
                      >
                        {availabilityLabel(d, language)}
                      </span>
                      {state === "full" ? (
                        <span className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground">
                          {text("Unavailable", "Недоступно", "Жеткиликсиз")}
                        </span>
                      ) : (
                        <Link
                          to="/book/$slug"
                          params={{ slug: tour.slug }}
                          search={{ departure: d.id }}
                          className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                        >
                          {text("Select date", "Выбрать дату", "Датаны тандоо")}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {rating ? (
            <section id="reviews" className="scroll-mt-32">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-eyebrow">
                    {text("Sample feedback", "Примерные отзывы", "Үлгү пикирлер")}
                  </p>
                  <h2 className="mt-1 font-display text-4xl">
                    {text("Guest reviews", "Отзывы гостей", "Коноктордун пикирлери")}
                  </h2>
                </div>
                <TourRating rating={rating.rating} count={rating.count} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {text(
                  "Sample reviews for this demo — not verified customers.",
                  "Примерные отзывы для демо-версии — это не подтверждённые клиенты.",
                  "Бул демо-версия үчүн үлгү пикирлер — алар ырасталган кардарлардын пикирлери эмес.",
                )}
              </p>
              <div className="mx-auto mt-6 max-w-3xl border border-border bg-card">
                {rating.reviews.map((review, index) => {
                  const publishedAt = reviewTimestamp(tour.slug, index);
                  return (
                    <article
                      key={`${review.name}-${review.from}`}
                      className="p-5 [&+article]:border-t"
                    >
                      <p className="text-sm leading-relaxed text-muted-foreground">{review.text}</p>
                      <p className="mt-4 text-sm font-bold">
                        {review.name}
                        <span className="font-normal text-muted-foreground"> · {review.from}</span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {text("Published", "Опубликовано", "Жарыяланды")} ·{" "}
                        {formatDate(publishedAt.date, language)} · {formatTime(publishedAt.time)}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section id="faq" className="scroll-mt-32">
            <h2 className="font-display text-4xl">
              {text("FAQ", "Частые вопросы", "Көп берилүүчү суроолор")}
            </h2>
            <Accordion type="single" collapsible className="mt-4">
              {content.faqs.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-32">
          <div className="surface-panel p-6">
            <p className="text-sm text-muted-foreground">{text("From", "От", "Баштап")}</p>
            <p className="font-display text-6xl">${tour.price_per_person}</p>
            <p className="text-sm text-muted-foreground">
              {text("per person", "за человека", "адамга")}
            </p>
            <p className="mt-4 text-sm">
              {loadingDates
                ? text("Checking dates…", "Проверяем даты…", "Даталар текшерилүүдө…")
                : openCount > 0
                  ? language === "ru"
                    ? `${openCount} ${openCount === 1 ? "свободная дата" : openCount < 5 ? "свободные даты" : "свободных дат"}${next ? ` · ближайшая ${formatDate(next.departure_date, language)}` : ""}`
                    : language === "ky"
                      ? `${openCount} бош күн${next ? ` · жакынкысы ${formatDate(next.departure_date, language)}` : ""}`
                      : `${openCount} open ${openCount === 1 ? "date" : "dates"}${next ? ` · next ${formatDate(next.departure_date, language)}` : ""}`
                  : text(
                      "No open dates right now",
                      "Сейчас нет свободных дат",
                      "Азыр бош даталар жок",
                    )}
            </p>
            <Link
              to="/book/$slug"
              params={{ slug: tour.slug }}
              search={{}}
              className="mt-5 block rounded-md bg-primary px-5 py-3 text-center text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)]"
            >
              {text(
                "Check availability & book",
                "Проверить даты и забронировать",
                "Даталарды көрүп, брондоо",
              )}
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {text(
                "No payment taken — you pay on the day.",
                "Онлайн-оплаты нет — вы платите в день поездки.",
                "Онлайн төлөм жок — сапар болгон күнү төлөйсүз.",
              )}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
