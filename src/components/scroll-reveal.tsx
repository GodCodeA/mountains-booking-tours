import { type ReactNode, useEffect, useRef, useState } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

/**
 * Reveals a content section once as it approaches the viewport. The initial
 * server render remains visible, so content is never hidden when JavaScript
 * is unavailable. Motion-sensitive visitors see the final state immediately.
 */
export function ScrollReveal({ children, className, delayMs = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [usesScrollTimeline, setUsesScrollTimeline] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const element = ref.current;

    if (reduceMotion || !element || !("IntersectionObserver" in window)) {
      setIsReady(true);
      setIsVisible(true);
      return;
    }

    if (CSS.supports("animation-timeline: view()")) {
      setUsesScrollTimeline(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -15%", threshold: 0.1 },
    );

    setIsReady(true);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const revealState =
    !isReady || isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0";

  return (
    <div className="overflow-x-clip">
      <div
        ref={ref}
        className={
          usesScrollTimeline
            ? `${className ?? ""} scroll-reveal-scroll`.trim()
            : `${
                isReady
                  ? "motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out"
                  : ""
              } ${className ?? ""} ${revealState}`.trim()
        }
        style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
