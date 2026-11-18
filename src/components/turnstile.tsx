import { useEffect, useRef } from "react";

type TurnstileOptions = {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const scriptId = "cloudflare-turnstile-script";

type TurnstileProps = {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire: () => void;
  onError: () => void;
};

/**
 * Explicit rendering keeps the Cloudflare widget reliable in the multi-step
 * booking flow, where the form is mounted only on the final step.
 */
export function Turnstile({ siteKey, onVerify, onExpire, onError }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const callbacksRef = useRef({ onVerify, onExpire, onError });

  useEffect(() => {
    callbacksRef.current = { onVerify, onExpire, onError };
  }, [onVerify, onExpire, onError]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    const render = () => {
      if (disposed || !window.turnstile || !containerRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token) => callbacksRef.current.onVerify(token),
        "expired-callback": () => callbacksRef.current.onExpire(),
        "error-callback": () => callbacksRef.current.onError(),
      });
    };

    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    let script = existingScript;
    if (window.turnstile) {
      render();
    } else if (existingScript) {
      existingScript.addEventListener("load", render);
    } else {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", render);
      document.head.appendChild(script);
    }

    return () => {
      disposed = true;
      script?.removeEventListener("load", render);
      if (widgetIdRef.current) window.turnstile?.remove(widgetIdRef.current);
    };
  }, [siteKey]);

  return <div ref={containerRef} />;
}
