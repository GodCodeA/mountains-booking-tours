import { useCallback, useEffect, useRef, useState } from "react";

import { type Tour } from "@/lib/bookings";
import { localText, useI18n } from "@/lib/i18n";
import { TourCard } from "@/components/tour-card";

const AUTO_ADVANCE_MS = 8_000;
const RESUME_AFTER_INTERACTION_MS = 7_000;
const SCROLL_DURATION_MS = 850;

const easeInOutCubic = (progress: number) =>
  progress < 0.5 ? 4 * progress * progress * progress : 1 - (-2 * progress + 2) ** 3 / 2;

/**
 * A deliberately calm, native-scroll carousel. Every card remains a real link,
 * which keeps the whole catalogue reachable without relying on autoplay.
 */
export function FeaturedTourCarousel({ tours }: { tours: Tour[] }) {
  const { language } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollAnimationRef = useRef<number | undefined>(undefined);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const text = (english: string, russian: string, kyrgyz: string) =>
    localText(language, english, russian, kyrgyz);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(
    () => () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      if (scrollAnimationRef.current) cancelAnimationFrame(scrollAnimationRef.current);
    },
    [],
  );

  const animateScrollTo = useCallback(
    (target: number) => {
      const track = trackRef.current;
      if (!track) return;

      if (scrollAnimationRef.current) cancelAnimationFrame(scrollAnimationRef.current);
      if (reduceMotion) {
        track.scrollLeft = target;
        return;
      }

      const start = track.scrollLeft;
      const distance = target - start;
      if (Math.abs(distance) < 1) return;
      const startedAt = performance.now();
      setIsAnimating(true);

      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / SCROLL_DURATION_MS);
        track.scrollLeft = start + distance * easeInOutCubic(progress);
        if (progress < 1) {
          scrollAnimationRef.current = requestAnimationFrame(tick);
        } else {
          scrollAnimationRef.current = undefined;
          setIsAnimating(false);
        }
      };

      scrollAnimationRef.current = requestAnimationFrame(tick);
    },
    [reduceMotion],
  );

  const scrollByCard = useCallback(
    (direction: 1 | -1) => {
      const track = trackRef.current;
      const card = track?.firstElementChild as HTMLElement | null;
      if (!track || !card) return;

      const gap = Number.parseFloat(getComputedStyle(track).columnGap || "0") || 0;
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      const target = Math.min(
        maxScroll,
        Math.max(0, track.scrollLeft + direction * (card.offsetWidth + gap)),
      );
      animateScrollTo(target);
    },
    [animateScrollTo],
  );

  const advance = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 8) {
      animateScrollTo(0);
      return;
    }
    scrollByCard(1);
  }, [animateScrollTo, scrollByCard]);

  const pauseForManualInteraction = () => {
    if (reduceMotion) return;
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = undefined;
      setIsAnimating(false);
    }
    setManualPause(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setManualPause(false), RESUME_AFTER_INTERACTION_MS);
  };

  useEffect(() => {
    if (reduceMotion || hovered || focused || manualPause || tours.length < 2) return;
    const interval = setInterval(advance, AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [advance, focused, hovered, manualPause, reduceMotion, tours.length]);

  return (
    <div
      data-testid="featured-tour-carousel"
      className="overflow-x-hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label={text("Featured tours", "Популярные туры", "Тандалган турлар")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div
        ref={trackRef}
        data-testid="featured-tour-track"
        onPointerDown={pauseForManualInteraction}
        onTouchStart={pauseForManualInteraction}
        className={`flex ${isAnimating ? "snap-none" : "snap-x snap-mandatory"} gap-6 overflow-x-auto pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      >
        {tours.map((tour, index) => (
          <div
            key={tour.id}
            className="w-[84%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
          >
            <TourCard tour={tour} deferImage={index > 1} />
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {text(
            `${tours.length} demo tours — pause on hover or swipe to explore.`,
            `${tours.length} демо-туров — наведите курсор или листайте свайпом.`,
            `${tours.length} демо-тур — курсорду алып барыңыз же свайп менен караңыз.`,
          )}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              pauseForManualInteraction();
              scrollByCard(-1);
            }}
            className="rounded-md border border-border px-3 py-2 text-sm font-semibold motion-safe:transition-[color,border-color,background-color,transform] motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 hover:border-primary hover:bg-secondary hover:text-primary"
          >
            {text("Previous", "Назад", "Артка")}
          </button>
          <button
            type="button"
            onClick={() => {
              pauseForManualInteraction();
              advance();
            }}
            className="rounded-md border border-border px-3 py-2 text-sm font-semibold motion-safe:transition-[color,border-color,background-color,transform] motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 hover:border-primary hover:bg-secondary hover:text-primary"
          >
            {text("Next", "Далее", "Кийинки")}
          </button>
        </div>
      </div>
    </div>
  );
}
