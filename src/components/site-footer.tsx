import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-3xl">Ala-Too Adventures</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{t("footerDescription")}</p>
        </div>
        <div className="text-sm">
          <p className="text-eyebrow">{t("explore")}</p>
          <div className="mt-3 flex flex-col gap-2 text-muted-foreground">
            <Link to="/tours" className="hover:text-foreground">
              {t("allTours")}
            </Link>
            <Link to="/dashboard" className="hover:text-foreground">
              {t("ownerDashboard")}
            </Link>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="text-eyebrow">{t("contact")}</p>
          <p className="mt-3">Bishkek, Kyrgyzstan</p>
          <p>WhatsApp +996 555 000 000</p>
          <p>hello@alatoo-adventures.example</p>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        {t("demoNotice")}
      </div>
    </footer>
  );
}
