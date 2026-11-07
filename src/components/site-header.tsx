import { Link } from "@tanstack/react-router";
import { Mountain, Menu } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

const nav = [
  { to: "/", label: "home" },
  { to: "/tours", label: "tours" },
  { to: "/dashboard", label: "owner" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage, t } = useI18n();

  const languagePicker = (
    <div
      className="inline-flex items-center rounded-md border border-border p-0.5"
      aria-label={t("language")}
    >
      {(["en", "ru"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          className={`rounded px-2.5 py-1 text-xs font-bold transition-colors ${
            language === code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {code === "ru" ? "РУ" : "EN"}
        </button>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Mountain className="h-5 w-5" />
          </span>
          <span className="font-display text-2xl leading-none">Ala-Too Adventures</span>
        </Link>

        <nav className="hidden items-center gap-3 sm:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground shadow-sm" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {t(item.label)}
            </Link>
          ))}
          {languagePicker}
        </nav>

        <div className="flex items-center gap-2 sm:hidden">
          {languagePicker}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md border border-border p-2"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open ? (
        <nav className="flex flex-col border-t border-border px-4 pb-3 sm:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="w-fit rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground shadow-sm" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {t(item.label)}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
