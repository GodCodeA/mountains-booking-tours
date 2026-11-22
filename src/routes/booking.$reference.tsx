import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  CheckSquare,
  Copy,
  ExternalLink,
  MapPin,
  MessageCircle,
  RefreshCw,
  Send,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  bookingQuery,
  departuresQuery,
  displayBookingReference,
  formatDate,
  formatTime,
  guestCancelBooking,
  guestRescheduleBooking,
  isBookingChangeAllowed,
  sendGuestBookingMessage,
  spotsLeft,
} from "@/lib/bookings";
import { tourImage } from "@/lib/tour-images";
import { guestLabel, localText, useI18n } from "@/lib/i18n";
import { localizeMeetingPoint, localizeTourName } from "@/lib/tour-localization";
import { tourExtras } from "@/lib/tour-content";
import { googleMapsUrl, tourMapPoint } from "@/lib/tour-map";

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

function icsEscape(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function downloadCalendarFile({
  date,
  time,
  title,
  location,
}: {
  date: string;
  time: string;
  title: string;
  location: string;
}) {
  const [year, month, day] = date.split("-");
  const [hours = "00", minutes = "00"] = time.split(":");
  const startsAt = `${year}${month}${day}T${hours}${minutes}00`;
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ala-Too Adventures//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@ala-too-adventures`,
    `DTSTAMP:${new Date()
      .toISOString()
      .replaceAll(/[-:]/g, "")
      .replace(/\.\d{3}/, "")}`,
    `DTSTART;TZID=Asia/Bishkek:${startsAt}`,
    `SUMMARY:${icsEscape(title)}`,
    `LOCATION:${icsEscape(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([calendar], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "ala-too-adventures-trip.ics";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function Confirmation() {
  const { reference } = Route.useParams();
  const { data: booking, isLoading, isError } = useQuery(bookingQuery(reference));
  const [copied, setCopied] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [message, setMessage] = useState("");
  const [checkedPacking, setCheckedPacking] = useState<string[]>([]);
  const { t, language } = useI18n();
  const queryClient = useQueryClient();
  const text = (english: string, russian: string, kyrgyz: string) =>
    localText(language, english, russian, kyrgyz);
  const runGuestCancel = useServerFn(guestCancelBooking);
  const runGuestReschedule = useServerFn(guestRescheduleBooking);
  const runGuestMessage = useServerFn(sendGuestBookingMessage);
  const departures = useQuery(departuresQuery(booking?.tour_id));
  const mapPoint = booking ? tourMapPoint(booking.tour_slug, language) : undefined;
  const packing = booking ? tourExtras(booking.tour_slug, language).whatToBring : [];
  const canChange = Boolean(
    booking &&
    booking.status !== "cancelled" &&
    isBookingChangeAllowed(booking.departure_date, booking.departure_time),
  );
  const alternativeDepartures = useMemo(
    () =>
      (departures.data ?? []).filter(
        (departure) =>
          departure.id !== booking?.departure_id && spotsLeft(departure) >= (booking?.guests ?? 0),
      ),
    [booking, departures.data],
  );

  useEffect(() => {
    if (!booking) return;
    try {
      const stored = window.localStorage.getItem(`ala-too-packing-${booking.reference}`);
      setCheckedPacking(stored ? (JSON.parse(stored) as string[]) : []);
    } catch {
      setCheckedPacking([]);
    }
  }, [booking]);

  function updatePacking(item: string) {
    if (!booking) return;
    setCheckedPacking((current) => {
      const next = current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item];
      window.localStorage.setItem(`ala-too-packing-${booking.reference}`, JSON.stringify(next));
      return next;
    });
  }

  const invalidateBooking = () => {
    void queryClient.invalidateQueries({ queryKey: ["booking", reference] });
    void queryClient.invalidateQueries({ queryKey: ["departures"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-bookings"] });
  };
  const cancel = useMutation({
    mutationFn: () => runGuestCancel({ data: { reference } }),
    onSuccess: (result) => {
      if (result.status === "closed") {
        toast.error(
          text(
            "Changes close 48 hours before departure.",
            "Изменения закрываются за 48 часов до выезда.",
            "Өзгөртүүлөр сапарга 48 саат калганда жабылат.",
          ),
        );
        return;
      }
      toast.success(
        text(
          "Your booking was cancelled.",
          "Ваше бронирование отменено.",
          "Брондооңуз жокко чыгарылды.",
        ),
      );
      invalidateBooking();
    },
    onError: () =>
      toast.error(
        text(
          "We couldn't cancel this booking.",
          "Не удалось отменить бронирование.",
          "Брондоону жокко чыгаруу мүмкүн болгон жок.",
        ),
      ),
  });
  const reschedule = useMutation({
    mutationFn: (departureId: string) => runGuestReschedule({ data: { reference, departureId } }),
    onSuccess: (result) => {
      const messages = {
        moved: text(
          "Your date was changed.",
          "Дата поездки изменена.",
          "Сапар күнүңүз өзгөртүлдү.",
        ),
        closed: text(
          "Changes close 48 hours before departure.",
          "Изменения закрываются за 48 часов до выезда.",
          "Өзгөртүүлөр сапарга 48 саат калганда жабылат.",
        ),
        full: text(
          "That date is now full.",
          "На эту дату уже нет мест.",
          "Бул датага орун калбай калды.",
        ),
        unavailable: text(
          "That date is unavailable.",
          "Эта дата недоступна.",
          "Бул дата жеткиликсиз.",
        ),
        cancelled: text(
          "This booking is already cancelled.",
          "Это бронирование уже отменено.",
          "Бул брондоо мурунтан жокко чыгарылган.",
        ),
        unchanged: text(
          "That is already your selected date.",
          "Эта дата уже выбрана.",
          "Бул дата буга чейин тандалган.",
        ),
      };
      if (result.status === "moved") toast.success(messages.moved);
      else toast.error(messages[result.status]);
      if (result.status === "moved") {
        setShowReschedule(false);
        invalidateBooking();
      }
    },
    onError: () =>
      toast.error(
        text(
          "We couldn't change your date.",
          "Не удалось изменить дату.",
          "Датаңызды өзгөртүү мүмкүн болгон жок.",
        ),
      ),
  });
  const sendMessage = useMutation({
    mutationFn: () => runGuestMessage({ data: { reference, body: message } }),
    onSuccess: (result) => {
      if (result.status === "rate_limited") {
        toast.error(
          text(
            "Please wait before sending another message.",
            "Подождите перед отправкой следующего сообщения.",
            "Кийинки билдирүүнү жөнөтүүдөн мурун күтө туруңуз.",
          ),
        );
        return;
      }
      setMessage("");
      toast.success(
        text(
          "Your message was sent to the owner.",
          "Сообщение отправлено владельцу.",
          "Билдирүү ээсине жөнөтүлдү.",
        ),
      );
    },
    onError: () =>
      toast.error(
        text(
          "We couldn't send your message.",
          "Не удалось отправить сообщение.",
          "Билдирүү жөнөтүлбөй калды.",
        ),
      ),
  });
  const bookingMessage = booking?.customer_name
    ? `${booking.customer_name}, ${text("you're booked", "вы забронированы", "сиз брондодуңуз")}`
    : text("You're booked", "Вы забронированы", "Сиз брондодуңуз");

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
        <h1 className="font-display text-5xl">
          {text("Booking not found", "Бронирование не найдено", "Брондоо табылган жок")}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {text(
            "We couldn't find that booking. Please check your confirmation link.",
            "Мы не нашли это бронирование. Проверьте ссылку в подтверждении.",
            "Бул брондоо табылган жок. Ырастоо шилтемесин текшериңиз.",
          )}
        </p>
        <Link
          to="/tours"
          className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          {text("Browse tours", "Смотреть туры", "Турларды көрүү")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-9 w-9 text-success" />
        <div>
          <p className="text-eyebrow">{bookingMessage}</p>
          <h1 className="font-display text-4xl sm:text-5xl">
            {text("See you in the mountains", "До встречи в горах", "Тоодо жолугушканча")}
          </h1>
        </div>
      </div>

      <p className="mt-3 text-muted-foreground">
        {t("bookingConfirmed")} {t("saveLink")}
      </p>

      <div className="mt-4">
        <div className="flex flex-wrap gap-3">
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
        <p className="mt-1.5 text-xs text-muted-foreground/65">
          {text(
            "Keep this private link to return to your trip details.",
            "Сохраните эту личную ссылку, чтобы вернуться к деталям поездки.",
            "Сапардын чоо-жайына кайтуу үчүн бул жеке шилтемени сактап коюңуз.",
          )}
        </p>
      </div>

      <div className="surface-panel mt-6 overflow-hidden">
        <img
          src={tourImage(booking.image_key)}
          alt={localizeTourName(booking.tour_name, language)}
          loading="lazy"
          width={1280}
          height={864}
          className="h-36 w-full object-cover sm:h-44"
        />
        <div className="space-y-3 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl">
              {localizeTourName(booking.tour_name, language)}
            </h2>
            <span className="rounded-md bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
              {t("reference")} {displayBookingReference(booking.reference)}
            </span>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              {formatDate(booking.departure_date, language)} · {formatTime(booking.departure_time)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> {booking.guests}{" "}
              {guestLabel(booking.guests, language)}
            </span>
            <span className="inline-flex items-center gap-2 sm:col-span-2">
              <MapPin className="h-4 w-4 text-primary" />{" "}
              {localizeMeetingPoint(booking.meeting_point, language)}
            </span>
          </div>
          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">{t("totalPayable")}</span>
            <span className="font-display text-4xl">${booking.total_price}</span>
          </div>
        </div>
      </div>

      <section className="surface-panel mt-5 p-5 sm:p-6" aria-labelledby="trip-tools-title">
        <p className="text-eyebrow">{text("Your trip", "Ваша поездка", "Сиздин сапарыңыз")}</p>
        <h2 id="trip-tools-title" className="mt-2 font-display text-3xl">
          {booking.status === "cancelled"
            ? text(
                "This booking is cancelled",
                "Это бронирование отменено",
                "Бул брондоо жокко чыгарылды",
              )
            : canChange
              ? text(
                  "Plans can still change",
                  "Планы ещё можно изменить",
                  "Пландарды дагы өзгөртсө болот",
                )
              : text("Your trip is locked in", "Ваша поездка подтверждена", "Сапарыңыз бекитилди")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {booking.status === "cancelled"
            ? text(
                "If you need a new date, browse the open tours below.",
                "Если нужна новая дата, посмотрите доступные туры ниже.",
                "Жаңы дата керек болсо, төмөнкү ачык турларды караңыз.",
              )
            : canChange
              ? text(
                  "You may cancel or move your trip until 48 hours before departure.",
                  "Отменить или перенести поездку можно не позднее чем за 48 часов до выезда.",
                  "Сапарды чыгууга 48 саат калганга чейин жокко чыгарып же башка күнгө жылдырсаңыз болот.",
                )
              : text(
                  "Changes close 48 hours before departure. Your guide has your booking details.",
                  "Изменения закрываются за 48 часов до выезда. У гида уже есть детали бронирования.",
                  "Өзгөртүүлөр сапарга 48 саат калганда жабылат. Гидде брондоо маалыматы бар.",
                )}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {booking.status !== "cancelled" ? (
            <button
              type="button"
              onClick={() =>
                downloadCalendarFile({
                  date: booking.departure_date,
                  time: booking.departure_time,
                  title: localizeTourName(booking.tour_name, language),
                  location: localizeMeetingPoint(booking.meeting_point, language),
                })
              }
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              <CalendarPlus className="h-4 w-4" />{" "}
              {text("Add to calendar", "Добавить в календарь", "Жылнаамага кошуу")}
            </button>
          ) : null}
          {canChange ? (
            <>
              <button
                type="button"
                onClick={() => setShowReschedule((value) => !value)}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                <RefreshCw className="h-4 w-4" />{" "}
                {text("Change date", "Изменить дату", "Датаны өзгөртүү")}
              </button>
              <button
                type="button"
                disabled={cancel.isPending}
                onClick={() => {
                  if (
                    window.confirm(
                      text(
                        "Cancel this booking?",
                        "Отменить это бронирование?",
                        "Бул брондоону жокко чыгарасызбы?",
                      ),
                    )
                  )
                    cancel.mutate();
                }}
                className="inline-flex items-center gap-2 rounded-md border border-destructive/60 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                <X className="h-4 w-4" />{" "}
                {text("Cancel booking", "Отменить бронь", "Брондоону жокко чыгаруу")}
              </button>
            </>
          ) : null}
        </div>
        {showReschedule ? (
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-semibold">
              {text(
                "Choose another open date",
                "Выберите другую свободную дату",
                "Башка бош датаны тандаңыз",
              )}
            </p>
            {departures.isLoading ? <Skeleton className="mt-3 h-10 w-56" /> : null}
            {!departures.isLoading && alternativeDepartures.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {text(
                  "There are no other dates with enough places right now.",
                  "Сейчас нет других дат с нужным количеством мест.",
                  "Азыр керектүү санда орун бар башка даталар жок.",
                )}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {alternativeDepartures.map((departure) => (
                <button
                  key={departure.id}
                  type="button"
                  disabled={reschedule.isPending}
                  onClick={() => reschedule.mutate(departure.id)}
                  className="rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-secondary disabled:opacity-50"
                >
                  {formatDate(departure.departure_date, language)} ·{" "}
                  {formatTime(departure.departure_time)}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {mapPoint ? (
        <section className="surface-panel mt-5 p-5 sm:p-6" aria-labelledby="destination-map-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-eyebrow">{text("Destination", "Направление", "Багыт")}</p>
              <h2 id="destination-map-title" className="mt-2 font-display text-3xl">
                {mapPoint.label}
              </h2>
            </div>
            <a
              href={googleMapsUrl(mapPoint)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-secondary"
            >
              {text("Open map", "Открыть карту", "Картаны ачуу")}{" "}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {text(
              "This marks the destination area, not the pickup point or an exact route.",
              "Это район поездки, а не точка сбора и не точный маршрут.",
              "Бул сапар боло турган аймак; жолугушуу жери же так маршрут эмес.",
            )}
          </p>
        </section>
      ) : null}

      {packing.length ? (
        <section className="surface-panel mt-5 p-5 sm:p-6" aria-labelledby="packing-title">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <div>
              <p className="text-eyebrow">{text("Prepare", "Подготовка", "Даярдык")}</p>
              <h2 id="packing-title" className="mt-1 font-display text-3xl">
                {text("Your packing list", "Что взять с собой", "Өзүңүз менен ала келчү нерселер")}
              </h2>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {packing.map((item) => {
              const checked = checkedPacking.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => updatePacking(item)}
                  className={`flex items-start gap-2 rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${checked ? "border-success/50 bg-success/10 text-foreground" : "border-border hover:bg-secondary"}`}
                >
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? "border-success bg-success text-success-foreground" : "border-muted-foreground"}`}
                  >
                    {checked ? <Check className="h-3 w-3" /> : null}
                  </span>
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {text(
              "Your ticks are saved only in this browser.",
              "Отметки сохраняются только в этом браузере.",
              "Белгилер ушул браузерде гана сакталат.",
            )}
          </p>
        </section>
      ) : null}

      <section className="surface-panel mt-5 p-5 sm:p-6" aria-labelledby="message-owner-title">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <div>
            <p className="text-eyebrow">{text("Need help?", "Нужна помощь?", "Жардам керекпи?")}</p>
            <h2 id="message-owner-title" className="mt-1 font-display text-3xl">
              {text("Message the owner", "Написать владельцу", "Ээсине жазуу")}
            </h2>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {text(
            "Ask a question about this booking. Your message appears in the owner dashboard.",
            "Задайте вопрос по этому бронированию. Сообщение появится в кабинете владельца.",
            "Бул брондоо боюнча суроо бериңиз. Билдирүү ээсинин кабинетинде көрүнөт.",
          )}
        </p>
        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={1000}
          className="mt-4 min-h-24"
          placeholder={text("Your question", "Ваш вопрос", "Сурооңуз")}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{message.length}/1000</span>
          <button
            type="button"
            disabled={message.trim().length < 2 || sendMessage.isPending}
            onClick={() => sendMessage.mutate()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> {text("Send message", "Отправить", "Жөнөтүү")}
          </button>
        </div>
      </section>
    </div>
  );
}
