import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Compass, Map, Mountain, MousePointerClick, Users } from "lucide-react";

import heroImage from "@/assets/hero-mountains.jpg";
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
      <h2 className="mt-2 font-display text-5xl">{title}</h2>
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

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Snow-capped Tian Shan peaks above a valley at sunrise"
          width={1920}
          height={1088}
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
            {text(
              "Walk the Tian Shan with people who call it home.",
              "Откройте Тянь-Шань с теми, кто называет его домом.",
              "Теңир-Тоону өз мекеним дегендер менен бирге ачыңыз.",
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

      <section id="featured" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
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
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[430px] rounded-xl" />
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
          {tours?.slice(0, 3).map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
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
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
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
      </section>

      {recommended.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
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
        </section>
      ) : null}

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
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
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
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
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
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
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
      </section>
    </div>
  );
}
