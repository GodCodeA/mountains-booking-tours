import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Download,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { guestLabel, localText, useI18n } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  cancelBooking,
  adminMembershipQuery,
  bishkekToday,
  departuresQuery,
  displayBookingReference,
  emergencyCancelBooking,
  formatDate,
  formatBishkekDateTime,
  hasDepartureStarted,
  isBookingChangeAllowed,
  isEmergencyCancellationAvailable,
  listEmergencyCancellationAudit,
  listDashboardBookings,
  listGuestBookingMessages,
  rescheduleBooking,
  spotsLeft,
  type Booking,
  type Departure,
  type EmergencyCancellationAudit,
  type GuestBookingMessage,
  type Tour,
} from "@/lib/bookings";
import { localizeTour } from "@/lib/tour-localization";

type Row = Booking & { tours: Tour; departures: Departure };

/** Server functions cannot read the browser's localStorage session themselves. */
async function ownerAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Your owner session has expired. Please sign in again.");
  }
  return { headers: { Authorization: `Bearer ${session.access_token}` } };
}

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Owner dashboard — Ala-Too Adventures" },
      {
        name: "description",
        content:
          "Today's departures, upcoming bookings, guest counts, rescheduling and cancellations.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Owner dashboard — Ala-Too Adventures" },
      {
        property: "og:description",
        content: "Manage bookings, reschedules and cancellations in one place.",
      },
    ],
  }),
  component: Dashboard,
});

const tabs = ["Today", "Upcoming", "All"] as const;

function escapeCsv(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function downloadBookingsCsv(rows: Row[]) {
  const headings = [
    "Reference",
    "Status",
    "Tour",
    "Departure date",
    "Departure time",
    "Guests",
    "Total price",
    "Customer name",
    "Customer email",
    "Customer phone",
    "WhatsApp",
    "Notes",
    "Created at",
  ];
  const data = rows.map((row) =>
    [
      row.reference,
      row.status,
      row.tours.name,
      row.departures.departure_date,
      row.departures.departure_time,
      row.guests,
      row.total_price,
      row.customer_name,
      row.customer_email,
      row.customer_phone,
      row.customer_whatsapp ?? "",
      row.notes ?? "",
      row.created_at,
    ]
      .map(escapeCsv)
      .join(","),
  );
  const file = new Blob([[headings.map(escapeCsv).join(","), ...data].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ala-too-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function Dashboard() {
  const { language } = useI18n();
  const text = (english: string, russian: string, kyrgyz: string) =>
    localText(language, english, russian, kyrgyz);
  const [userId, setUserId] = useState<string>();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [sendingLink, setSendingLink] = useState(false);
  const membership = useQuery(adminMembershipQuery(userId));

  useEffect(() => {
    void (async () => {
      const { data: userResult } = await supabase.auth.getUser();
      setUserId(userResult.user?.id);
      setSessionChecked(true);
    })();
  }, []);

  async function sendMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSendingLink(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      toast.error(
        error.message ||
          text(
            "Couldn't send the sign-in link. Please try again.",
            "Не удалось отправить ссылку для входа. Попробуйте ещё раз.",
            "Кирүү шилтемесин жөнөтүү мүмкүн болгон жок. Кайра аракет кылыңыз.",
          ),
      );
    } else
      toast.success(
        text(
          "Check your email for the secure sign-in link.",
          "Проверьте почту: туда отправлена защищённая ссылка для входа.",
          "Электрондук почтаңызды текшериңиз: коопсуз кирүү шилтемеси жөнөтүлдү.",
        ),
      );
    setSendingLink(false);
  }

  if (!sessionChecked || (userId && membership.isLoading)) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }
  if (membership.data) return <OwnerDashboard />;

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="text-eyebrow">{text("Owner access", "Доступ владельца", "Ээсинин кирүүсү")}</p>
      <h1 className="mt-3 font-display text-5xl">
        {text("Private dashboard", "Закрытый кабинет", "Жеке кабинет")}
      </h1>
      {userId ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {text(
            "This account is not approved to access bookings.",
            "У этой учётной записи нет доступа к бронированиям.",
            "Бул аккаунтка брондоолорго кирүүгө уруксат берилген эмес.",
          )}
        </p>
      ) : (
        <form className="mt-6 space-y-3 text-left" onSubmit={sendMagicLink}>
          <label className="block text-sm font-semibold" htmlFor="owner-email">
            {text("Owner email", "Email владельца", "Ээсинин электрондук почтасы")}
          </label>
          <input
            id="owner-email"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
            placeholder="you@example.com"
          />
          <button
            type="submit"
            disabled={sendingLink}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            {sendingLink
              ? text("Sending…", "Отправляем…", "Жөнөтүлүүдө…")
              : text(
                  "Email me a sign-in link",
                  "Отправить ссылку для входа",
                  "Кирүү шилтемесин жөнөтүү",
                )}
          </button>
        </form>
      )}
    </div>
  );
}

