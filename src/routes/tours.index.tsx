import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Mountain, Search, SlidersHorizontal, X } from "lucide-react";

import { TourCard } from "@/components/tour-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { spotsLeft, toursQuery, upcomingDeparturesQuery, type Departure } from "@/lib/bookings";
import { localText, useI18n } from "@/lib/i18n";
import { localizeDifficulty, localizeRegion, localizeTour } from "@/lib/tour-localization";

export const Route = createFileRoute("/tours/")({
  head: () => ({
    meta: [
      { title: "All tours — Ala-Too Adventures" },
      {
        name: "description",
        content:
          "Search and filter Kyrgyz mountain trips by difficulty, length, price, region and open departure dates.",
      },
      { property: "og:title", content: "All tours — Ala-Too Adventures" },
      {
        property: "og:description",
        content: "Compare Kyrgyz mountain trips by region, difficulty, length and availability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ToursPage,
});

const DIFFICULTIES = ["Easy", "Moderate", "Challenging"];
const DURATIONS = ["all", "1", "2-3", "4+"] as const;
const SORTS = ["recommended", "price-asc", "price-desc", "duration"] as const;

type Filters = {
  difficulty: string;
  duration: string;
  category: string;
  price: [number, number];
  availableOnly: boolean;
};

function matchesDuration(days: number, d: string) {
  if (d === "1") return days === 1;
  if (d === "2-3") return days >= 2 && days <= 3;
  if (d === "4+") return days >= 4;
  return true;
}

function Pill({
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
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          : "rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      }
    >
      {children}
    </button>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-eyebrow mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function ToursPage() {
  const { language } = useI18n();
  const ru = language === "ru";
  const text = (english: string, russian: string, kyrgyz: string) =>
    localText(language, english, russian, kyrgyz);
  const toursQ = useQuery(toursQuery);
  const depsQ = useQuery(upcomingDeparturesQuery);
  const tours = useMemo(() => toursQ.data ?? [], [toursQ.data]);

  const priceBounds = useMemo<[number, number]>(() => {
    if (!tours.length) return [0, 0];
    const p = tours.map((t) => t.price_per_person);
    return [Math.min(...p), Math.max(...p)];
  }, [tours]);
  const categories = useMemo(() => [...new Set(tours.map((t) => t.region))].sort(), [tours]);

  const defaults: Filters = {
    difficulty: "all",
    duration: "all",
    category: "all",
    price: priceBounds,
    availableOnly: false,
  };

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [sort, setSort] = useState("recommended");
  const [filters, setFilters] = useState<Filters>(defaults);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Initialise price range once tours load.
  useEffect(() => {
    setFilters((f) => (f.price[1] === 0 ? { ...f, price: priceBounds } : f));
  }, [priceBounds]);

  // Next bookable departure per tour (open spots only).
  const nextByTour = useMemo(() => {
    const map = new Map<string, Departure>();
    for (const d of depsQ.data ?? []) {
      if (spotsLeft(d) > 0 && !map.has(d.tour_id)) map.set(d.tour_id, d);
    }
    return map;
  }, [depsQ.data]);
  const availabilityKnown = depsQ.isSuccess;

  const searched = useMemo(() => {
    if (!debounced) return tours;
    return tours.filter((original) => {
      const t = localizeTour(original, language);
      return [t.name, t.summary, t.description, t.region, t.difficulty, ...t.highlights]
        .join(" ")
        .toLowerCase()
        .includes(debounced);
    });
  }, [tours, debounced, language]);

  const durationLabel = (value: (typeof DURATIONS)[number]) =>
    ({
      all: text("Any length", "Любая длительность", "Каалаган узактык"),
      "1": text("Day trip", "1 день", "1 күн"),
      "2-3": text("2–3 days", "2–3 дня", "2–3 күн"),
      "4+": text("4+ days", "4+ дней", "4+ күн"),
    })[value];
  const sortLabel = (value: (typeof SORTS)[number]) =>
    ({
      recommended: text("Recommended", "Рекомендуемые", "Сунушталган"),
      "price-asc": text("Price: low to high", "Цена: по возрастанию", "Баа: арзандан кымбатка"),
      "price-desc": text("Price: high to low", "Цена: по убыванию", "Баа: кымбаттан арзанга"),
      duration: text("Duration: shortest first", "Сначала короткие", "Адегенде кыскасы"),
    })[value];

  const visible = useMemo(() => {
    const list = searched.filter(
      (t) =>
        (filters.difficulty === "all" || t.difficulty === filters.difficulty) &&
        matchesDuration(t.duration_days, filters.duration) &&
        (filters.category === "all" || t.region === filters.category) &&
        t.price_per_person >= filters.price[0] &&
        t.price_per_person <= filters.price[1] &&
        (!filters.availableOnly || !availabilityKnown || nextByTour.has(t.id)),
    );
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price_per_person - b.price_per_person);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price_per_person - a.price_per_person);
    else if (sort === "duration") sorted.sort((a, b) => a.duration_days - b.duration_days);
    else sorted.sort((a, b) => a.sort_order - b.sort_order);
    return sorted;
  }, [searched, filters, sort, nextByTour, availabilityKnown]);

  const activeCount =
    (filters.difficulty !== "all" ? 1 : 0) +
    (filters.duration !== "all" ? 1 : 0) +
    (filters.category !== "all" ? 1 : 0) +
    (filters.price[0] !== priceBounds[0] || filters.price[1] !== priceBounds[1] ? 1 : 0) +
    (filters.availableOnly ? 1 : 0);

  const resetAll = () => {
    setFilters({ ...defaults, price: priceBounds });
    setQuery("");
  };
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    setFilters((f) => ({ ...f, [k]: v }));

  const filterPanel = (
    <div className="space-y-7">
      <FilterGroup label={text("Difficulty", "Сложность", "Татаалдык")}>
        <Pill active={filters.difficulty === "all"} onClick={() => set("difficulty", "all")}>
          {text("All", "Все", "Баары")}
        </Pill>
        {DIFFICULTIES.map((d) => (
          <Pill key={d} active={filters.difficulty === d} onClick={() => set("difficulty", d)}>
            {localizeDifficulty(d, language)}
          </Pill>
        ))}
      </FilterGroup>
      <FilterGroup label={text("Duration", "Продолжительность", "Узактыгы")}>
        {DURATIONS.map((d) => (
          <Pill key={d} active={filters.duration === d} onClick={() => set("duration", d)}>
            {durationLabel(d)}
          </Pill>
        ))}
      </FilterGroup>
      <FilterGroup label={text("Region", "Регион", "Аймак")}>
        <Pill active={filters.category === "all"} onClick={() => set("category", "all")}>
          {text("All regions", "Все регионы", "Бардык аймактар")}
        </Pill>
        {categories.map((c) => (
          <Pill key={c} active={filters.category === c} onClick={() => set("category", c)}>
            {localizeRegion(c, language)}
          </Pill>
        ))}
      </FilterGroup>
      {priceBounds[1] > priceBounds[0] ? (
        <div>
          <p className="text-eyebrow mb-3">
            {text("Price per person", "Цена за человека", "Адамга баа")}: ${filters.price[0]} – $
            {filters.price[1]}
          </p>
          <Slider
            min={priceBounds[0]}
            max={priceBounds[1]}
            step={5}
            value={filters.price}
            onValueChange={(v) => set("price", [v[0], v[1]] as [number, number])}
            aria-label={text("Price range", "Диапазон цен", "Баа аралыгы")}
          />
        </div>
      ) : null}
      <FilterGroup label={text("Availability", "Доступность", "Жеткиликтүүлүк")}>
        <Pill active={!filters.availableOnly} onClick={() => set("availableOnly", false)}>
          {text("All tours", "Все туры", "Бардык турлар")}
        </Pill>
        <Pill active={filters.availableOnly} onClick={() => set("availableOnly", true)}>
          {text("Has open dates", "Есть свободные даты", "Бош даталар бар")}
        </Pill>
      </FilterGroup>
    </div>
  );

  const isLoading = toursQ.isLoading;
  const noDatesAnywhere = availabilityKnown && tours.length > 0 && nextByTour.size === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-eyebrow">
        {text("Trips for every pace", "Поездки в вашем темпе", "Ар бир темпке ылайык сапарлар")}
      </p>
      <h1 className="mt-3 font-display text-6xl sm:text-7xl">
        {text("Choose your mountains", "Выберите свои горы", "Өз тооңузду тандаңыз")}
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        {text(
          "Prices are per person and include transport from the meeting point, guiding and the meals listed on each trip.",
          "Цены указаны за человека и включают транспорт от места встречи, услуги гида и питание, указанное в описании тура.",
          "Баалар бир адамга көрсөтүлгөн жана жолугушуу жеринен транспортту, гид кызматын жана тур сүрөттөмөсүндө көрсөтүлгөн тамакты камтыйт.",
        )}
      </p>

      {/* Search + sort + mobile filter trigger */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={text(
              "Search tours, regions, lakes…",
              "Поиск туров, регионов, озёр…",
              "Турларды, аймактарды, көлдөрдү издөө…",
            )}
            aria-label={text("Search tours", "Поиск туров", "Турларды издөө")}
            className="h-11 pl-9 pr-9"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={text("Clear search", "Очистить поиск", "Издөөнү тазалоо")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <div className="flex gap-3">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger
              className="h-11 flex-1 sm:w-56"
              aria-label={text("Sort tours", "Сортировка туров", "Турларды иреттөө")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {sortLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-11 lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> {text("Filters", "Фильтры", "Чыпкалар")}
                {activeCount ? (
                  <span className="ml-1 rounded-full bg-primary px-2 text-xs text-primary-foreground">
                    {activeCount}
                  </span>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="font-display text-3xl">
                  {text("Filter tours", "Фильтры туров", "Тур чыпкалары")}
                </SheetTitle>
              </SheetHeader>
              <div className="px-4 py-2">{filterPanel}</div>
              <SheetFooter className="flex-row gap-3">
                <Button variant="outline" className="flex-1" onClick={resetAll}>
                  {text("Reset", "Сбросить", "Тазалоо")}
                </Button>
                <Button className="flex-1" onClick={() => setSheetOpen(false)}>
                  {text(
                    `Show ${visible.length} ${visible.length === 1 ? "tour" : "tours"}`,
                    `Показать: ${visible.length}`,
                    `Көрсөтүү: ${visible.length}`,
                  )}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            {filterPanel}
            {activeCount ? (
              <Button variant="ghost" size="sm" className="mt-6" onClick={resetAll}>
                {text("Reset filters", "Сбросить фильтры", "Чыпкаларды тазалоо")}
              </Button>
            ) : null}
          </div>
        </aside>

        <div>
          {!isLoading && !toursQ.isError ? (
            <p className="mb-4 text-sm text-muted-foreground">
              {text(
                `${visible.length} of ${tours.length} tours`,
                `Показано: ${visible.length} из ${tours.length}`,
                `${tours.length} турдун ${visible.length} көрсөтүлдү`,
              )}
            </p>
          ) : null}

          {noDatesAnywhere ? (
            <div className="mb-6 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              {text(
                "No departure dates are open right now. New dates are added regularly — check back soon.",
                "Сейчас нет свободных дат. Мы регулярно добавляем новые — загляните позже.",
                "Азыр бош даталар жок. Жаңы даталарды дайыма кошуп турабыз — кийинчерээк кириңиз.",
              )}
            </div>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[460px] rounded-xl" />
                ))
              : null}
            {visible.map((tour) => (
              <TourCard
                key={tour.id}
                tour={tour}
                showAvailability={availabilityKnown}
                nextDeparture={nextByTour.get(tour.id) ?? null}
              />
            ))}
          </div>

          {toursQ.isError ? (
            <p className="mt-8 text-sm text-destructive">
              {text(
                "We couldn't load the tours. Please refresh the page and try again.",
                "Не удалось загрузить туры. Обновите страницу и попробуйте снова.",
                "Турларды жүктөө мүмкүн болбоду. Баракты жаңыртып, кайра аракет кылыңыз.",
              )}
            </p>
          ) : null}

          {!isLoading && !toursQ.isError && tours.length > 0 && visible.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
              <Mountain className="h-10 w-10 text-primary" />
              <h2 className="mt-4 font-display text-3xl">
                {debounced && searched.length === 0
                  ? text(
                      `Nothing found for "${query.trim()}"`,
                      `Ничего не найдено: «${query.trim()}»`,
                      `«${query.trim()}» боюнча эч нерсе табылган жок`,
                    )
                  : text("No tours match", "Нет подходящих туров", "Ылайыктуу турлар жок")}
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {debounced && searched.length === 0
                  ? text(
                      "Try a tour name, a region like Issyk-Kul, or a word like lake or yurt.",
                      "Попробуйте название тура, регион, например Иссык-Куль, или слово «озеро» либо «юрта».",
                      "Турдун атын, Ысык-Көл сыяктуу аймакты же «көл», «боз үй» деген сөздөрдү издеп көрүңүз.",
                    )
                  : text(
                      "Try widening the price range or removing a filter.",
                      "Расширьте диапазон цен или уберите один из фильтров.",
                      "Баа аралыгын кеңейтип же бир чыпканы алып салыңыз.",
                    )}
              </p>
              <Button variant="outline" className="mt-6" onClick={resetAll}>
                {text(
                  "Clear search & filters",
                  "Очистить поиск и фильтры",
                  "Издөө менен чыпкаларды тазалоо",
                )}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
