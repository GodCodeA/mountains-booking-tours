import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

import { useI18n } from "@/lib/i18n";

const VISIBILITY_THRESHOLD = 480;

export function ScrollToTop() {
  const { language } = useI18n();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setIsVisible(window.scrollY > VISIBILITY_THRESHOLD);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const label = language === "ru" ? "Наверх" : language === "ky" ? "Жогору" : "Back to top";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      tabIndex={isVisible ? 0 : -1}
      onClick={() => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }}
      className={`fixed bottom-5 right-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-[var(--shadow-ridge)] backdrop-blur motion-safe:transition-[opacity,translate,scale] motion-safe:duration-300 motion-safe:ease-out hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:bottom-6 sm:right-6 ${
        isVisible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-3 scale-90 opacity-0"
      }`}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