function OwnerDashboard() {
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);
  const { t, language } = useI18n();
  const text = (english: string, russian: string, kyrgyz: string) =>
    localText(language, english, russian, kyrgyz);
  const fetchBookings = useServerFn(listDashboardBookings);
  const fetchEmergencyAudit = useServerFn(listEmergencyCancellationAudit);
  const fetchGuestMessages = useServerFn(listGuestBookingMessages);
  const runCancel = useServerFn(cancelBooking);
  const {
    data: bookings,
    isLoading,
    isError,
    error: bookingsError,
  } = useQuery({
    queryKey: ["dashboard-bookings"],
    queryFn: async () => fetchBookings(await ownerAuthHeaders()),
  });
  const emergencyAudit = useQuery({
    queryKey: ["emergency-cancellation-audit"],
    queryFn: async () => fetchEmergencyAudit(await ownerAuthHeaders()),
  });
  const guestMessages = useQuery({
    queryKey: ["guest-booking-messages"],
    queryFn: async () => fetchGuestMessages(await ownerAuthHeaders()),
  });
  const [tab, setTab] = useState<(typeof tabs)[number]>("Upcoming");
  const [rescheduling, setRescheduling] = useState<Row | null>(null);
  const [emergencyCancelling, setEmergencyCancelling] = useState<Row | null>(null);
  const [search, setSearch] = useState("");
  const [tourFilter, setTourFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["dashboard-bookings"] });
    void queryClient.invalidateQueries({ queryKey: ["emergency-cancellation-audit"] });
    void queryClient.invalidateQueries({ queryKey: ["guest-booking-messages"] });
    void queryClient.invalidateQueries({ queryKey: ["departures"] });
  };

  const cancel = useMutation({
    mutationFn: async (row: Row) =>
      runCancel({ data: { bookingId: row.id }, ...(await ownerAuthHeaders()) }),
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
      toast.success(text("Booking cancelled", "Бронирование отменено", "Брондоо жокко чыгарылды"));
      invalidate();
    },
    onError: () =>
      toast.error(
        text(
          "Couldn't cancel that booking.",
          "Не удалось отменить бронирование.",
          "Брондоону жокко чыгаруу мүмкүн болгон жок.",
        ),
      ),
  });

  const today = bishkekToday();
  const active = bookings?.filter((b) => b.status !== "cancelled") ?? [];
  const todays = active.filter((b) => b.departures.departure_date === today);
  const upcoming = active.filter((b) => b.departures.departure_date >= today);
  const guestsUpcoming = upcoming.reduce((sum, b) => sum + b.guests, 0);
  const tourOptions = useMemo(
    () =>
      [
        ...new Map((bookings ?? []).map((booking) => [booking.tours.id, booking.tours])).values(),
      ].sort((a, b) => a.sort_order - b.sort_order),
    [bookings],
  );
  const visible = useMemo(() => {
    const tabRows = tab === "Today" ? todays : tab === "Upcoming" ? upcoming : (bookings ?? []);
    const normalizedSearch = search.trim().toLowerCase();
    return tabRows.filter((row) => {
      const matchesSearch =
        !normalizedSearch ||
        [row.customer_name, row.customer_email, row.reference]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      return (
        matchesSearch &&
        (tourFilter === "all" || row.tour_id === tourFilter) &&
        (statusFilter === "all" || row.status === statusFilter) &&
        (!dateFilter || row.departures.departure_date === dateFilter)
      );
    });
  }, [bookings, dateFilter, search, statusFilter, tab, todays, tourFilter, upcoming]);
  const messagesByBooking = useMemo(() => {
    const byBooking = new Map<string, GuestBookingMessage[]>();
    for (const message of guestMessages.data ?? []) {
      const current = byBooking.get(message.booking_id) ?? [];
      current.push(message);
      byBooking.set(message.booking_id, current);
    }
    return byBooking;
  }, [guestMessages.data]);

  async function signOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-eyebrow">{t("ownerView")}</p>
          <h1 className="mt-3 font-display text-6xl">
            {text("Today at a glance", "Коротко о сегодняшнем дне", "Бүгүнкү күн кыскача")}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {text(
              "Demo data — bookings, guests and dates here are sample records.",
              "Демо-данные: бронирования, гости и даты здесь являются тестовыми записями.",
              "Демо-маалыматтар: бул жердеги брондоолор, коноктор жана даталар тесттик жазуулар.",
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          disabled={signingOut}
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? t("signingOut") : t("signOut")}
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat
          label={text("Departures today", "Выезды сегодня", "Бүгүнкү сапарлар")}
          value={todays.length}
        />
        <Stat
          label={text("Upcoming bookings", "Ближайшие бронирования", "Алдыдагы брондоолор")}
          value={upcoming.length}
        />
        <Stat
          label={text(
            "Guests booked ahead",
            "Забронировано гостей",
            "Алдын ала брондолгон коноктор",
          )}
          value={guestsUpcoming}
        />
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={
                t === tab
                  ? "rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                  : "rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
              }
            >
              {text(
                t,
                { Today: "Сегодня", Upcoming: "Ближайшие", All: "Все" }[t] ?? t,
                { Today: "Бүгүн", Upcoming: "Алдыдагы", All: "Баары" }[t] ?? t,
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={visible.length === 0}
          onClick={() => downloadBookingsCsv(visible)}
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          {text("Export CSV", "Скачать CSV", "CSV жүктөп алуу")}
        </button>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative block">
          <span className="sr-only">
            {text("Search bookings", "Поиск бронирований", "Брондоолорду издөө")}
          </span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
            placeholder={text(
              "Name, email or reference",
              "Имя, email или код",
              "Аты, email же код",
            )}
          />
        </label>
        <label>
          <span className="sr-only">{text("Tour", "Тур", "Тур")}</span>
          <select
            value={tourFilter}
            onChange={(event) => setTourFilter(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">{text("All tours", "Все туры", "Бардык турлар")}</option>
            {tourOptions.map((tour) => (
              <option key={tour.id} value={tour.id}>
                {localizeTour(tour, language).name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">{text("Status", "Статус", "Абалы")}</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">{text("All statuses", "Все статусы", "Бардык абалдар")}</option>
            <option value="confirmed">{text("Confirmed", "Подтверждено", "Тастыкталды")}</option>
            <option value="pending">{text("Pending", "Ожидает", "Күтүлүүдө")}</option>
            <option value="cancelled">{text("Cancelled", "Отменено", "Жокко чыгарылды")}</option>
          </select>
        </label>
        <label>
          <span className="sr-only">{text("Departure date", "Дата выезда", "Сапар күнү")}</span>
          <Input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            aria-label={text("Departure date", "Дата выезда", "Сапар күнү")}
          />
        </label>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))
          : null}

        {isError ? (
          <p className="text-sm text-destructive">
            {bookingsError instanceof Error
              ? bookingsError.message
              : text(
                  "Couldn't load bookings.",
                  "Не удалось загрузить бронирования.",
                  "Брондоолорду жүктөө мүмкүн болгон жок.",
                )}
          </p>
        ) : null}

        {!isLoading && visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="font-semibold">
              {text("Nothing here yet", "Пока здесь пусто", "Азырынча бул жерде эч нерсе жок")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {tab === "Today"
                ? text(
                    "No departures today — enjoy the morning.",
                    "Сегодня выездов нет — можно спокойно начать утро.",
                    "Бүгүн саякатка чыгуулар жок — таңды шашпай, жайбаракат баштасаңыз болот.",
                  )
                : text(
                    "New bookings will appear here as soon as they come in.",
                    "Новые бронирования появятся здесь сразу после оформления.",
                    "Жаңы брондоолор катталгандан кийин дароо бул жерде көрүнөт.",
                  )}
            </p>
          </div>
        ) : null}

        {visible.map((row) => {
          const changesClosed = !isBookingChangeAllowed(
            row.departures.departure_date,
            row.departures.departure_time,
          );
          const departed = hasDepartureStarted(
            row.departures.departure_date,
            row.departures.departure_time,
          );
          const actionsDisabled = row.status === "cancelled" || changesClosed;
          const emergencyCancellationAvailable =
            row.status !== "cancelled" &&
            isEmergencyCancellationAvailable(
              row.departures.departure_date,
              row.departures.departure_time,
            );

          return (
            <article key={row.id} className="surface-panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-3xl">
                      {localizeTour(row.tours, language).name}
                    </h2>
                    <StatusBadge status={row.status} />
                    <span className="rounded bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">
                      {text("Ref", "Код", "Код")} {displayBookingReference(row.reference)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      {formatDate(row.departures.departure_date, language)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-primary" /> {row.guests}{" "}
                      {guestLabel(row.guests, language)}
                    </span>
                    <span className="font-semibold text-foreground">${row.total_price}</span>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-semibold">{row.customer_name}</p>
                  <p className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /> {row.customer_email}
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {row.customer_phone}
                  </p>
                  {row.customer_whatsapp ? (
                    <p className="text-muted-foreground">WhatsApp: {row.customer_whatsapp}</p>
                  ) : null}
                </div>
              </div>

              {row.notes ? (
                <p className="mt-3 rounded-md bg-secondary p-3 text-sm text-secondary-foreground">
                  {row.notes}
                </p>
              ) : null}

              {messagesByBooking.get(row.id)?.length ? (
                <div className="mt-3 space-y-2 rounded-md border border-primary/25 bg-primary/5 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                    {text("Guest messages", "Сообщения гостя", "Коноктун билдирүүлөрү")}
                  </p>
                  {messagesByBooking.get(row.id)?.map((message) => (
                    <div
                      key={message.id}
                      className="border-t border-primary/15 pt-2 first:border-0 first:pt-0"
                    >
                      <p className="text-sm">{message.body}</p>
                      <time
                        className="mt-1 block text-xs text-muted-foreground"
                        dateTime={message.created_at}
                      >
                        {formatBishkekDateTime(message.created_at, language)}
                      </time>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  disabled={actionsDisabled}
                  onClick={() => setRescheduling(row)}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40"
                >
                  <RefreshCw className="h-4 w-4" />{" "}
                  {text("Reschedule", "Перенести", "Башка күнгө жылдыруу")}
                </button>
                <button
                  type="button"
                  disabled={actionsDisabled || cancel.isPending}
                  onClick={() => cancel.mutate(row)}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-destructive disabled:opacity-40"
                >
                  <X className="h-4 w-4" /> {text("Cancel", "Отменить", "Жокко чыгаруу")}
                </button>
                {changesClosed && row.status !== "cancelled" ? (
                  <>
                    <p className="w-full text-xs text-muted-foreground">
                      {text(
                        departed
                          ? "This trip has already departed."
                          : "Changes close 48 hours before departure.",
                        departed
                          ? "Этот тур уже начался."
                          : "Изменения закрываются за 48 часов до выезда.",
                        departed
                          ? "Бул тур башталып калды."
                          : "Өзгөртүүлөр сапарга 48 саат калганда жабылат.",
                      )}
                    </p>
                    {emergencyCancellationAvailable ? (
                      <button
                        type="button"
                        onClick={() => setEmergencyCancelling(row)}
                        className="inline-flex items-center gap-2 rounded-md border border-destructive/60 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        {text("Emergency cancel", "Экстренная отмена", "Шашылыш жокко чыгаруу")}
                      </button>
                    ) : null}
                  </>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <section
        className="mt-12 border-t border-border pt-10"
        aria-labelledby="emergency-audit-title"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-eyebrow">
              {text("Owner record", "Журнал владельца", "Ээсинин журналы")}
            </p>
            <h2 id="emergency-audit-title" className="mt-2 font-display text-4xl">
              {text(
                "Emergency cancellation log",
                "Журнал экстренных отмен",
                "Шашылыш жокко чыгаруу журналы",
              )}
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            {text(
              "Each exception records its reason and time. This is separate from regular cancellations.",
              "Для каждого исключения сохраняются причина и время. Это отдельный журнал от обычных отмен.",
              "Ар бир өзгөчө учурдун себеби жана убактысы сакталат. Бул кадимки жокко чыгаруулардан өзүнчө журнал.",
            )}
          </p>
        </div>
        <div className="mt-5 space-y-3">
          {emergencyAudit.isLoading ? <Skeleton className="h-28 rounded-xl" /> : null}
          {emergencyAudit.isError ? (
            <p className="text-sm text-destructive">
              {text(
                "Couldn't load the emergency cancellation log.",
                "Не удалось загрузить журнал экстренных отмен.",
                "Шашылыш жокко чыгаруу журналын жүктөө мүмкүн болгон жок.",
              )}
            </p>
          ) : null}
          {!emergencyAudit.isLoading &&
          !emergencyAudit.isError &&
          emergencyAudit.data?.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              {text(
                "No emergency cancellations have been recorded.",
                "Экстренных отмен пока не было.",
                "Азырынча шашылыш жокко чыгаруулар болгон жок.",
              )}
            </div>
          ) : null}
          {emergencyAudit.data?.map((entry: EmergencyCancellationAudit) => (
            <article key={entry.id} className="surface-panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {entry.bookings?.customer_name ??
                      text("Unknown guest", "Неизвестный гость", "Белгисиз конок")}
                    {" · "}
                    {entry.bookings?.reference
                      ? `${text("Ref", "Код", "Код")} ${displayBookingReference(entry.bookings.reference)}`
                      : text(
                          "Booking unavailable",
                          "Бронирование недоступно",
                          "Брондоо жеткиликсиз",
                        )}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {entry.bookings?.tours?.name
                      ? localizeTour(entry.bookings.tours as Tour, language).name
                      : "—"}
                    {entry.bookings?.departures?.departure_date
                      ? ` · ${formatDate(entry.bookings.departures.departure_date, language)}`
                      : ""}
                  </p>
                </div>
                <time className="text-sm text-muted-foreground" dateTime={entry.created_at}>
                  {formatBishkekDateTime(entry.created_at, language)}
                </time>
              </div>
              <p className="mt-4 rounded-md bg-secondary p-3 text-sm text-secondary-foreground">
                {entry.reason}
              </p>
            </article>
          ))}
        </div>
      </section>

      <RescheduleDialog
        row={rescheduling}
        onClose={() => setRescheduling(null)}
        onDone={invalidate}
      />
      <EmergencyCancelDialog
        row={emergencyCancelling}
        onClose={() => setEmergencyCancelling(null)}
        onDone={invalidate}
      />
    </div>
  );
}

function EmergencyCancelDialog({
  row,
  onClose,
  onDone,
}: {
  row: Row | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const { language } = useI18n();
  const text = (english: string, russian: string, kyrgyz: string) =>
    localText(language, english, russian, kyrgyz);
  const runEmergencyCancel = useServerFn(emergencyCancelBooking);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => setReason(""), [row?.id]);

  async function confirmEmergencyCancellation() {
    if (!row || reason.trim().length < 10) return;
    setSaving(true);
    try {
      const result = await runEmergencyCancel({
        data: { bookingId: row.id, reason: reason.trim() },
        ...(await ownerAuthHeaders()),
      });
      if (result.status === "cancelled") {
        toast.success(
          text(
            "Booking cancelled and the reason was recorded.",
            "Бронирование отменено, причина сохранена.",
            "Брондоо жокко чыгарылды, себеби сакталды.",
          ),
        );
        onDone();
      } else {
        toast.info(
          text(
            "This booking was already cancelled.",
            "Это бронирование уже отменено.",
            "Бул брондоо мурунтан эле жокко чыгарылган.",
          ),
        );
      }
      onClose();
    } catch {
      toast.error(
        text(
          "Couldn't cancel that booking in an emergency.",
          "Не удалось экстренно отменить бронирование.",
          "Брондоону шашылыш жокко чыгаруу мүмкүн болгон жок.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={Boolean(row)} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">
            {text("Emergency cancellation", "Экстренная отмена", "Шашылыш жокко чыгаруу")}
          </DialogTitle>
          <DialogDescription>
            {text(
              "Use this only for events such as unsafe weather, route closure, or an operator emergency. The reason is saved in the booking audit log.",
              "Используйте только при небезопасной погоде, закрытии маршрута или экстренной ситуации у организатора. Причина сохранится в журнале бронирования.",
              "Муну кооптуу аба ырайында, маршрут жабылганда же уюштуруучуда шашылыш жагдай болгондо гана колдонуңуз. Себеби брондоо журналына сакталат.",
            )}
          </DialogDescription>
        </DialogHeader>
        <div>
          <label htmlFor="emergency-cancel-reason" className="text-sm font-semibold">
            {text("Reason", "Причина", "Себеби")}
          </label>
          <Textarea
            id="emergency-cancel-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="mt-1.5"
            maxLength={500}
            placeholder={text(
              "e.g. Route closed because of severe weather",
              "например: маршрут закрыт из-за сильной непогоды",
              "мисалы: аба ырайы кескин начарлагандыктан маршрут жабылды",
            )}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            {text("At least 10 characters.", "Минимум 10 символов.", "Кеминде 10 белги.")}
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {text("Keep booking", "Оставить бронирование", "Брондоону калтыруу")}
          </button>
          <button
            type="button"
            onClick={confirmEmergencyCancellation}
            disabled={saving || reason.trim().length < 10}
            className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground disabled:opacity-50"
          >
            <AlertTriangle className="h-4 w-4" />
            {saving
              ? text("Cancelling…", "Отменяем…", "Жокко чыгарылууда…")
              : text("Emergency cancel", "Экстренно отменить", "Шашылыш жокко чыгаруу")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-panel p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-6xl">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { language } = useI18n();
  const tone =
    status === "cancelled"
      ? "bg-destructive/15 text-destructive"
      : status === "pending"
        ? "bg-warning/15 text-warning"
        : "bg-success/15 text-success";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${tone}`}>
      {localText(
        language,
        status,
        { confirmed: "подтверждено", pending: "ожидает", cancelled: "отменено" }[status] ?? status,
        { confirmed: "тастыкталды", pending: "күтүлүүдө", cancelled: "жокко чыгарылды" }[status] ??
          status,
      )}
    </span>
  );
}

function RescheduleDialog({
  row,
  onClose,
  onDone,
}: {
  row: Row | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const { language } = useI18n();
  const text = (english: string, russian: string, kyrgyz: string) =>
    localText(language, english, russian, kyrgyz);
  const { data: departures, isLoading } = useQuery(departuresQuery(row?.tour_id));
  const runReschedule = useServerFn(rescheduleBooking);
  const [saving, setSaving] = useState(false);

  async function move(target: Departure) {
    if (!row) return;
    setSaving(true);
    try {
      const result = await runReschedule({
        data: { bookingId: row.id, departureId: target.id },
        ...(await ownerAuthHeaders()),
      });
      if (result.status === "full") {
        toast.error(
          text(
            "That date no longer has enough spots.",
            "На этой дате больше недостаточно мест.",
            "Бул датага орун жетишсиз болуп калды.",
          ),
        );
      } else if (result.status === "closed") {
        toast.error(
          text(
            "Changes close 48 hours before departure.",
            "Изменения закрываются за 48 часов до выезда.",
            "Өзгөртүүлөр сапарга 48 саат калганда жабылат.",
          ),
        );
      } else {
        toast.success(
          text(
            `Moved to ${formatDate(target.departure_date, language)}`,
            `Перенесено на ${formatDate(target.departure_date, language)}`,
            `${formatDate(target.departure_date, language)} күнүнө жылдырылды`,
          ),
        );
        onDone();
        onClose();
      }
    } catch {
      toast.error(
        text(
          "Couldn't move that booking.",
          "Не удалось перенести это бронирование.",
          "Бул брондоону жылдыруу мүмкүн болгон жок.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={Boolean(row)} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">
            {text("Reschedule booking", "Перенести бронирование", "Брондоону башка күнгө жылдыруу")}
          </DialogTitle>
          <DialogDescription>
            {row
              ? `${row.customer_name} · ${row.guests} ${guestLabel(row.guests, language)} · ${localizeTour(row.tours, language).name}`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {isLoading ? <Skeleton className="h-16 w-full rounded-lg" /> : null}
          {departures
            ?.filter((d) => d.id !== row?.departure_id && spotsLeft(d) >= (row?.guests ?? 1))
            .map((d) => (
              <button
                key={d.id}
                type="button"
                disabled={saving}
                onClick={() => move(d)}
                className="flex w-full items-center justify-between rounded-lg border border-border p-4 text-left hover:border-primary/60 disabled:opacity-50"
              >
                <span className="font-semibold">{formatDate(d.departure_date, language)}</span>
                <span className="text-xs text-muted-foreground">
                  {spotsLeft(d)} {text("spots left", "мест осталось", "орун калды")}
                </span>
              </button>
            ))}
          {!isLoading && departures?.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {text(
                "No other dates available for this trip.",
                "Для этого тура нет других доступных дат.",
                "Бул тур үчүн башка жеткиликтүү күндөр жок.",
              )}
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
