import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  CalendarCheck,
  CalendarRange,
  Compass,
  Leaf,
  Map,
  Mountain,
  MousePointerClick,
  RotateCcw,
  SlidersHorizontal,
  Snowflake,
  SunMedium,
  Users,
} from "lucide-react";

import heroImage from "@/assets/hero-mountains.webp";
import { FeaturedTourCarousel } from "@/components/featured-tour-carousel";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TourCard } from "@/components/tour-card";
import { Skeleton } from "@/components/ui/skeleton";
import { toursQuery, type Tour } from "@/lib/bookings";
import { siteContent } from "@/lib/site-content";
import { localizeTour } from "@/lib/tour-localization";
import { tourImage } from "@/lib/tour-images";
import { dayLabel, localText, useI18n } from "@/lib/i18n";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ala-Too Adventures — Mountain tours from Bishkek" },
      {
        name: "description",
        content:
          "Book small-group hikes, yurt stays and multi-day treks in the Kyrgyz mountains. Check real dates, pick your group size and get confirmed in minutes.",
      },
      { property: "og:title", content: "Ala-Too Adventures — Mountain tours from Bishkek" },
      {
        property: "og:description",
        content:
          "Check dates and book Kyrgyz mountain trips in minutes, without the back-and-forth.",
      },
    ],
  }),
  component: Home,
});

const benefits = [
  {
    icon: Users,
    title: "Small groups",
    body: "A handful of guests per trip, so the pace suits the group and everyone gets time with the guide.",
  },
  {
    icon: Map,
    title: "Clear itineraries",
    body: "Every tour lists the route, timings, what's included and what to bring before you book.",
  },
  {
    icon: CalendarCheck,
    title: "Real availability online",
    body: "See the open dates and exactly how many spots are left — no waiting for a reply.",
  },
  {
    icon: MousePointerClick,
    title: "Easy booking",
    body: "Book in a couple of minutes and pay on the day. No deposit, no card details.",
  },
  {
    icon: Compass,
    title: "Local mountain knowledge",
    body: "Routes planned from Bishkek by people who know these valleys, seasons and families.",
  },
];

const russianBenefits = [
  {
    icon: Users,
    title: "Небольшие группы",
    body: "В каждой поездке немного гостей: темп подходит группе, а у каждого есть время с гидом.",
  },
  {
    icon: Map,
    title: "Понятная программа",
    body: "До бронирования в каждом туре указаны маршрут, время, что включено и что взять с собой.",
  },
  {
    icon: CalendarCheck,
    title: "Актуальные места онлайн",
    body: "Сразу видно свободные даты и точное количество мест — не нужно ждать ответа.",
  },
  {
    icon: MousePointerClick,
    title: "Простое бронирование",
    body: "Забронируйте за несколько минут и оплатите в день поездки. Без предоплаты и данных карты.",
  },
  {
    icon: Compass,
    title: "Знание местных гор",
    body: "Маршруты планируют жители Бишкека, которые знают эти долины, сезоны и семьи.",
  },
];

const kyrgyzBenefits = [
  {
    icon: Users,
    title: "Чакан топтор",
    body: "Ар бир сапарда конок аз болот: темп топко ылайык, ар ким гид менен убакыт өткөрөт.",
  },
  {
    icon: Map,
    title: "Так программа",
    body: "Брондоодон мурун ар бир турда маршрут, убакыт, камтылган кызматтар жана керектүү жабдык көрсөтүлөт.",
  },
  {
    icon: CalendarCheck,
    title: "Онлайн жеткиликтүүлүк",
    body: "Бош даталарды жана калган орундардын так санын дароо көрөсүз — жооп күтүүнүн кереги жок.",
  },
  {
    icon: MousePointerClick,
    title: "Оңой брондоо",
    body: "Бир нече мүнөттө брондоп, сапар болгон күнү төлөйсүз. Алдын ала төлөм да, карта маалыматы да жок.",
  },
  {
    icon: Compass,
    title: "Жергиликтүү тоолор тууралуу терең билим",
    body: "Маршруттарды бул өрөөндөрдү, мезгилдерди жана үй-бүлөлөрдү билген Бишкектин тургундары пландайт.",
  },
];

