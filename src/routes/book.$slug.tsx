import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  Clock,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  availabilityLabel,
  availabilityOf,
  createBooking,
  departuresQuery,
  formatDate,
  formatTime,
  spotsLeft,
  tourQuery,
  type Departure,
} from "@/lib/bookings";
import { tourImage } from "@/lib/tour-images";
import { validateBookingForm, validateField, type BookingField } from "@/lib/booking-validation";
import { useI18n } from "@/lib/i18n";
import { localizeTour } from "@/lib/tour-localization";

type Search = { departure?: string };

export const Route = createFileRoute("/book/$slug")({
  validateSearch: (search: Record<string, unknown>): Search =>
    typeof search["departure"] === "string" ? { departure: search["departure"] } : {},
  head: ({ params }) => {
    const name = params.slug
      .split("-")
      .map((w) => w[0]!.toUpperCase() + w.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `Book ${name} — Ala-Too Adventures` },
        {
          name: "description",
          content: `Pick a date, choose your group size and confirm your place on the ${name} trip.`,
        },
        { name: "robots", content: "noindex" },
        { property: "og:title", content: `Book ${name} — Ala-Too Adventures` },
        {
          property: "og:description",
          content: `Reserve your spot on the ${name} trip in a couple of minutes.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: BookingFlow,
});

const stepLabels = ["Date", "Guests", "Details", "Review"];
const russianStepLabels = ["Дата", "Гости", "Контакты", "Проверка"];

type Draft = {
  step: number;
  departureId?: string | undefined;
  guests: number;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  notes: string;
  website?: string;
};

const draftKey = (slug: string) => `ala-too-booking-draft:${slug}`;

function FieldError({ id, message }: { id: string; message?: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

function BookingFlow() {
  const { language } = useI18n();
  const ru = language === "ru";
  const { slug } = Route.useParams();
  const { departure: presetDeparture } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const submitBooking = useServerFn(createBooking);

  const { data: tour, isLoading, isError } = useQuery(tourQuery(slug));
  const { data: departures, isLoading: loadingDates } = useQuery(departuresQuery(tour?.id));

  const [step, setStep] = useState(presetDeparture ? 1 : 0);
  const [departureId, setDepartureId] = useState<string | undefined>(presetDeparture);
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<BookingField, string>>>({});
  const restored = useRef(false);

  // Restore an unfinished booking for this tour (kept for this browser tab only).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(draftKey(slug));
      if (raw) {
        const d = JSON.parse(raw) as Draft;
        setName(d.name ?? "");
        setEmail(d.email ?? "");
        setPhone(d.phone ?? "");
        setWhatsapp(d.whatsapp ?? "");
        setNotes(d.notes ?? "");
        setGuests(d.guests || 2);
        if (!presetDeparture) {
          setDepartureId(d.departureId);
          setStep(d.step ?? 0);
        }
      }
    } catch {
      /* ignore broken drafts */
    }
    restored.current = true;
  }, [slug, presetDeparture]);

  useEffect(() => {
    if (!restored.current) return;
    const draft: Draft = { step, departureId, guests, name, email, phone, whatsapp, notes };
    sessionStorage.setItem(draftKey(slug), JSON.stringify(draft));
  }, [slug, step, departureId, guests, name, email, phone, whatsapp, notes]);

  const all = departures ?? [];
  const open = all.filter((d) => spotsLeft(d) > 0);
  const departure: Departure | undefined = open.find((d) => d.id === departureId);
  const maxGuests = departure ? Math.min(spotsLeft(departure), tour?.max_group_size ?? 99) : 1;
  const total = tour ? guests * tour.price_per_person : 0;

  // If the restored/preset date is no longer bookable, send the guest back to pick one.
  useEffect(() => {
    if (!loadingDates && departures && step > 0 && !departure) setStep(0);
  }, [loadingDates, departures, step, departure]);

  // Keep the guest count within the remaining spots.
  useEffect(() => {
    if (departure && guests > maxGuests) setGuests(Math.max(1, maxGuests));
  }, [departure, guests, maxGuests]);

  const formErrors = validateBookingForm({
    name,
    email,
    phone,
    whatsapp,
    notes,
    guests,
    departureId,
    maxGuests,
    language,
  });
  const contactFields: BookingField[] = ["name", "email", "phone", "whatsapp", "notes"];
  const contactValid = contactFields.every((f) => !formErrors[f]);
  const guestsValid = !formErrors.guests;

  const values: Record<BookingField, string> = { name, email, phone, whatsapp, notes };
  const setters: Record<BookingField, (v: string) => void> = {
    name: setName,
    email: setEmail,
    phone: setPhone,
    whatsapp: setWhatsapp,
    notes: setNotes,
  };

  function change(field: BookingField, value: string) {
    setters[field](value);
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const message = validateField(field, value, language);
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  }

  function blur(field: BookingField) {
    const message = validateField(field, values[field], language);
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  }

  function goNext() {
    if (step === 2 && !contactValid) {
      const all: Partial<Record<BookingField, string>> = {};
      for (const f of contactFields) if (formErrors[f]) all[f] = formErrors[f];
      setErrors(all);
      const first = contactFields.find((f) => formErrors[f]);
      if (first) document.getElementById(first)?.focus();
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-16 sm:px-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !tour) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-5xl">{ru ? "Тур не найден" : "Trip not found"}</h1>
        <p className="mt-3 text-muted-foreground">
          {ru
            ? "Не удалось загрузить этот тур. Попробуйте ещё раз."
            : "We couldn't load this tour. Please try again."}
        </p>
        <Link
          to="/tours"
          className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          {ru ? "Все туры" : "See all tours"}
        </Link>
      </div>
    );
  }

  async function confirm() {
    if (!tour || !departure) return;
    setSubmitting(true);
    try {
      const result = await submitBooking({
        data: { departureId: departure.id, name, email, phone, whatsapp, guests, notes, website },
      });
      if (result.status === "full") {
        toast.error(
          ru
            ? "Кто-то только что забронировал эти места. Выберите другую дату или меньше гостей."
            : "Someone just booked those spots. Please pick another date or fewer guests.",
        );
        await queryClient.invalidateQueries({ queryKey: ["departures"] });
        setStep(0);
        setSubmitting(false);
        return;
      }
      if (result.status === "invalid") {
        toast.error(result.error);
        setSubmitting(false);
        return;
      }
      sessionStorage.removeItem(draftKey(slug));
      void queryClient.invalidateQueries({ queryKey: ["departures"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-bookings"] });
      navigate({ to: "/booking/$reference", params: { reference: result.reference } });
    } catch (err) {
      toast.error(
        ru
          ? "Не удалось сохранить бронирование. Попробуйте ещё раз."
          : "We couldn't save that booking. Please try again.",
      );
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
  }

  const inputProps = (field: BookingField) => ({
    id: field,
    value: values[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      change(field, e.target.value),
    onBlur: () => blur(field),
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
    className: errors[field] ? "mt-1.5 border-destructive" : "mt-1.5",
  });

  const nextDisabled = (step === 0 && !departure) || (step === 1 && !guestsValid);
  const translatedTour = localizeTour(tour, language);
  const labels = ru ? russianStepLabels : stepLabels;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        to="/tours/$slug"
        params={{ slug }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> {ru ? "Назад к туру" : "Back to"} {translatedTour.name}
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <img
          src={tourImage(tour.image_key)}
          alt={translatedTour.name}
          loading="lazy"
          width={1280}
          height={864}
          className="h-16 w-16 rounded-lg object-cover"
        />
        <div>
          <p className="text-eyebrow">{ru ? "Бронирование" : "Booking"}</p>
          <h1 className="font-display text-4xl">{translatedTour.name}</h1>
        </div>
      </div>

      {/* Progress */}
      <ol className="mt-8 flex gap-2" aria-label={ru ? "Ход бронирования" : "Booking progress"}>
        {labels.map((label, i) => {
          const done = i < step;
          const current = i === step;
          const reachable = i < step;
          return (
            <li key={label} className="flex-1" aria-current={current ? "step" : undefined}>
              <div
                className={
                  i <= step ? "h-1 rounded-full bg-primary" : "h-1 rounded-full bg-secondary"
                }
              />
              <button
                type="button"
                disabled={!reachable}
                onClick={() => setStep(i)}
                className={
                  current
                    ? "mt-2 inline-flex items-center gap-1.5 text-xs font-bold"
                    : done
                      ? "mt-2 inline-flex items-center gap-1.5 text-xs font-semibold hover:text-primary"
                      : "mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
                }
              >
                <span
                  className={
                    done || current
                      ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground"
                      : "flex h-5 w-5 items-center justify-center rounded-full border border-border text-[10px]"
                  }
                >
                  {done ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {label}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs text-muted-foreground">
        {ru
          ? `Шаг ${step + 1} из 4 · при возврате данные сохранятся.`
          : `Step ${step + 1} of 4 · your details are kept if you go back.`}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="surface-panel p-6">
          {step === 0 ? (
            <div>
              <h2 className="font-display text-3xl">{ru ? "Выберите дату" : "Pick a date"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {ru
                  ? "Демо-доступность. Время указано по Бишкеку."
                  : "Demo availability. Start times are Bishkek time."}
              </p>
              <div className="mt-4 space-y-2">
                {loadingDates
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))
                  : null}
                {!loadingDates && open.length === 0 ? (
                  <p className="rounded-lg border border-border p-5 text-sm text-muted-foreground">
                    {ru
                      ? "Сейчас для этого тура нет свободных дат. Посмотрите другой тур или загляните позже."
                      : "No open dates for this trip at the moment. Check another tour or come back soon."}
                  </p>
                ) : null}
                {all.map((d) => {
                  const selected = d.id === departureId;
                  const state = availabilityOf(d);
                  const full = state === "full";
                  return (
                    <button
                      key={d.id}
                      type="button"
                      disabled={full}
                      aria-pressed={selected}
                      onClick={() => {
                        setDepartureId(d.id);
                        setGuests((g) =>
                          Math.max(1, Math.min(g, spotsLeft(d), tour.max_group_size)),
                        );
                      }}
                      className={
                        full
                          ? "flex w-full cursor-not-allowed items-center justify-between rounded-lg border border-border p-4 text-left opacity-50"
                          : selected
                            ? "flex w-full items-center justify-between rounded-lg border border-primary bg-primary/10 p-4 text-left"
                            : "flex w-full items-center justify-between rounded-lg border border-border p-4 text-left transition-colors hover:border-primary/50"
                      }
                    >
                      <span className="flex items-center gap-3">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        <span>
                          <span className="block font-semibold">
                            {formatDate(d.departure_date, language)}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {ru ? "Начало" : "Starts"} {formatTime(d.departure_time)} ·{" "}
                            <span
                              className={
                                state === "few"
                                  ? "font-semibold text-accent"
                                  : state === "available"
                                    ? "text-success"
                                    : ""
                              }
                            >
                              {availabilityLabel(d, language)}
                            </span>
                          </span>
                        </span>
                      </span>
                      {selected ? <Check className="h-5 w-5 text-primary" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === 1 && departure ? (
            <div>
              <h2 className="font-display text-3xl">
                {ru ? "Сколько гостей?" : "How many guests?"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(departure.departure_date, language)} {ru ? "в" : "at"}{" "}
                {formatTime(departure.departure_time)} · {availabilityLabel(departure, language)}
              </p>
              <div className="mt-6 flex items-center gap-6">
                <button
                  type="button"
                  aria-label={ru ? "Меньше гостей" : "Fewer guests"}
                  disabled={guests <= 1}
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-border disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-display text-6xl" aria-live="polite">
                  {guests}
                </span>
                <button
                  type="button"
                  aria-label={ru ? "Больше гостей" : "More guests"}
                  disabled={guests >= maxGuests}
                  onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-border disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {guests >= maxGuests ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  {ru
                    ? "Это максимальное число гостей для этой даты."
                    : "That's the most we can take on this date."}
                </p>
              ) : null}
              {formErrors.guests ? (
                <FieldError id="guests-error" message={formErrors.guests} />
              ) : null}
              <div className="mt-6 rounded-lg border border-border p-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    {guests}{" "}
                    {ru ? (guests === 1 ? "гость" : "гостей") : guests === 1 ? "guest" : "guests"} ×
                    ${tour.price_per_person}
                  </span>
                  <span>${total}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between border-t border-border pt-2">
                  <span className="font-bold">{ru ? "Итого" : "Total"}</span>
                  <span className="font-display text-3xl">${total}</span>
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <form
              className="space-y-4"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                goNext();
              }}
            >
              <h2 className="font-display text-3xl">{ru ? "Ваши контакты" : "Your details"}</h2>
              <div
                className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
                aria-hidden="true"
              >
                <Label htmlFor="website">{ru ? "Сайт" : "Website"}</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">{ru ? "Полное имя" : "Full name"}</Label>
                  <Input {...inputProps("name")} autoComplete="name" placeholder="Marta Kowalski" />
                  <FieldError id="name-error" message={errors.name} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...inputProps("email")}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                  <FieldError id="email-error" message={errors.email} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone">{ru ? "Телефон" : "Phone"}</Label>
                  <Input
                    {...inputProps("phone")}
                    type="tel"
                    autoComplete="tel"
                    placeholder="+996 555 000 000"
                  />
                  <FieldError id="phone-error" message={errors.phone} />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp ({ru ? "необязательно" : "optional"})</Label>
                  <Input
                    {...inputProps("whatsapp")}
                    type="tel"
                    placeholder={
                      ru ? "Если отличается от телефона" : "If different from your phone"
                    }
                  />
                  <FieldError id="whatsapp-error" message={errors.whatsapp} />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">
                  {ru
                    ? "Что нам стоит знать? (необязательно)"
                    : "Anything we should know? (optional)"}
                </Label>
                <Textarea
                  {...inputProps("notes")}
                  placeholder={
                    ru
                      ? "Питание, адрес, уровень опыта…"
                      : "Dietary needs, pickup address, experience level…"
                  }
                />
                <div className="flex justify-between">
                  <FieldError id="notes-error" message={errors.notes} />
                  <span className="ml-auto mt-1.5 text-xs text-muted-foreground">
                    {notes.length}/500
                  </span>
                </div>
              </div>
              <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
            </form>
          ) : null}

          {step === 3 && departure ? (
            <div>
              <h2 className="font-display text-3xl">
                {ru ? "Проверьте бронирование" : "Review your booking"}
              </h2>
              <dl className="mt-5 divide-y divide-border text-sm">
                {[
                  [ru ? "Тур" : "Tour", translatedTour.name],
                  [ru ? "Дата" : "Date", formatDate(departure.departure_date, language)],
                  [
                    ru ? "Время начала" : "Start time",
                    `${formatTime(departure.departure_time)} (${ru ? "по Бишкеку" : "Bishkek time"})`,
                  ],
                  [ru ? "Гости" : "Guests", String(guests)],
                  [ru ? "Точка встречи" : "Meeting point", translatedTour.meeting_point],
                  [ru ? "Имя" : "Name", name],
                  ["Email", email],
                  [ru ? "Телефон" : "Phone", phone],
                  ...(whatsapp ? ([["WhatsApp", whatsapp]] as [string, string][]) : []),
                  ...(notes ? ([[ru ? "Примечание" : "Notes", notes]] as [string, string][]) : []),
                  [ru ? "Цена за человека" : "Price per person", `$${tour.price_per_person}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-6 py-3">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="break-words text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-2 rounded-lg bg-primary/10 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold">
                    {ru ? "Итого" : "Total"}{" "}
                    <span className="font-normal text-muted-foreground">
                      ({guests} × ${tour.price_per_person})
                    </span>
                  </span>
                  <span className="font-display text-5xl">${total}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ru
                    ? "Оплата в день поездки — сейчас платить не нужно."
                    : "Paid on the day — no payment is taken now."}
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || submitting}
              className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
            >
              {ru ? "Назад" : "Back"}
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={nextDisabled}
                className="rounded-md bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-40"
              >
                {ru ? "Продолжить" : "Continue"}
              </button>
            ) : (
              <button
                type="button"
                onClick={confirm}
                disabled={submitting || !departure || !contactValid || !guestsValid}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitting
                  ? ru
                    ? "Подтверждаем…"
                    : "Confirming…"
                  : ru
                    ? `Подтвердить бронирование · $${total}`
                    : `Confirm booking · $${total}`}
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="surface-panel p-5 text-sm">
            <p className="text-eyebrow">{ru ? "Ваша поездка" : "Your trip"}</p>
            <p className="mt-2 font-display text-2xl">{translatedTour.name}</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                {departure
                  ? formatDate(departure.departure_date, language)
                  : ru
                    ? "Выберите дату"
                    : "Pick a date"}
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                {departure
                  ? `${ru ? "Начало" : "Start"}: ${formatTime(departure.departure_time)}`
                  : "—"}
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                {guests}{" "}
                {ru ? (guests === 1 ? "гость" : "гостей") : guests === 1 ? "guest" : "guests"}
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {translatedTour.meeting_point}
              </li>
            </ul>
            <div className="mt-4 space-y-1 border-t border-border pt-3">
              <div className="flex justify-between text-muted-foreground">
                <span>
                  ${tour.price_per_person} × {guests}
                </span>
                <span>${total}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-bold">{ru ? "Итого" : "Total"}</span>
                <span className="font-display text-3xl">${total}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
