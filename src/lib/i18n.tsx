import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "ru";

const copy = {
  en: {
    home: "Home",
    tours: "Tours",
    owner: "Owner",
    language: "Language",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    explore: "Explore",
    allTours: "All tours",
    ownerDashboard: "Owner dashboard",
    footerDescription:
      "Small-group mountain trips run out of Bishkek by a local team that knows these valleys.",
    contact: "Contact",
    demoNotice: "Demo prototype — tours, availability and bookings are fictional sample data.",
    bookingConfirmed: "Your booking is confirmed.",
    saveLink: "Save this link so you can return to these trip details anytime.",
    copyLink: "Copy confirmation link",
    linkCopied: "Link copied",
    browseTrips: "Browse more trips",
    reference: "Ref",
    guests: "guests",
    guest: "guest",
    totalPayable: "Total, payable on the day",
    ownerView: "Owner view",
    signOut: "Sign out",
    signingOut: "Signing out…",
    day: "day",
    days: "days",
    max: "max",
    next: "Next",
    spot: "spot",
    spots: "spots",
    left: "left",
    noOpenDates: "No open dates right now",
    from: "from",
    perPerson: "per person",
    viewTrip: "View trip",
  },
  ru: {
    home: "Главная",
    tours: "Туры",
    owner: "Кабинет",
    language: "Язык",
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    explore: "Выбрать тур",
    allTours: "Все туры",
    ownerDashboard: "Кабинет владельца",
    footerDescription:
      "Небольшие горные путешествия из Бишкека с местной командой, которая знает эти долины.",
    contact: "Контакты",
    demoNotice: "Демо-версия: туры, доступность и бронирования являются тестовыми данными.",
    bookingConfirmed: "Бронирование подтверждено.",
    saveLink: "Сохраните эту ссылку, чтобы в любой момент вернуться к деталям поездки.",
    copyLink: "Скопировать ссылку",
    linkCopied: "Ссылка скопирована",
    browseTrips: "Посмотреть другие туры",
    reference: "Код",
    guests: "гостей",
    guest: "гость",
    totalPayable: "Итого, оплата в день поездки",
    ownerView: "Кабинет владельца",
    signOut: "Выйти",
    signingOut: "Выходим…",
    day: "день",
    days: "дней",
    max: "макс.",
    next: "Ближайшая дата",
    spot: "место",
    spots: "места",
    left: "осталось",
    noOpenDates: "Сейчас нет свободных дат",
    from: "от",
    perPerson: "за человека",
    viewTrip: "Смотреть тур",
  },
} as const;

type CopyKey = keyof (typeof copy)["en"];
type I18nValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: CopyKey) => string;
};

const I18nContext = createContext<I18nValue | null>(null);
const STORAGE_KEY = "ala-too-language";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "ru") setLanguage(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = useMemo<I18nValue>(
    () => ({ language, setLanguage, t: (key) => copy[language][key] }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used within I18nProvider");
  return value;
}