const howItWorks = [
  { n: "01", title: "Choose a tour", body: "Compare difficulty, duration and price." },
  { n: "02", title: "Pick a date and guests", body: "Only dates with open spots can be selected." },
  {
    n: "03",
    title: "Confirm your booking",
    body: "Add your contact details and get your reference instantly.",
  },
];

const russianHowItWorks = [
  { n: "01", title: "Выберите тур", body: "Сравните сложность, продолжительность и цену." },
  { n: "02", title: "Выберите дату и гостей", body: "Доступны только даты со свободными местами." },
  {
    n: "03",
    title: "Подтвердите бронирование",
    body: "Оставьте контакты и сразу получите код бронирования.",
  },
];

const kyrgyzHowItWorks = [
  { n: "01", title: "Турду тандаңыз", body: "Татаалдыгын, узактыгын жана баасын салыштырыңыз." },
  {
    n: "02",
    title: "Датаны жана конокторду тандаңыз",
    body: "Бош орундары бар даталар гана жеткиликтүү.",
  },
  {
    n: "03",
    title: "Брондоону ырастаңыз",
    body: "Байланыш маалыматыңызды жазыңыз жана дароо брондоо кодун алыңыз.",
  },
];

function pickRecommended(tours: Tour[]) {
  const byDuration = [...tours].sort((a, b) => a.duration_days - b.duration_days);
  const picks: { label: string; tour: Tour | undefined }[] = [
    { label: "Short on time", tour: byDuration[0] },
    {
      label: "A weekend away",
      tour: byDuration.find((t) => t.duration_days >= 2 && t.duration_days <= 3),
    },
    { label: "The big adventure", tour: byDuration[byDuration.length - 1] },
  ];
  return picks.filter((p): p is { label: string; tour: Tour } => Boolean(p.tour));
}

const finderDurations = ["any", "1", "2-3", "4+"] as const;
const finderDifficulties = ["any", "Easy", "Moderate", "Challenging"] as const;
const finderBudgets = ["any", "under-200", "200-350", "350-plus"] as const;

type FinderDuration = (typeof finderDurations)[number];
type FinderDifficulty = (typeof finderDifficulties)[number];
type FinderBudget = (typeof finderBudgets)[number];

const seasons = ["spring", "summer", "autumn", "winter"] as const;
type Season = (typeof seasons)[number];

const seasonTourSlugs: Record<Season, string[]> = {
  spring: ["ala-archa-day-hike", "kegety-waterfall-hike", "chon-kemin-valley-escape"],
  summer: [
    "song-kul-adventure",
    "kel-suu-adventure",
    "altyn-arashan-escape",
    "jyrgalan-mountain-trek",
    "suusamyr-jailoo-weekend",
    "karakol-lakes-trek",
  ],
  autumn: ["issyk-kul-mountain-escape", "ala-archa-day-hike", "chon-kemin-valley-escape"],
  winter: [],
};

function matchesFinderDuration(days: number, duration: FinderDuration) {
  if (duration === "1") return days === 1;
  if (duration === "2-3") return days >= 2 && days <= 3;
  if (duration === "4+") return days >= 4;
  return true;
}

function matchesFinderBudget(price: number, budget: FinderBudget) {
  if (budget === "under-200") return price < 200;
  if (budget === "200-350") return price >= 200 && price <= 350;
  if (budget === "350-plus") return price > 350;
  return true;
}

