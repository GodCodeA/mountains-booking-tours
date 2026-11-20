import { useIsFetching } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

/**
 * A deliberately quiet loading signal. It waits briefly so instant navigations
 * do not flash, then completes before fading out once the route or its data is ready.
 */
export function NavigationProgress() {
  const isNavigating = useRouterState({ select: (state) => state.isLoading });
  const isFetching = useIsFetching() > 0;
  const pending = isNavigating || isFetching;
  const [visible, setVisible] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (pending) {
      setComplete(false);
      timer = setTimeout(() => setVisible(true), 180);
    } else if (visible) {
      setComplete(true);
      timer = setTimeout(() => {
        setVisible(false);
        setComplete(false);
      }, 260);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pending, visible]);

  return (
    <div
      data-testid="navigation-progress"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden transition-opacity duration-150 motion-reduce:transition-none ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`h-full origin-left bg-primary shadow-[0_0_14px_oklch(0.775_0.148_68_/_0.9)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
          complete ? "scale-x-100" : "scale-x-[0.72]"
        }`}
      />
    </div>
  );
}
