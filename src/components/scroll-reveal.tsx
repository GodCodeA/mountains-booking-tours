import { type ReactNode, useEffect, useRef, useState } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  direction?: "left" | "right";
};

/**
 * Reveals a content section once as it approaches the viewport. The initial
 * server render remains visible, so content is never hidden when JavaScript
 * is unavailable. Motion-sensitive visitors see the final state immediately.
 */
export function ScrollReveal({
  children,
  className,
  delayMs = 0,
  direction = "right",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const element = ref.current;

    if (reduceMotion || !element || !("IntersectionObserver" in window)) {
      setIsReady(true);
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );

    setIsReady(true);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const hiddenOffset = direction === "left" ? "-translate-x-6" : "translate-x-6";
  const revealState =
    !isReady || isVisible ? "translate-x-0 opacity-100" : `${hiddenOffset} opacity-0`;

  return (
    <div className={`${className ?? ""} overflow-x-clip`.trim()}>
      <div
        ref={ref}
        className={`${
          isReady
            ? "motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out"
            : ""
        } ${revealState}`.trim()}
        style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