function FinderChoice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground"
          : "rounded-full border border-border bg-background/60 px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
      }
    >
      {children}
    </button>
  );
}

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-eyebrow">{eyebrow}</p>
      <h2 className="mt-2 font-display text-4xl sm:text-5xl">{title}</h2>
      {children ? <p className="mt-3 text-muted-foreground">{children}</p> : null}
    </div>
  );
}

function Home() {
  const { language } = useI18n();
  const ru = language === "ru";
  const ky = language === "ky";
  const text = (english: string, russian: string, kyrgyz: string) =>
    localText(language, english, russian, kyrgyz);
  const content = siteContent(language);
  const localizedBenefits = ru ? russianBenefits : ky ? kyrgyzBenefits : benefits;
  const localizedSteps = ru ? russianHowItWorks : ky ? kyrgyzHowItWorks : howItWorks;
  const { data: tours, isLoading, isError } = useQuery(toursQuery);
  const recommended = tours ? pickRecommended(tours) : [];
  const [finderDuration, setFinderDuration] = useState<FinderDuration>("any");
  const [finderDifficulty, setFinderDifficulty] = useState<FinderDifficulty>("any");
  const [finderBudget, setFinderBudget] = useState<FinderBudget>("any");
  const [activeSeason, setActiveSeason] = useState<Season>("summer");
  const finderResults = useMemo(
    () =>
      (tours ?? [])
        .filter(
          (tour) =>
            matchesFinderDuration(tour.duration_days, finderDuration) &&
            (finderDifficulty === "any" || tour.difficulty === finderDifficulty) &&
            matchesFinderBudget(tour.price_per_person, finderBudget),
        )
        .sort((a, b) => a.sort_order - b.sort_order)
        .slice(0, 3),
    [tours, finderBudget, finderDifficulty, finderDuration],
  );
  const finderHasSelection =
    finderDuration !== "any" || finderDifficulty !== "any" || finderBudget !== "any";
  const resetFinder = () => {
    setFinderDuration("any");
    setFinderDifficulty("any");
    setFinderBudget("any");
  };
  const seasonTours = (tours ?? [])
    .filter((tour) => seasonTourSlugs[activeSeason].includes(tour.slug))
    .sort(
      (a, b) =>
        seasonTourSlugs[activeSeason].indexOf(a.slug) -
        seasonTourSlugs[activeSeason].indexOf(b.slug),
    )
    .slice(0, 3);
  const seasonInfo: Record<
    Season,
    { icon: typeof Leaf; months: string; title: string; body: string; empty: string }
  > = {
    spring: {
      icon: Leaf,
      months: text("Mar–May", "март–май", "март–май"),
      title: text(
        "Green gorges and first waterfalls",
        "Зелёные ущелья и первые водопады",
        "Жашыл капчыгайлар жана алгачкы шаркыратмалар",
      ),
      body: text(
        "A good season for lower-elevation walks close to Bishkek, with fresh streams and changing mountain weather.",
        "Лучшее время для прогулок в невысоких ущельях рядом с Бишкеком: свежие ручьи и быстро меняющаяся горная погода.",
        "Бишкекке жакын, бийиктиги төмөн капчыгайларда сейилдөө үчүн жакшы мезгил: тунук суулар жана тез өзгөргөн тоо аба ырайы.",
      ),
      empty: text(
        "New spring departures will appear here when they are added.",
        "Новые весенние даты появятся здесь после добавления.",
        "Жаңы жазгы даталар кошулганда бул жерде чыгат.",
      ),
    },
    summer: {
      icon: SunMedium,
      months: text("Jun–Aug", "июнь–август", "июнь–август"),
      title: text(
        "High lakes, jailoo and long mountain days",
        "Высокогорные озёра, джайлоо и длинные дни",
        "Бийик тоолуу көлдөр, жайлоо жана узун күндөр",
      ),
      body: text(
        "The main season for high-altitude routes, yurt stays and multi-day treks. Book early for the smallest groups.",
        "Главный сезон для высокогорных маршрутов, юрт и многодневных треков. Для маленьких групп лучше бронировать заранее.",
        "Бийик тоолуу маршруттар, боз үй жана көп күндүк тректер үчүн негизги мезгил. Чакан топтор үчүн алдын ала брондогон жакшы.",
      ),
      empty: text(
        "New summer departures will appear here when they are added.",
        "Новые летние даты появятся здесь после добавления.",
        "Жаңы жайкы даталар кошулганда бул жерде чыгат.",
      ),
    },
    autumn: {
      icon: CalendarRange,
      months: text("Sep–Nov", "сентябрь–ноябрь", "сентябрь–ноябрь"),
      title: text(
        "Clear air and quieter trails",
        "Чистый воздух и тихие тропы",
        "Таза аба жана тынч чыйырлар",
      ),
      body: text(
        "A calmer window for lake escapes and day hikes, with crisp mornings and earlier sunsets.",
        "Более спокойный сезон для поездок к озеру и однодневных походов: прохладное утро и ранние закаты.",
        "Көл жакка сапарлар жана бир күндүк жөө жүрүштөр үчүн тынчыраак мезгил: салкын эртең менен жана эрте баткан күн.",
      ),
      empty: text(
        "New autumn departures will appear here when they are added.",
        "Новые осенние даты появятся здесь после добавления.",
        "Жаңы күзгү даталар кошулганда бул жерде чыгат.",
      ),
    },
    winter: {
      icon: Snowflake,
      months: text("Dec–Feb", "декабрь–февраль", "декабрь–февраль"),
      title: text("Planning season", "Сезон планирования", "Пландоо мезгили"),
      body: text(
        "This demo does not list winter departures. Use the quieter months to plan a spring or summer mountain trip.",
        "В этой демо-версии нет зимних выездов. Используйте спокойные месяцы, чтобы запланировать весеннюю или летнюю поездку.",
        "Бул демо-нускада кышкы чыгуу даталары жок. Тынч айларды жазгы же жайкы сапарды пландоого колдонуңуз.",
      ),
      empty: text(
        "There are no winter demo tours at the moment.",
        "Сейчас зимних демо-туров нет.",
        "Азыр кышкы демо-турлар жок.",
      ),
    },
  };
  const activeSeasonInfo = seasonInfo[activeSeason];

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Snow-capped Tian Shan peaks above a valley at sunrise"
          width={1920}
          height={1088}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 image-veil" />
        <div className="mx-auto flex max-w-6xl flex-col justify-end px-4 pb-12 pt-24 sm:px-6 sm:pb-24 sm:pt-44">
          <p className="text-eyebrow">
            {text(
              "Guided mountain tours from Bishkek",
              "Горные туры с гидом из Бишкека",
              "Бишкектен гид менен тоо турлары",
            )}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-[2.5rem] leading-[0.96] sm:text-8xl sm:leading-none">
            {language === "en" ? (
              <>
                A new <span className="text-primary">trail</span> begins here
              </>
            ) : language === "ru" ? (
              <>
                Новая <span className="text-primary">тропа</span> начинается здесь
              </>
            ) : (
              <>
                Жаңы <span className="text-primary">жол</span> ушул жерден башталат
              </>
            )}
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            {text(
              "Small-group day hikes, yurt nights and multi-day treks across Kyrgyzstan. See real dates, book in minutes and pay on the day.",
              "Походы одного дня, ночёвки в юртах и многодневные треки по Кыргызстану. Выберите дату, забронируйте за несколько минут и оплатите в день поездки.",
              "Кыргызстан боюнча бир күндүк жөө жүрүштөр, боз үйдө түнөө жана бир нече күндүк тоо саякаттары. Өзүңүзгө ыңгайлуу күндү тандап, бир нече мүнөттүн ичинде орун ээлеп коюңуз. Төлөмдү саякат күнү жүргүзсөңүз болот.",
            )}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/tours"
              className="rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] motion-safe:transition-[transform,box-shadow,opacity] motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_22px_48px_-18px_oklch(0.775_0.148_68_/_0.55)] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] hover:opacity-90"
            >
              {text("Explore tours", "Выбрать тур", "Тур тандоо")}
            </Link>
            <a
              href="#featured"
              className="rounded-md border border-border bg-background/60 px-6 py-3 text-sm font-bold backdrop-blur motion-safe:transition-[transform,background-color,border-color] motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] hover:bg-secondary"
            >
              {text("Check availability", "Проверить даты", "Даталарды көрүү")}
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="trip-finder-title" className="border-b border-border bg-surface">
        <ScrollReveal className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
            <SectionHeading
              eyebrow={text("Trip finder", "Подбор тура", "Тур тандоо")}
              title={text(
                "Find a trip that fits",
                "Найдите подходящий тур",
                "Өзүңүзгө ылайыктуу турду табыңыз",
              )}
            >
              {text(
                "Tell us what kind of time, pace and budget you have. We’ll narrow the demo tours down to a few good matches.",
                "Выберите свободное время, желаемую сложность и бюджет — мы покажем несколько подходящих демо-туров.",
                "Бош убактыңызды, каалаган татаалдыкты жана бюджетиңизди тандаңыз — биз ылайыктуу демо-турларды көрсөтөбүз.",
              )}
            </SectionHeading>

            <div className="surface-panel p-5 sm:p-6" data-testid="trip-finder">
              <div className="space-y-5">
                <fieldset>
                  <legend className="text-sm font-bold">
                    {text(
                      "How much time do you have?",
                      "Сколько у вас времени?",
                      "Канча убактыңыз бар?",
                    )}
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {finderDurations.map((duration) => (
                      <FinderChoice
                        key={duration}
                        active={finderDuration === duration}
                        onClick={() => setFinderDuration(duration)}
                      >
                        {
                          {
                            any: text("Any length", "Любая длительность", "Каалаган узактык"),
                            "1": text("1 day", "1 день", "1 күн"),
                            "2-3": text("2–3 days", "2–3 дня", "2–3 күн"),
                            "4+": text("4+ days", "4+ дней", "4+ күн"),
                          }[duration]
                        }
                      </FinderChoice>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-sm font-bold">
                    {text("Preferred pace", "Желаемая сложность", "Каалаган татаалдык")}
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {finderDifficulties.map((difficulty) => (
                      <FinderChoice
                        key={difficulty}
                        active={finderDifficulty === difficulty}
                        onClick={() => setFinderDifficulty(difficulty)}
                      >
                        {
                          {
                            any: text("Any level", "Любой уровень", "Каалаган деңгээл"),
                            Easy: text("Easy", "Лёгкий", "Жеңил"),
                            Moderate: text("Moderate", "Средний", "Орточо"),
                            Challenging: text("Challenging", "Сложный", "Татаал"),
                          }[difficulty]
                        }
                      </FinderChoice>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-sm font-bold">
                    {text("Budget per person", "Бюджет на человека", "Адамга бюджет")}
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {finderBudgets.map((budget) => (
                      <FinderChoice
                        key={budget}
                        active={finderBudget === budget}
                        onClick={() => setFinderBudget(budget)}
                      >
                        {
                          {
                            any: text("Any budget", "Любой бюджет", "Каалаган бюджет"),
                            "under-200": text("Under $200", "До $200", "$200 чейин"),
                            "200-350": text("$200–350", "$200–350", "$200–350"),
                            "350-plus": text("$350+", "От $350", "$350+"),
                          }[budget]
                        }
                      </FinderChoice>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="mt-6 border-t border-border pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-2 text-sm font-bold">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    {text(
                      finderHasSelection ? "Your matches" : "A few places to start",
                      finderHasSelection ? "Подходящие варианты" : "Несколько вариантов для начала",
                      finderHasSelection
                        ? "Сизге ылайыктуу турлар"
                        : "Баштоо үчүн бир нече вариант",
                    )}
                  </p>
                  {finderHasSelection ? (
                    <button
                      type="button"
                      onClick={resetFinder}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      {text("Reset", "Сбросить", "Тазалоо")}
                    </button>
                  ) : null}
                </div>
                {isLoading ? <Skeleton className="mt-4 h-36 rounded-lg" /> : null}
                {!isLoading && finderResults.length === 0 ? (
                  <p className="mt-4 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    {text(
                      "No demo tour matches all of those choices. Try changing one filter.",
                      "Среди демо-туров нет точного совпадения. Измените один из фильтров.",
                      "Демо-турлардын арасында так дал келген вариант жок. Чыпкалардын бирин өзгөртүңүз.",
                    )}
                  </p>
                ) : null}
                <div data-testid="trip-finder-results" className="mt-4 grid gap-3 sm:grid-cols-3">
                  {finderResults.map((tour) => {
                    const localizedTour = localizeTour(tour, language);
                    return (
                      <Link
                        key={tour.id}
                        to="/tours/$slug"
                        params={{ slug: tour.slug }}
                        className="rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/60 hover:bg-secondary"
                      >
                        <p className="font-bold leading-tight">{localizedTour.name}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {tour.duration_days} {dayLabel(tour.duration_days, language)} ·{" "}
                          {localizedTour.difficulty}
                        </p>
                        <p className="mt-2 text-sm font-bold text-primary">
                          ${tour.price_per_person}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section id="featured" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <ScrollReveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow={text("Featured tours", "Популярные туры", "Тандалган турлар")}
              title={text("Where we go", "Куда мы едем", "Кайда барабыз")}
            >
              {text(
                "Pick a trip to see open dates and remaining spots.",
                "Выберите поездку, чтобы увидеть свободные даты и места.",
                "Бош даталарды жана калган орундарды көрүү үчүн сапарды тандаңыз.",
              )}
            </SectionHeading>
            <Link to="/tours" className="text-sm font-bold text-primary hover:underline">
              {text(
                `See all ${tours?.length ?? ""} tours →`,
                `Все туры (${tours?.length ?? ""}) →`,
                `Бардык турлар (${tours?.length ?? ""}) →`,
              )}
            </Link>
          </div>
          <div className="mt-8">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="inline-block h-[430px] w-full rounded-xl sm:mr-6 sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
                  />
                ))
              : null}
            {isError ? (
              <p className="text-sm text-destructive">
                {text(
                  "We couldn't load the tours just now. Please refresh the page.",
                  "Сейчас не удалось загрузить туры. Обновите страницу и попробуйте ещё раз.",
                  "Турларды азыр жүктөө мүмкүн болбоду. Баракты жаңыртып, кайра аракет кылыңыз.",
                )}
              </p>
            ) : null}
            {tours && tours.length > 0 ? <FeaturedTourCarousel tours={tours} /> : null}
          </div>
        </ScrollReveal>
      </section>

      <section id="adventure-calendar" className="border-y border-border bg-surface">
        <ScrollReveal className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-start">
            <SectionHeading
              eyebrow={text("Adventure calendar", "Календарь приключений", "Саякат календары")}
              title={text(
                "Choose your mountain season",
                "Выберите свой горный сезон",
                "Өзүңүздүн тоо мезгилиңизди тандаңыз",
              )}
            >
              {text(
                "A quick seasonal guide to the demo routes. Check each tour page for its actual departure dates.",
                "Короткий сезонный гид по демо-маршрутам. Фактические даты смотрите на странице каждого тура.",
                "Демо-маршруттар боюнча кыска сезондук гид. Так чыгуу даталарын ар бир турдун барагынан көрүңүз.",
              )}
            </SectionHeading>

            <div className="surface-panel overflow-hidden">
              <div
                role="tablist"
                aria-label={text("Mountain seasons", "Горные сезоны", "Тоо мезгилдери")}
                className="grid grid-cols-2 border-b border-border sm:grid-cols-4"
              >
                {seasons.map((season) => {
                  const info = seasonInfo[season];
                  const Icon = info.icon;
                  const selected = activeSeason === season;
                  return (
                    <button
                      key={season}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setActiveSeason(season)}
                      className={
                        selected
                          ? "border-b-2 border-primary bg-primary/10 px-4 py-4 text-left text-foreground"
                          : "border-b-2 border-transparent px-4 py-4 text-left text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      }
                    >
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                      <span className="mt-2 block text-sm font-bold">
                        {text(
                          season === "spring"
                            ? "Spring"
                            : season === "summer"
                              ? "Summer"
                              : season === "autumn"
                                ? "Autumn"
                                : "Winter",
                          season === "spring"
                            ? "Весна"
                            : season === "summer"
                              ? "Лето"
                              : season === "autumn"
                                ? "Осень"
                                : "Зима",
                          season === "spring"
                            ? "Жаз"
                            : season === "summer"
                              ? "Жай"
                              : season === "autumn"
                                ? "Күз"
                                : "Кыш",
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {info.months}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <activeSeasonInfo.icon
                    className="mt-1 h-6 w-6 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-eyebrow">{activeSeasonInfo.months}</p>
                    <h3 className="mt-1 font-display text-3xl">{activeSeasonInfo.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {activeSeasonInfo.body}
                    </p>
                  </div>
                </div>

                {seasonTours.length > 0 ? (
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {seasonTours.map((tour) => {
                      const localizedTour = localizeTour(tour, language);
                      return (
                        <Link
                          key={tour.id}
                          to="/tours/$slug"
                          params={{ slug: tour.slug }}
                          className="group overflow-hidden rounded-lg border border-border bg-background transition-colors hover:border-primary/60"
                        >
                          <img
                            src={tourImage(tour.image_key)}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="aspect-[16/9] w-full object-cover"
                          />
                          <div className="p-3">
                            <p className="font-bold leading-tight group-hover:text-primary">
                              {localizedTour.name}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {tour.duration_days} {dayLabel(tour.duration_days, language)} · $
                              {tour.price_per_person}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-6 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    {activeSeasonInfo.empty}
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="border-y border-border bg-surface">
        <ScrollReveal className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow={text(
              "Why Ala-Too Adventures",
              "Почему Ala-Too Adventures",
              "Эмне үчүн Ala-Too Adventures",
            )}
            title={text(
              "Simple, honest mountain trips",
              "Простые и честные поездки в горы",
              "Жөнөкөй жана ишенимдүү тоо сапарлары",
            )}
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {localizedBenefits.map((b) => (
              <div key={b.title} className="surface-panel p-6">
                <b.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-bold">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <ScrollReveal>
          <SectionHeading
            eyebrow={text("How it works", "Как это работает", "Бул кандай иштейт")}
            title={text("Booked in three steps", "Бронирование за три шага", "Үч кадамда брондоо")}
          />
          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            {localizedSteps.map((s) => (
              <li key={s.n} className="border-t-2 border-primary pt-5">
                <span className="font-display text-5xl text-primary">{s.n}</span>
                <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </ScrollReveal>
      </section>

      {recommended.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <ScrollReveal>
            <SectionHeading
              eyebrow={text("Recommended", "Рекомендации", "Сунуштар")}
              title={text(
                "Not sure where to start?",
                "Не знаете, с чего начать?",
                "Эмнеден баштаарыңызды билбейсизби?",
              )}
            />
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {recommended.map(({ label, tour }) => (
                <Link
                  key={label}
                  to="/tours/$slug"
                  params={{ slug: tour.slug }}
                  className="group flex gap-4 rounded-xl border border-border bg-card p-4 motion-safe:transition-[transform,border-color,box-shadow] motion-safe:duration-200 motion-safe:hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-ridge)]"
                >
                  <img
                    src={tourImage(tour.image_key)}
                    alt={localizeTour(tour, language).name}
                    loading="lazy"
                    decoding="async"
                    className="h-24 w-24 shrink-0 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-eyebrow">
                      {language === "en"
                        ? label
                        : language === "ru"
                          ? ({
                              "Short on time": "Мало времени",
                              "A weekend away": "На выходные",
                              "The big adventure": "Большое приключение",
                            }[label] ?? label)
                          : ({
                              "Short on time": "Убакыт аз болсо",
                              "A weekend away": "Дем алышка",
                              "The big adventure": "Чоң саякат",
                            }[label] ?? label)}
                    </p>
                    <p className="mt-1 font-bold group-hover:text-primary">
                      {localizeTour(tour, language).name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {tour.duration_days} {dayLabel(tour.duration_days, language)} ·{" "}
                      {localizeTour(tour, language).difficulty} · {text("from", "от", "баштап")} $
                      {tour.price_per_person}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </section>
      ) : null}

      <section className="border-y border-border bg-surface">
        <ScrollReveal className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow={text("The team", "Команда", "Команда")}
            title={text("Your guides", "Ваши гиды", "Сиздин гиддер")}
          >
            {text(
              "A small local team — you'll know who is leading your trip before you arrive.",
              "Небольшая местная команда: вы заранее знаете, кто ведёт вашу поездку.",
              "Чакан жергиликтүү команда: сапарыңызды ким жетектээрин алдын ала билесиз.",
            )}
          </SectionHeading>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {content.guides.map((g) => (
              <div key={g.name} className="surface-panel p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 font-display text-2xl text-primary">
                  {g.name[0]}
                </div>
                <h3 className="mt-4 text-lg font-bold">{g.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {g.role}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{g.bio}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <ScrollReveal>
          <SectionHeading
            eyebrow={text("Guest stories", "Отзывы гостей", "Коноктордун пикирлери")}
            title={text(
              "What travellers say",
              "Что говорят путешественники",
              "Саякатчылар эмне дешет",
            )}
          >
            {text(
              "Sample reviews for this demo — not verified customers.",
              "Примеры отзывов для демо-версии, это не подтверждённые клиенты.",
              "Бул демо-нускадагы мисал пикирлер, алар ырасталган кардарлар эмес.",
            )}
          </SectionHeading>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {content.reviews.map((r) => (
              <figure key={r.name} className="rounded-xl border border-border bg-card p-6">
                <blockquote className="text-sm leading-relaxed">&ldquo;{r.text}&rdquo;</blockquote>
                <figcaption className="mt-4 text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">{r.name}</span> · {r.from} · {r.tour}
                </figcaption>
              </figure>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <ScrollReveal>
          <SectionHeading
            eyebrow={text("FAQ", "Частые вопросы", "Көп берилүүчү суроолор")}
            title={text("Good to know", "Полезно знать", "Билип коюңуз")}
          />
          <Accordion type="single" collapsible className="mt-6">
            {content.faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </section>

      <section className="border-t border-border bg-surface">
        <ScrollReveal className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <Mountain className="mt-1 h-8 w-8 shrink-0 text-primary" />
              <div>
                <h2 className="font-display text-5xl">
                  {text("Ready for the mountains?", "Готовы к горам?", "Тоого даярсызбы?")}
                </h2>
                <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                  {text(
                    "Pick a tour, choose an open date and you're booked.",
                    "Выберите тур, свободную дату — и бронирование готово.",
                    "Турду жана бош датаны тандаңыз — брондоо даяр.",
                  )}
                </p>
              </div>
            </div>
            <Link
              to="/tours"
              className="rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
            >
              {text("Explore tours", "Выбрать тур", "Тур тандоо")}
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
